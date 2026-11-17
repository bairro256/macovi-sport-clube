(()=>{'use strict';
const root=document.documentElement,KEY='macovi-theme',dismiss='macovi-install-dismissed';
const saved=localStorage.getItem(KEY);if(saved==='light'||saved==='dark')root.dataset.theme=saved;
const holder=document.createElement('div');holder.id='macovi-pwa-tools';holder.innerHTML='<button id="macovi-theme-toggle" type="button" aria-label="Alternar tema" title="Alternar modo claro/escuro">☀</button><button id="macovi-push-open" type="button" aria-label="Notificações de notícias">🔔 Notícias</button><section id="macovi-push-card" hidden aria-live="polite"><strong>Notícias do MACOVI</strong><p id="macovi-push-message">Recebe um aviso sempre que uma nova notícia for publicada.</p><div id="macovi-push-actions"><button id="macovi-push-enable" type="button">Activar notificações</button><button id="macovi-push-disable" class="secondary" type="button" hidden>Desactivar</button><button id="macovi-push-close" class="secondary" type="button">Fechar</button></div></section><section id="macovi-install-card" hidden aria-live="polite"><strong>Instala o MACOVI no teu telefone</strong><p id="macovi-install-message">Adiciona o site ao ecrã inicial para abrir mais rapidamente, como uma aplicação.</p><div id="macovi-install-actions"><button id="macovi-install-action" type="button">Instalar</button><button id="macovi-install-close" class="secondary" type="button">Agora não</button></div></section>';
document.body.appendChild(holder);

// Contactos e redes sociais no rodapé de todas as páginas públicas.
const footer=document.querySelector('footer.footer');
if(footer&&!footer.querySelector('.macovi-footer-social')){
 const socials=document.createElement('div');
 socials.className='macovi-footer-social';
 socials.innerHTML='<a class="macovi-footer-email" href="mailto:macovisportclub@gmail.com">macovisportclub@gmail.com</a><nav class="macovi-social-icons" aria-label="Redes sociais oficiais"><a href="https://www.tiktok.com/@macovisportcluboficial" target="_blank" rel="noopener noreferrer" aria-label="TikTok oficial MACOVI" title="TikTok"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.6 7.1a7.2 7.2 0 0 1-4.4-1.5v8.1a6.2 6.2 0 1 1-5.3-6.1v3.4a2.9 2.9 0 1 0 2 2.8V2h3.3c.2 2.1 1.9 3.8 4.4 4.1z"/></svg></a><a href="https://www.facebook.com/share/1dMBUfyU48/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook oficial MACOVI" title="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.2H7.6V13h2.7v8z"/></svg></a></nav>';
 footer.appendChild(socials);
}

// Notificações Web Push: o visitante escolhe quando subscrever e pode cancelar.
const pushOpen=holder.querySelector('#macovi-push-open'),pushCard=holder.querySelector('#macovi-push-card'),pushMessage=holder.querySelector('#macovi-push-message'),pushEnable=holder.querySelector('#macovi-push-enable'),pushDisable=holder.querySelector('#macovi-push-disable');
const pushPublicKey='BMD9IOa4yS76tGzlMXM1T-OLBDxBW09BTaM7Y96ZVWh_YRn-pIvXNxjkrj134yVmLVsCo-l6r701P6PTx9_s1BI';
const pushFunction='https://jblxmqoodtfhediqegar.supabase.co/functions/v1/macovi-push';
const pushApiKey='sb_publishable_e9ohuqNh7BBIpTitCU0QmQ_6Lh7pHMY';
function pushBytes(value){const pad='='.repeat((4-value.length%4)%4),raw=atob((value+pad).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from([...raw].map(ch=>ch.charCodeAt(0)));}
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)&&!window.MSStream;
const pushStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
async function pushRequest(payload){const response=await fetch(pushFunction,{method:'POST',headers:{'Content-Type':'application/json','apikey':pushApiKey},body:JSON.stringify(payload)});const data=await response.json().catch(()=>({}));if(!response.ok||!data.ok)throw new Error(data.error||'Não foi possível concluir a operação.');return data;}
async function refreshPushControls(){
 if(isIOS&&!pushStandalone()){pushOpen.hidden=false;pushEnable.disabled=true;pushMessage.textContent='No iPhone ou iPad, adiciona primeiro o Macovi ao ecrã principal e abre a aplicação instalada para activar notificações.';return;}
 if(!('serviceWorker'in navigator)||!('Notification'in window)||!('PushManager'in window)){pushOpen.hidden=true;return;}
 pushOpen.hidden=false;
 try{
  const reg=await navigator.serviceWorker.ready,sub=await reg.pushManager.getSubscription();
  if(sub){
   pushEnable.hidden=true;pushDisable.hidden=false;pushOpen.textContent='🔔 Activas';
   pushMessage.textContent=Notification.permission==='denied'?'A autorização foi bloqueada nas definições. Podes cancelar esta subscrição aqui.':'Notificações activadas neste dispositivo. Vais receber avisos sempre que houver novas notícias.';
  }else{
   pushEnable.hidden=false;pushDisable.hidden=true;pushOpen.textContent='🔔 Notícias';
   if(Notification.permission==='denied'){pushEnable.disabled=true;pushMessage.textContent='As notificações estão bloqueadas nas definições do navegador. Podes voltar a activá-las nas definições do dispositivo.';}
   else{pushEnable.disabled=false;pushMessage.textContent='Activa as notificações para receberes avisos de novas notícias do Macovi.';}
  }
 }catch(error){console.warn('MACOVI_PUSH_STATUS',error);pushMessage.textContent='Não foi possível verificar as notificações neste navegador.';}
}
pushOpen.addEventListener('click',()=>{pushCard.hidden=!pushCard.hidden;if(!pushCard.hidden)refreshPushControls();});
holder.querySelector('#macovi-push-close').addEventListener('click',()=>{pushCard.hidden=true;});
pushEnable.addEventListener('click',async()=>{
 pushEnable.disabled=true;pushMessage.textContent='A preparar as notificações…';
 try{
  if(isIOS&&!pushStandalone())throw new Error('No iPhone/iPad, adiciona primeiro o site ao ecrã principal e abre a aplicação instalada.');
  const permission=Notification.permission==='granted'?'granted':await Notification.requestPermission();
  if(permission!=='granted')throw new Error(permission==='denied'?'A autorização foi recusada. Podes alterá-la nas definições do navegador.':'A autorização não foi concedida.');
  const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
  if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushBytes(pushPublicKey)});
  await pushRequest({action:'subscribe',subscription:sub.toJSON()});
  pushMessage.textContent='Notificações activadas com sucesso neste dispositivo.';await refreshPushControls();
 }catch(error){console.error('MACOVI_PUSH_SUBSCRIBE',error);pushMessage.textContent=error?.message||'Não foi possível activar as notificações.';pushEnable.disabled=false;}
});
pushDisable.addEventListener('click',async()=>{
 pushDisable.disabled=true;pushMessage.textContent='A desactivar notificações…';
 try{const reg=await navigator.serviceWorker.ready,sub=await reg.pushManager.getSubscription();if(sub){await pushRequest({action:'unsubscribe',endpoint:sub.endpoint});await sub.unsubscribe();}pushMessage.textContent='Notificações desactivadas neste dispositivo.';}
 catch(error){console.error('MACOVI_PUSH_UNSUBSCRIBE',error);pushMessage.textContent='Não foi possível desactivar completamente. Tenta novamente.';}
 finally{pushDisable.disabled=false;await refreshPushControls();}
});
refreshPushControls();

