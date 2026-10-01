'use strict';
(() => {
  const data = window.GUIDE_DATA;
  if (!data?.chapters?.length) return;
  const chapters = data.chapters;
  const topics = chapters.flatMap(chapter => chapter.topics.map(topic => ({...topic, chapter})));
  const content = document.getElementById('page-content');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('menu-backdrop');
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('chapter-nav');
  const status = document.getElementById('route-status');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const pad = value => String(value).padStart(2,'0');
  const paths = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-8h6v8"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    building:'<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 21v-5h6v5M8 7h1m6 0h1M8 11h1m6 0h1"/>',
    map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15m6-12v15"/>',
    folder:'<path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/>',
    pin:'<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    percent:'<path d="m5 19 14-14"/><circle cx="7" cy="7" r="3"/><circle cx="17" cy="17" r="3"/>',
    shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
    key:'<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-3-3 3-3m-6 0 3-3"/>',
    briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 13h18m-11 0v3h4v-3"/>',
    calculator:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h1m6 0h1M8 15h1m6 0h1M8 19h1m6 0h1"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.9M15 3a4 4 0 0 1 0 8"/><circle cx="9" cy="7" r="4"/>',
    book:'<path d="M12 5C8 2 3 3 3 3v17s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2Zm0 0v17"/>',
    receipt:'<path d="m5 3 2 1 2-1 3 1 3-1 2 1 2-1v18l-2-1-2 1-3-1-3 1-2-1-2 1Z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    store:'<path d="M3 9h18l-2-6H5Zm1 1v11h16V10M9 21v-7h6v7"/><path d="M3 9v2a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0V9"/>',
    megaphone:'<path d="m3 10 13-5v14L3 14Zm13-5 4-2v18l-4-2M5 15l2 7h4l-2-6"/>',
    health:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z"/>',
    bulb:'<path d="M9 18h6m-5 4h4M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 4H9c0-2 0-3-1-4Z"/>',
    clipboard:'<rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 11h6m-6 4h6"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/>',
    alert:'<path d="m12 3 10 18H2Z"/><path d="M12 9v5m0 3h.01"/>',
    lock:'<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v3"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-14 4h3m4 0h3m-10 3h3"/>',
    filecheck:'<path d="M14 2H5a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8ZM14 2v6h6m-12 7 3 3 5-6"/>',
    mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 5 10 8L22 5"/>',
    phone:'<path d="m5 3 4 1 1 5-3 2a16 16 0 0 0 6 6l2-3 5 1 1 4c0 2-2 3-4 2C9 20 4 15 3 7 2 5 3 3 5 3Z"/>',
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.book}</svg>`;
  document.querySelector('.home-icon').innerHTML = icon('home');
  nav.innerHTML = chapters.map(c => `<a href="#${c.id}" data-chapter="${c.number}"><span class="nav-number">${pad(c.number)}</span><span>${esc(c.short)}</span></a>`).join('');

  function setMenu(open) {
    sidebar.inert = !open && window.matchMedia('(max-width:800px)').matches;
    sidebar.classList.toggle('open',open);
    document.body.classList.toggle('menu-open',open);
    menuToggle.setAttribute('aria-expanded',String(open));
    backdrop.hidden = !open;
    if (open) sidebar.querySelector('.active')?.focus();
  }
  menuToggle.addEventListener('click',() => setMenu(!sidebar.classList.contains('open')));
  backdrop.addEventListener('click',() => setMenu(false));
  sidebar.addEventListener('click',event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown',event => {
    if (event.key==='Escape' && sidebar.classList.contains('open')) { setMenu(false); menuToggle.focus(); }
    if (event.key==='Tab' && sidebar.classList.contains('open') && matchMedia('(max-width:800px)').matches) {
      const links=[menuToggle,...sidebar.querySelectorAll('a')];
      const first=links[0],last=links[links.length-1];
      if (event.shiftKey && document.activeElement===first) { event.preventDefault();last.focus(); }
      else if (!event.shiftKey && document.activeElement===last) { event.preventDefault();first.focus(); }
    }
  });
  window.addEventListener('resize',() => { if (window.innerWidth>800) setMenu(false); });

  const breadcrumb = current => `<nav class="breadcrumb" aria-label="Localização"><a href="#inicio">Guia do contribuinte</a>${current ? `<span class="breadcrumb-separator" aria-hidden="true">/</span><span>${esc(current)}</span>` : ''}</nav>`;
  const searchForm = (value='',hero=false) => `<form class="search-box${hero?' hero-search':''}" id="guia-search" role="search">${icon('search')}<label class="sr-only" for="guide-query">Pesquisar no guia do contribuinte</label><input id="guide-query" name="q" type="search" value="${esc(value)}" placeholder="Pesquise um assunto ou uma dúvida" autocomplete="off" maxlength="180"><button type="submit">Pesquisar</button></form>`;
  const shortcuts = [2,8,9,16,27,28];
  const descriptions = {2:'Valor venal, lançamento e pagamento do seu imóvel.',8:'Transmissão de imóveis, cálculo e guia de pagamento.',9:'Serviços, contribuinte e responsabilidade pelo imposto.',16:'Emissão, consulta e autenticidade da NFS-e.',27:'Condições para regularizar seus débitos municipais.',28:'Emissão, validação e acompanhamento de processos.'};
  const quickTitles = {2:'IPTU',8:'ITBI',9:'ISS',16:'Nota fiscal de serviços',27:'Parcelamento',28:'Certidões'};

  function home() {
    return `${breadcrumb('Início')}
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-heading"><span class="eyebrow">SECRETARIA MUNICIPAL DA FAZENDA</span><span class="city-badge">ARACAJU</span></div>
        <h1 id="hero-title">Guia do contribuinte</h1>
        <p>Consulte orientações sobre seus tributos, cadastros e serviços municipais.</p>
        ${searchForm('',true)}
        <nav class="hero-shortcuts" aria-label="Acesso rápido"><span>Assuntos:</span>${shortcuts.map(n=>`<a href="#capitulo-${pad(n)}">${esc(quickTitles[n])}</a>`).join('')}</nav>
      </section>
      <div class="section-heading"><div><h2>Qual assunto você procura?</h2><p>Acesse as orientações de cada serviço.</p></div></div>
      <div class="quick-grid">${shortcuts.map(n=>{const c=chapters[n-1];return `<a class="quick-card" href="#${c.id}"><span class="icon-box">${icon(c.icon)}</span><div><h3>${esc(quickTitles[n])}</h3><p>${esc(descriptions[n])}</p></div></a>`;}).join('')}</div>
      <div class="section-heading" id="todos-assuntos"><div><h2>Todos os assuntos</h2><p>O guia completo, na sequência dos tópicos de referência.</p></div><span class="section-meta">31 seções · 322 perguntas</span></div>
      <nav class="chapter-catalog" aria-label="Sumário completo">${chapters.map(c=>`<a class="catalog-link" href="#${c.id}"><span class="catalog-number">${pad(c.number)}</span><span class="catalog-label">${esc(c.title)}</span><span class="catalog-count">${c.topics.length?`${c.topics.length} perguntas`:'Contatos'}</span></a>`).join('')}</nav>
      <section class="help-strip"><div><h3>Precisa de orientação sobre o seu caso?</h3><p>Tenha em mãos a inscrição municipal ou imobiliária e os documentos da sua solicitação.</p></div><a class="button-link" href="#capitulo-31">Canais de atendimento</a></section>
      `;
  }

  function aside(c) {
    return `<aside class="aside-sticky" aria-label="Serviços e referências do assunto"><section class="aside-box"><h2>Consulta oficial</h2><div class="aside-links">${c.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`).join('')}</div></section><section class="aside-box contact-mini"><h2>Atendimento da SEMFAZ</h2><p>Dúvidas sobre o serviço ou sua situação fiscal.</p><a class="phone" href="tel:+557931791100">(79) 3179-1100</a><p>Segunda a sexta-feira<br>das 8h às 16h</p><a class="contact-link" href="#capitulo-31">Ver todos os contatos</a></section></aside>`;
  }

  function pagination(c) {
    const previous=chapters[c.number-2],next=chapters[c.number];
    return `<nav class="chapter-pagination" aria-label="Navegação entre assuntos">${previous?`<a href="#${previous.id}"><span>Assunto anterior · ${pad(previous.number)}</span><strong>${esc(previous.short)}</strong></a>`:`<a href="#inicio"><span>Sumário do guia</span><strong>Voltar ao início</strong></a>`}${next?`<a href="#${next.id}"><span>Próximo assunto · ${pad(next.number)}</span><strong>${esc(next.short)}</strong></a>`:`<a href="#inicio"><span>Sumário do guia</span><strong>Voltar ao início</strong></a>`}</nav>`;
  }

  function contactContent() {
    return `<div class="contact-grid">
      <section class="contact-card"><span class="icon-box">${icon('phone')}</span><div><h2>Telefone</h2><p><a href="tel:+557931791100">(79) 3179-1100</a></p><p>Call center da SEMFAZ</p></div></section>
      <section class="contact-card"><span class="icon-box">${icon('calendar')}</span><div><h2>Horário de atendimento</h2><p>De segunda a sexta-feira<br>das 8h às 16h</p><small>Confirme agendamento e funcionamento em feriados no portal oficial.</small></div></section>
      <section class="contact-card wide"><span class="icon-box">${icon('pin')}</span><div><h2>Secretaria Municipal da Fazenda</h2><p>Praça General Valadão, 341<br>Centro · Térreo · Aracaju/SE</p><small>Endereço do órgão informado no portal da SEMFAZ. O canal de um serviço específico pode ser diferente.</small></div></section>
      <section class="contact-card"><span class="icon-box">${icon('globe')}</span><div><h2>Serviços da SEMFAZ</h2><p>Guia de pagamento, certidões, agendamento, cadastro, processos e orientações fiscais.</p><p><a href="https://www.fazenda.aracaju.se.gov.br/" target="_blank" rel="noopener noreferrer">Acessar o portal oficial</a></p></div></section>
      <section class="contact-card"><span class="icon-box">${icon('store')}</span><div><h2>Licenciamento e atividade econômica</h2><p>Solicitações e acompanhamento de serviços municipais de licenciamento.</p><p><a href="https://slim.aracaju.se.gov.br/" target="_blank" rel="noopener noreferrer">Acessar o SLIM Aracaju</a></p></div></section>
      <section class="contact-card wide"><span class="icon-box">${icon('folder')}</span><div><h2>Antes de solicitar atendimento</h2><ol class="contact-steps"><li>Identifique o assunto e o contribuinte, imóvel ou atividade envolvidos.</li><li>Separe inscrição, exercício, número da guia ou protocolo, quando houver.</li><li>Reúna documentos do interessado e de representação, se necessários.</li><li>Confirme no serviço escolhido a lista de documentos e o canal de atendimento.</li></ol></div></section>
    </div><p class="version-note">O anexo de subprefeituras do guia paulista foi substituído pelos canais de Aracaju. Endereço, horário e telefone foram consultados no portal oficial da SEMFAZ; confirme os dados antes do deslocamento.</p>`;
  }

  function chapter(c,targetId='') {
    const heading = `${breadcrumb(c.short)}<header class="chapter-head"><div class="chapter-number" aria-hidden="true">${pad(c.number)}</div><div><span class="eyebrow">${esc(c.subtitle)}</span><h1>${esc(c.title)}</h1><p>${esc(c.description)}</p></div></header>`;
    if (c.number===31) return heading+contactContent()+pagination(c);
    return `${heading}<div class="chapter-body"><article class="article-panel" aria-label="Perguntas e orientações"><div class="faq-title"><h2>Perguntas e orientações</h2><span>${c.topics.length} perguntas</span></div><div class="faq-list">${c.topics.map((t,index)=>`<details class="faq-item" id="${t.id}" ${t.id===targetId || (!targetId && index===0)?'open':''}><summary><span class="faq-ordinal" aria-hidden="true">${pad(index+1)}</span><span>${esc(t.title)}</span></summary><div class="faq-answer"><p>${esc(t.answer)}</p><div class="faq-foot"><span class="${t.review?'review-tag':''}">${t.review?'Confirmar regra ou procedimento local':'Orientação geral · consulte o serviço oficial'}</span><a class="question-link" href="#${t.id}">Link desta pergunta</a></div></div></details>`).join('')}</div></article>${aside(c)}</div>${pagination(c)}`;
  }

  function searchResults(query) {
    const terms=normalize(query.trim()).split(/\s+/).filter(Boolean);
    const matches=terms.length?topics.map(t=>{
      const title=normalize(t.title),answer=normalize(t.answer),chapter=normalize(t.chapter.title);
      const all=`${title} ${answer} ${chapter} ${normalize(t.originalTitle)}`;
      if (!terms.every(term=>all.includes(term))) return null;
      return {...t,score:terms.reduce((sum,term)=>sum+(title.includes(term)?8:0)+(chapter.includes(term)?3:0)+(answer.includes(term)?1:0),0)};
    }).filter(Boolean).sort((a,b)=>b.score-a.score || a.sourceId-b.sourceId):[];
    const cards = matches.map(t=>{
      let snippet=t.answer;
      if(snippet.length>210) snippet=snippet.slice(0,210).replace(/\s+\S*$/,'')+'…';
      return `<a class="result-card" href="#${t.id}"><p class="result-meta">${pad(t.chapter.number)} · ${esc(t.chapter.short)}</p><h2>${esc(t.title)}</h2><p>${esc(snippet)}</p></a>`;
    }).join('');
    return `${breadcrumb('Pesquisa')}<div class="search-title-row"><h1>Pesquisa no guia</h1><a href="#inicio">Voltar ao sumário</a></div><div class="search-top">${searchForm(query)}</div><p class="search-feedback" role="status">${terms.length?`${matches.length} ${matches.length===1?'pergunta encontrada':'perguntas encontradas'} para “${esc(query)}”.`:'Digite um assunto ou uma dúvida para pesquisar nas 322 perguntas.'}</p>${matches.length?`<div class="search-results">${cards}</div>`:`<div class="empty-state">${icon('search').replace('<svg','<svg width="32" height="32" style="color:#006d83;margin-bottom:15px"')}<h2>${terms.length?'Nenhuma pergunta encontrada':'O que você deseja consultar?'}</h2><p>${terms.length?'Experimente um termo mais simples, como inscrição, parcelamento ou isenção. Você também pode escolher um assunto no sumário.':'Pesquise por tributo, serviço ou palavra da sua dúvida. A busca considera títulos e orientações, com ou sem acentos.'}</p><a class="button-link" href="#inicio">Consultar todos os assuntos</a></div>`}`;
  }

  function activeNav(number) {
    const homeLink=document.querySelector('.home-nav');
    homeLink.classList.toggle('active',number===0);
    if(number===0)homeLink.setAttribute('aria-current','page');else homeLink.removeAttribute('aria-current');
    nav.querySelectorAll('a').forEach(a=>{
      const active=Number(a.dataset.chapter)===number;
      a.classList.toggle('active',active);
      if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
  }

  function renderRoute(first=false) {
    setMenu(false);
    const hash=location.hash.slice(1) || 'inicio';
    let chapterNumber=0,label='Início do guia',target='';
    if(hash==='inicio') content.innerHTML=home();
    else if(hash.startsWith('pesquisa')) {
      const params=new URLSearchParams(hash.split('?')[1] || '');
      const query=params.get('q') || '';
      content.innerHTML=searchResults(query);label='Pesquisa no guia';
    } else {
      const question=topics.find(t=>t.id===hash);
      const selected=question?.chapter || chapters.find(c=>c.id===hash);
      if(selected) {
        chapterNumber=selected.number;label=selected.title;target=question?.id || '';
        content.innerHTML=chapter(selected,target);
      } else {
        content.innerHTML=`${breadcrumb('Assunto não encontrado')}<div class="empty-state"><h1>Assunto não encontrado</h1><p>Consulte o sumário para escolher uma das seções do guia.</p><a class="button-link" href="#inicio">Voltar ao início</a></div>`;
        label='Assunto não encontrado';
      }
    }
    activeNav(chapterNumber);
    document.title=label==='Início do guia'?data.title:`${label} · Guia do Contribuinte · Aracaju`;
    status.textContent=label;
    window.scrollTo({top:0,behavior:'instant'});
    if(!first) document.getElementById('conteudo').focus({preventScroll:true});
    if(target) requestAnimationFrame(()=>document.getElementById(target)?.scrollIntoView({block:'start',behavior:'instant'}));
  }
  document.addEventListener('submit',event=>{
    if(event.target.id!=='guia-search')return;
    event.preventDefault();
    const query=String(new FormData(event.target).get('q') || '').trim();
    const hash='pesquisa?q='+encodeURIComponent(query);
    if(location.hash.slice(1)===hash)renderRoute();else location.hash=hash;
  });
  document.addEventListener('click',event=>{
    const anchor=event.target.closest('a[href^="#pergunta-"]');
    if(anchor && anchor.getAttribute('href')===location.hash) {
      const details=document.getElementById(location.hash.slice(1));
      if(details) { details.open=true;details.scrollIntoView({block:'start',behavior:'smooth'}); }
    }
  });
  window.addEventListener('hashchange',()=>renderRoute());
  renderRoute(true);
})();
