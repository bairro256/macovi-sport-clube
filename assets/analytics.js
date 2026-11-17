import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.0';
const db = createClient('https://jblxmqoodtfhediqegar.supabase.co','sb_publishable_e9ohuqNh7BBIpTitCU0QmQ_6Lh7pHMY');
const CONSENT_KEY='macovi_analytics_consent_v1', SESSION_KEY='macovi_analytics_session_v1';
const makeId=()=>{try{return crypto.randomUUID()}catch{return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&3|8)).toString(16)})}};
let sessionId;try{sessionId=localStorage.getItem(SESSION_KEY)||makeId();localStorage.setItem(SESSION_KEY,sessionId)}catch{sessionId=makeId()}
const safePath=()=>{const p=new URL(location.href);const m=p.searchParams.get('m');return p.pathname+(m?'?m='+encodeURIComponent(m):'')};
const modality=()=>new URLSearchParams(location.search).get('m')||'';
const referrer=()=>{try{const host=document.referrer?new URL(document.referrer).hostname:'';return host&&host!==location.hostname?host:''}catch{return ''}};
let enabled=false;
function record(eventType,extra={}) {
 if(!enabled)return;
 const payload={
  p_event_type:eventType,p_session_id:sessionId,p_page_path:safePath(),
  p_page_title:document.title,p_modality_slug:modality(),
  p_video_id:extra.videoId||null,p_referrer_host:eventType==='page_view'?referrer():null,
  p_event_data:extra.data||{}
 };
 db.rpc('macovi_track_event',payload).then(({error})=>{if(error)console.warn('MACOVI analytics:',error.message)});
}
function showConsent(){
 if(document.getElementById('macoviAnalyticsConsent'))return;
 const box=document.createElement('aside');box.id='macoviAnalyticsConsent';
 box.innerHTML='<div><strong>Ajuda a melhorar o site da MACOVI</strong><p>Podemos recolher estatísticas anónimas de visitas, interacções e reprodução de vídeos. Não recolhemos nomes, e-mails nem a localização exacta.</p></div><div class="macovi-consent-actions"><button type="button" data-choice="yes">Aceitar estatísticas</button><button type="button" data-choice="no">Recusar</button></div>';
 const style=document.createElement('style');style.textContent='#macoviAnalyticsConsent{position:fixed;z-index:99999;left:16px;right:16px;bottom:16px;max-width:760px;margin:auto;padding:16px 18px;background:#071b13;color:#f4f7f4;border:1px solid rgba(25,200,117,.55);border-radius:12px;box-shadow:0 16px 50px #0008;display:flex;align-items:center;justify-content:space-between;gap:16px;font:13px/1.5 Arial,sans-serif}#macoviAnalyticsConsent strong{font-size:14px}#macoviAnalyticsConsent p{margin:4px 0 0;color:#b9c9c0;font-size:12px}.macovi-consent-actions{display:flex;gap:8px;flex-wrap:wrap}.macovi-consent-actions button{padding:10px 12px;border-radius:6px;border:1px solid #19c875;background:#00a85a;color:#04170e;font-weight:800;font-size:11px;cursor:pointer}.macovi-consent-actions button[data-choice=no]{background:transparent;color:#f4f7f4;border-color:#71877a}@media(max-width:600px){#macoviAnalyticsConsent{display:block} .macovi-consent-actions{margin-top:10px}}';
 document.head.append(style);document.body.append(box);
 box.addEventListener('click',e=>{const choice=e.target.closest('[data-choice]')?.dataset.choice;if(!choice)return;try{localStorage.setItem(CONSENT_KEY,choice)}catch{}box.remove();if(choice==='yes')startTracking()});
}
const videoState=new WeakMap();
function videoInfo(video){
 const articleId=video.closest('article')?.id?.replace(/^noticia-/,'');
 const id=video.dataset.videoId||video.dataset.newsId||articleId||video.getAttribute('src')||video.currentSrc||'video-sem-id';
 const title=video.dataset.videoTitle||video.getAttribute('aria-label')||video.closest('article,section')?.querySelector('h2,h3,strong')?.textContent?.trim()||'Vídeo da MACOVI';
 return {id:String(id).split('?')[0].slice(-220),title:title.slice(0,150)};
}
function startTracking(){
 if(enabled)return;enabled=true;
 record('page_view');
 document.addEventListener('click',e=>{
  const el=e.target.closest('a,button,[role="button"]');if(!el)return;
  const label=(el.innerText||el.getAttribute('aria-label')||el.getAttribute('title')||'Interacção').trim().replace(/\s+/g,' ').slice(0,100);
  let type='click',href=el.href||'';
  if(href){try{if(new URL(href,location.href).hostname!==location.hostname)type='outbound_click'}catch{}}
  record(type,{data:{label}});
 },true);
 document.addEventListener('submit',e=>{const form=e.target;if(form instanceof HTMLFormElement)record('form_submit',{data:{form_id:(form.id||'form').slice(0,80)}})},true);
 document.addEventListener('play',e=>{
  const v=e.target;if(!(v instanceof HTMLVideoElement))return;
  if(videoState.has(v))return;
  const info=videoInfo(v);videoState.set(v,{...info,marks:new Set()});
  record('video_start',{videoId:info.id,data:{video_title:info.title,duration:Math.round(v.duration||0)}});
 },true);
 document.addEventListener('timeupdate',e=>{
  const v=e.target;if(!(v instanceof HTMLVideoElement)||!videoState.has(v)||!Number.isFinite(v.duration)||v.duration<=0)return;
  const state=videoState.get(v),pct=v.currentTime/v.duration;
  for(const n of [25,50,75])if(pct>=n/100&&!state.marks.has(n)){state.marks.add(n);record('video_'+n,{videoId:state.id,data:{video_title:state.title}})}
 },true);
 document.addEventListener('ended',e=>{
  const v=e.target;if(!(v instanceof HTMLVideoElement))return;
  const state=videoState.get(v);if(state&&!state.marks.has(100)){state.marks.add(100);record('video_complete',{videoId:state.id,data:{video_title:state.title,duration:Math.round(v.duration||0)}})}
 },true);
}
let consent='';try{consent=localStorage.getItem(CONSENT_KEY)||''}catch{}
if(consent==='yes')startTracking();else if(consent!=='no')showConsent();
