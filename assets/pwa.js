(()=>{'use strict';
const root=document.documentElement,KEY='macovi-theme',dismiss='macovi-install-dismissed';
const saved=localStorage.getItem(KEY);if(saved==='light'||saved==='dark')root.dataset.theme=saved;
const holder=document.createElement('div');holder.id='macovi-pwa-tools';holder.innerHTML='<button id="macovi-theme-toggle" type="button" aria-label="Alternar tema" title="Alternar modo claro/escuro">☀</button><section id="macovi-install-card" hidden aria-live="polite"><strong>Instala o MACOVI no teu telefone</strong><p id="macovi-install-message">Adiciona o site ao ecrã inicial para abrir mais rapidamente, como uma aplicação.</p><div id="macovi-install-actions"><button id="macovi-install-action" type="button">Instalar</button><button id="macovi-install-close" class="secondary" type="button">Agora não</button></div></section>';
document.body.appendChild(holder);
const themeButton=holder.querySelector('#macovi-theme-toggle');
function syncTheme(){const light=root.dataset.theme==='light';themeButton.textContent=light?'☾':'☀';themeButton.setAttribute('aria-label',light?'Activar modo escuro':'Activar modo claro');document.querySelector('meta[name="theme-color"]')?.setAttribute('content',light?'#f4f7f4':'#061c16')}
themeButton.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='light'?'dark':'light';localStorage.setItem(KEY,root.dataset.theme);syncTheme()});syncTheme();
let installPrompt=null;const card=holder.querySelector('#macovi-install-card'),msg=holder.querySelector('#macovi-install-message'),action=holder.querySelector('#macovi-install-action');
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function showInstall(){if(!standalone()&&!localStorage.getItem(dismiss))card.hidden=false}
if(!standalone())setTimeout(showInstall,4500);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;action.hidden=false;msg.textContent='Instala a aplicação MACOVI no ecrã inicial para um acesso rápido.';showInstall()});
const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)&&!window.MSStream;
if(ios&&!standalone()){action.textContent='Como instalar';msg.textContent='No Safari, toca em Partilhar e escolhe “Adicionar ao ecrã principal”.';showInstall()}
action.addEventListener('click',async()=>{if(ios){msg.textContent='1. Toca no botão Partilhar do Safari. 2. Escolhe “Adicionar ao ecrã principal”. 3. Confirma em Adicionar.';action.hidden=true;return}if(!installPrompt){msg.textContent='No menu do navegador, escolhe “Instalar aplicação” ou “Adicionar ao ecrã inicial”.';action.hidden=true;return}installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;card.hidden=true});
holder.querySelector('#macovi-install-close').addEventListener('click',()=>{card.hidden=true;localStorage.setItem(dismiss,'1')});
window.addEventListener('appinstalled',()=>{card.hidden=true;localStorage.setItem(dismiss,'1')});
if('serviceWorker'in navigator&&location.protocol==='https:'){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('MACOVI offline:',err)))}
})();