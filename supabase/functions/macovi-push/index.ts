import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import webpush from "npm:web-push@3.6.7";

const ORIGIN = "https://bairro256.github.io";
const BASE = ORIGIN + "/macovi-sport-clube/";
const PUBLIC_KEY = "BPFhd8mlmI2_xZzw1-1xHHUEBY9Cxg54IAc0Qeaz84UhKGmb09Jqpx-lOTXB6O_4gMP9HoZAJJxZ9xnmxbBAVYs";
const corsHeaders = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});
function getKeys() {
  const publishable = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  const secret = Deno.env.get("SUPABASE_SECRET_KEYS");
  const anonKey = publishable ? JSON.parse(publishable).default : Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = secret ? JSON.parse(secret).default : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!anonKey || !serviceKey) throw new Error("Supabase function keys are not configured.");
  return { anonKey, serviceKey };
}
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (req.headers.get("origin") !== ORIGIN) return json({ error: "Origin not allowed" }, 403);
  try {
    const { anonKey, serviceKey } = getKeys();
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const body = await req.json();
    if (body?.action === "subscribe") {
      const sub = body?.subscription;
      const endpoint = String(sub?.endpoint || "");
      const p256dh = String(sub?.keys?.p256dh || "");
      const auth = String(sub?.keys?.auth || "");
      let parsed: URL;
      try { parsed = new URL(endpoint); } catch { return json({ error: "Invalid push endpoint." }, 400); }
      if (parsed.protocol !== "https:" || endpoint.length > 2048 || p256dh.length < 20 || auth.length < 10) {
        return json({ error: "Invalid push subscription." }, 400);
      }
      const now = new Date().toISOString();
      const { error } = await admin.from("macovi_push_subscriptions").upsert({
        endpoint, p256dh, auth, updated_at: now, last_seen_at: now,
      }, { onConflict: "endpoint" });
      if (error) throw error;
      return json({ ok: true, publicKey: PUBLIC_KEY });
    }
    if (body?.action === "unsubscribe") {
      const endpoint = String(body?.endpoint || "");
      if (!endpoint.startsWith("https://") || endpoint.length > 2048) return json({ error: "Invalid endpoint." }, 400);
      const { error } = await admin.from("macovi_push_subscriptions").delete().eq("endpoint", endpoint);
      if (error) throw error;
      return json({ ok: true });
    }
    if (body?.action === "notify-news") {
      const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      if (!token) return json({ error: "Authentication required." }, 401);
      const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data: userData, error: userError } = await authClient.auth.getUser(token);
      if (userError || !userData.user) return json({ error: "Invalid session." }, 401);
      const { data: profile, error: profileError } = await admin.from("profiles")
        .select("role,active").eq("user_id", userData.user.id).maybeSingle();
      if (profileError || profile?.role !== "senior_admin" || profile.active !== true) {
        return json({ error: "Only an active Senior Admin can publish notifications." }, 403);
      }
      const newsId = String(body?.news_id || "");
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(newsId)) {
        return json({ error: "Invalid news ID." }, 400);
      }
      const { data: news, error: newsError } = await admin.from("news")
        .select("id,title,summary,published,modality_id,modalities(slug)")
        .eq("id", newsId).maybeSingle();
      if (newsError || !news || news.published !== true) return json({ error: "Published news not found." }, 404);
      const { data: vapid, error: vapidError } = await admin.rpc("macovi_push_vapid_config");
      if (vapidError || !vapid?.publicKey || !vapid?.privateKey) throw new Error("VAPID configuration unavailable.");
      webpush.setVapidDetails(BASE, vapid.publicKey, vapid.privateKey);
      const mod = Array.isArray(news.modalities) ? news.modalities[0] : news.modalities;
      const slug = mod?.slug;
      const target = slug === "xadrez"
        ? BASE + "xadrez-noticias.html#noticia-" + news.id
        : slug
          ? BASE + "modalidade-noticias.html?m=" + encodeURIComponent(slug) + "#noticia-" + news.id
          : BASE + "#noticias-destaque";
      const payload = JSON.stringify({
        title: "MACOVI SPORT CLUB",
        body: String(news.title || "Nova notícia publicada") + (news.summary ? " — " + String(news.summary).slice(0, 100) : ""),
        url: target,
        tag: "macovi-news-" + news.id,
        icon: BASE + "assets/macovi.webp",
        badge: BASE + "assets/macovi.webp",
      });
      const { data: subscriptions, error: listError } = await admin
        .from("macovi_push_subscriptions").select("endpoint,p256dh,auth");
      if (listError) throw listError;
      let sent = 0, expired = 0, failed = 0;
      await Promise.all((subscriptions || []).map(async (row: { endpoint: string; p256dh: string; auth: string }) => {
        try {
          await webpush.sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, payload, { TTL: 86400 });
          sent++;
        } catch (error) {
          const status = Number((error as { statusCode?: number })?.statusCode || 0);
          if (status === 404 || status === 410) {
            await admin.from("macovi_push_subscriptions").delete().eq("endpoint", row.endpoint);
            expired++;
          } else {
            failed++;
            console.error("Push delivery failed", status, String(error));
          }
        }
      }));
      return json({ ok: true, sent, expired, failed, total: subscriptions?.length || 0 });
    }
    return json({ error: "Unknown action." }, 400);
  } catch (error) {
    console.error("MACOVI_PUSH_ERROR", error);
    return json({ error: "Não foi possível concluir a operação de notificações." }, 500);
  }
});
