(()=>{'use strict';
const root=document.documentElement,KEY='macovi-theme',dismiss='macovi-install-dismissed';
const saved=localStorage.getItem(KEY);if(saved==='light'||saved==='dark')root.dataset.theme=saved;
const holder=document.createElement('div');holder.id='macovi-pwa-tools';holder.innerHTML='<button id="macovi-theme-toggle" type="button" aria-label="Alternar tema" title="Alternar modo claro/escuro">☀</button><section id="macovi-install-card" hidden aria-live="polite"><strong>Instala o MACOVI no teu telefone</strong><p id="macovi-install-message">Adiciona o site ao ecrã inicial para abrir mais rapidamente, como uma aplicação.</p><div id="macovi-install-actions"><button id="macovi-install-action" type="button">Instalar</button><button id="macovi-install-close" class="secondary" type="button">Agora não</button></div></section>';
document.body.appendChild(holder);

// Contactos e redes sociais no rodapé de todas as páginas públicas.
const footer=document.querySelector('footer.footer');
if(footer&&!footer.querySelector('.macovi-footer-social')){
 const socials=document.createElement('div');
 socials.className='macovi-footer-social';
 socials.innerHTML='<a class="macovi-footer-email" href="mailto:macovisportclub@gmail.com">macovisportclub@gmail.com</a><nav class="macovi-social-icons" aria-label="Redes sociais oficiais"><a href="https://www.tiktok.com/@macovisportcluboficial" target="_blank" rel="noopener noreferrer" aria-label="TikTok oficial MACOVI" title="TikTok"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.6 7.1a7.2 7.2 0 0 1-4.4-1.5v8.1a6.2 6.2 0 1 1-5.3-6.1v3.4a2.9 2.9 0 1 0 2 2.8V2h3.3c.2 2.1 1.9 3.8 4.4 4.1z"/></svg></a><a href="https://www.facebook.com/share/1dMBUfyU48/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook oficial MACOVI" title="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.2H7.6V13h2.7v8z"/></svg></a></nav>';
 footer.appendChild(socials);
}
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