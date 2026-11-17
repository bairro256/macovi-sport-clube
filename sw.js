const CACHE='macovi-shell-v3';const CORE=['./','./index.html','./manifest.webmanifest','./assets/pwa.css','./assets/pwa.js','./assets/app-icon.svg','./assets/macovi.webp'];self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}return response}).catch(()=>caches.match(req).then(cached=>cached||caches.match('./index.html'))))});
self.addEventListener('push',event=>{
 let data={};
 try{data=event.data?event.data.json():{};}catch{data={body:event.data?.text()||'Há uma nova notícia no Macovi Sport Club.'};}
 const title=data.title||'MACOVI SPORT CLUB';
 const options={body:data.body||'Foi publicada uma nova notícia.',icon:data.icon||'./assets/macovi.webp',badge:data.badge||'./assets/macovi.webp',tag:data.tag||'macovi-news',data:{url:data.url||'./index.html#noticias-destaque'},renotify:false};
 event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const target=new URL(event.notification.data?.url||'./index.html#noticias-destaque',self.registration.scope).href;
 event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
  for(const client of list){if('focus' in client){client.navigate(target);return client.focus();}}
  return clients.openWindow(target);
 }));
});