const themeButton=holder.querySelector('#macovi-theme-toggle');
function syncTheme(){const light=root.dataset.theme==='light';themeButton.textContent=light?'☾':'☀';themeButton.setAttribute('aria-label',light?'Activar modo escuro':'Activar modo claro');document.querySelector('meta[name="theme-color"]')?.setAttribute('content',light?'#f4f7f4':'#061c16')}
themeButton.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='light'?'dark':'light';localStorage.setItem(KEY,root.dataset.theme);syncTheme()});syncTheme();
let installPrompt=null;const card=holder.querySelector('#macovi-install-card'),msg=holder.querySelector('#macovi-install-message'),action=holder.querySelector('#macovi-install-action');
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function showInstall(){if(!standalone()&&!localStorage.getItem(dismiss))card.hidden=false}
if(!standalone())setTimeout(showInstall,4500);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;action.hidden=false;action.textContent='Instalar agora';msg.textContent='Instala a aplicação MACOVI directamente no teu telefone.';showInstall()});
const ua=navigator.userAgent;
const ios=/iphone|ipad|ipod/i.test(ua)&&!window.MSStream;
const android=/android/i.test(ua);
if(ios&&!standalone()){action.textContent='Como instalar';msg.textContent='No Safari, toca em Partilhar e escolhe “Adicionar ao ecrã principal”.';showInstall()}
if(android&&!standalone()){action.textContent=installPrompt?'Instalar agora':'Como instalar';msg.textContent=installPrompt?'Instala a aplicação MACOVI directamente no teu Android.':'No Chrome, abre o menu ⋮ e escolhe “Instalar aplicação” ou “Adicionar ao ecrã principal”. No Samsung Internet, abre ☰, escolhe “Adicionar página a” e depois “Ecrã inicial”.';showInstall()}
action.addEventListener('click',async()=>{if(ios){msg.textContent='1. Toca no botão Partilhar do Safari. 2. Escolhe “Adicionar ao ecrã principal”. 3. Confirma em Adicionar.';action.hidden=true;return}if(android&&!installPrompt){msg.textContent='CHROME: 1. Toca nos três pontos ⋮ no canto superior. 2. Escolhe “Instalar aplicação” ou “Adicionar ao ecrã principal”. 3. Confirma.\n\nSAMSUNG INTERNET: 1. Abre o menu ☰. 2. Escolhe “Adicionar página a”. 3. Selecciona “Ecrã inicial”.';action.hidden=true;return}if(!installPrompt){msg.textContent='Abre o menu do navegador e procura “Instalar aplicação” ou “Adicionar ao ecrã principal”.';action.hidden=true;return}installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;card.hidden=true});
holder.querySelector('#macovi-install-close').addEventListener('click',()=>{card.hidden=true;localStorage.setItem(dismiss,'1')});
window.addEventListener('appinstalled',()=>{card.hidden=true;localStorage.setItem(dismiss,'1')});
if('serviceWorker'in navigator&&location.protocol==='https:'){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('MACOVI offline:',err)))}
})();