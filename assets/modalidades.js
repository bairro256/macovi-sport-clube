import{createClient}from'https://esm.sh/@supabase/supabase-js@2.95.0';
const db=createClient('https://jblxmqoodtfhediqegar.supabase.co','sb_publishable_e9ohuqNh7BBIpTitCU0QmQ_6Lh7pHMY');
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search),slug=params.get('m')||'',page=document.body.dataset.page;
const names={'andebol-feminino':'Andebol Feminino','futsal-feminino':'Futsal Feminino','futsal-masculino':'Futsal Masculino','basquetebol':'Basquetebol'};
const intros={'andebol-feminino':'Força, velocidade, inteligência de jogo e espírito colectivo. Descobre o percurso do Andebol Feminino Macovi.','futsal-feminino':'Talento, técnica, coragem e união dentro de campo. Conhece o Futsal Feminino Macovi.','futsal-masculino':'Ritmo, estratégia e compromisso colectivo. Acompanha o percurso do Futsal Masculino Macovi.','basquetebol':'Precisão, disciplina e espírito de equipa. Entra no universo do Basquetebol Macovi.'};
const title=names[slug]||'Modalidade Macovi',base='modalidade',links=[['Início',base+'.html','home'],['Notícias',base+'-noticias.html','noticias'],['Escola e treinos',base+'-escola.html','escola'],['Salas de treino',base+'-salas.html','salas'],['Atletas',base+'-atletas.html','atletas'],['Conquistas',base+'-conquistas.html','conquistas'],['História',base+'-historia.html','historia']];
const url=p=>p+'?m='+encodeURIComponent(slug),date=v=>v?new Date(v).toLocaleDateString('pt-AO'):'Data por confirmar',img=p=>p?db.storage.from('macovi-photos').getPublicUrl(p).data.publicUrl:null,empty=t=>'<div class="empty">'+t+'</div>';
if(!names[slug]){$('#content')?.replaceChildren(Object.assign(document.createElement('p'),{textContent:'Modalidade não identificada. Volta à página principal do clube.'}));}
else{
 document.title=title+' | MACOVI SPORT CLUB';$('#modName').textContent=title;$('#modName2').textContent=title;$('#heroModName')&&($('#heroModName').textContent=title);$('#intro').textContent=intros[slug];
 $('#mainLinks').innerHTML='<a class="back-modalities" href="index.html#modalidades">← Todas as modalidades</a>'+links.map(([label,path,key])=>'<a href="'+url(path)+'" '+(page===key?'class="active"':'')+'>'+label+'</a>').join('');
 $('#menuButton').addEventListener('click',()=>$('#mainLinks').classList.toggle('open'));
 $('#brandHome').href=url('modalidade.html');document.querySelectorAll('a[href^="modalidade"]').forEach(a=>{const target=a.getAttribute('href').split('?')[0];a.href=url(target)});
 const mr=await db.from('modalities').select('id').eq('slug',slug).eq('active',true).maybeSingle();
 let athletes=[],coaches=[],events=[],matches=[],standings=[],articles=[];
 if(mr.data){
  const id=mr.data.id;
  const queries=await Promise.all([
   db.from('athletes').select('full_name,age_group,photo_path,sport_role,jersey_number,height_cm,display_order').eq('modality_id',id).eq('active',true).order('display_order').order('full_name'),
   db.from('coaches').select('full_name,age_group,role_title,photo_path').eq('modality_id',id).eq('active',true).order('full_name'),
   db.from('events').select('age_group,title,event_type,venue,starts_at,ends_at,description').eq('modality_id',id).eq('published',true).order('starts_at',{ascending:false}),
   db.from('matches').select('age_group,opponent,competition,venue,starts_at,macovi_score,opponent_score,result,notes').eq('modality_id',id).eq('published',true).order('starts_at',{ascending:false}),
   db.from('standings').select('age_group,competition,team_name,played,wins,draws,losses,points,position,season').eq('modality_id',id).eq('published',true).order('position'),
   db.from('news').select('id,title,category,summary,body,image_path,video_path,published_at,created_at').eq('published',true).eq('modality_id',id).order('published_at',{ascending:false})
  ]);
  [athletes,coaches,events,matches,standings,articles]=queries.map(q=>q.data||[]);
  queries.forEach(q=>{if(q.error)console.warn('Dados públicos da modalidade:',q.error.message)});
 }
 const allNews=articles.map(a=>({id:a.id,type:a.category||'Notícia',title:a.title,summary:a.summary||a.body,when:a.published_at||a.created_at,image:img(a.image_path),video:img(a.video_path)})).sort((a,b)=>new Date(b.when||0)-new Date(a.when||0));
 const newsHTML=arr=>arr.length?arr.map(n=>'<article id="noticia-'+esc(n.id)+'" class="news-card">'+(n.video?'<video controls playsinline preload="metadata"'+(n.image?' poster="'+esc(n.image)+'"':'')+'><source src="'+esc(n.video)+'"></video>':(n.image?'<img src="'+esc(n.image)+'" alt="" loading="lazy">':''))+'<small>'+esc(n.type)+' · '+esc(date(n.when))+(n.venue?' · '+esc(n.venue):'')+'</small><h3>'+esc(n.title)+'</h3><p>'+esc(n.summary||'Informação publicada pela equipa da modalidade.')+'</p></article>').join(''):empty('Ainda não existem notícias ou actividades publicadas nesta modalidade. Esta área será actualizada pela supervisão quando houver informação confirmada.');
 const person=(p,info)=>'<article class="person">'+(img(p.photo_path)?'<img src="'+esc(img(p.photo_path))+'" alt="" loading="lazy">':'<span class="brand-mark">✦</span>')+'<div><strong>'+esc(p.full_name)+'</strong><small>'+esc(info||title)+'</small></div></article>';
 const groups=['juvenis','juniores'],groupLabel={juvenis:'Juvenis',juniores:'Juniores'};
 if(page==='home'){$('#latestNews').innerHTML=newsHTML(allNews.slice(0,3));}
 if(page==='noticias'){$('#newsList').innerHTML=newsHTML(allNews);if(location.hash)document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({behavior:'smooth',block:'start'});}
 if(page==='atletas')$('#athleteList').innerHTML=groups.map(g=>{const list=athletes.filter(a=>a.age_group===g);return '<section class="group"><h2>'+groupLabel[g]+'</h2><div class="data-grid">'+(list.length?list.map(a=>person(a,[a.sport_role,a.jersey_number?'Camisola '+a.jersey_number:null,a.height_cm?a.height_cm+' cm':null].filter(Boolean).join(' · '))).join(''):empty('Não existem atletas publicados neste escalão.'))+'</div></section>'}).join('');
 if(page==='escola'){$('#coachList').innerHTML=coaches.length?coaches.map(c=>person(c,c.role_title||'Equipa técnica')).join(''):empty('Os perfis da equipa técnica serão apresentados quando forem publicados.');}
 if(page==='salas'){const trainingEvents=events.filter(e=>/treino|treinamento/i.test([e.event_type,e.title].join(' '))&&e.venue);$('#roomList').innerHTML=trainingEvents.length?trainingEvents.map(e=>'<article class="info-card"><h3>'+esc(e.title)+'</h3><p>'+esc(e.venue)+' · '+esc(date(e.starts_at))+'</p></article>').join(''):empty('Os locais e horários de treino ainda não foram publicados. Não apresentamos salas ou horários sem confirmação oficial.');}
 if(page==='conquistas'){const resultCards=matches.filter(m=>['vitoria','empate','derrota'].includes(m.result)).map(m=>({type:date(m.starts_at),title:m.competition||'Competição',summary:'MACOVI '+(m.macovi_score??'—')+' : '+(m.opponent_score??'—')+' '+(m.opponent||'')+' · '+({vitoria:'Vitória',empate:'Empate',derrota:'Derrota'}[m.result])}));const tables=standings.map(s=>({type:(s.season||'Época por indicar')+' · '+(s.age_group||'Escalão'),title:s.competition||'Classificação',summary:(s.position||'—')+'º · '+s.team_name+' · '+s.points+' pontos'}));$('#achievementList').innerHTML=[...resultCards,...tables].length?newsHTML([...resultCards,...tables]):empty('O arquivo competitivo será apresentado à medida que resultados e classificações oficiais forem publicados.');}
 if(page==='historia')$('#historyFacts').innerHTML='<article class="news-card"><small>26 de Julho de 1999</small><h3>MACOVI SPORT CLUB</h3><p>O clube foi fundado em 26 de Julho de 1999. A história específica desta modalidade será enriquecida com marcos, épocas e registos confirmados pelo clube.</p></article><article class="news-card"><small>Identidade da modalidade</small><h3>'+esc(title)+'</h3><p>'+esc(intros[slug])+' As conquistas e datas históricas serão acrescentadas quando houver documentação validada.</p></article>';
 $('#year').textContent=new Date().getFullYear();
}
