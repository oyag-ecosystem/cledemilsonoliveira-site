(() => {
  const ENDPOINT = "https://epbhiygonpkzlmbbsyqv.supabase.co/functions/v1/oyag-public-contact";
  const MAP = {
    "contato@cledemilsonoliveira.com": { channel:"contato", label:"Contato geral", subject:"Contato pelo site" },
    "suporte@cledemilsonoliveira.com": { channel:"suporte", label:"Suporte", subject:"Suporte pelo site" },
    "academy@cledemilsonoliveira.com": { channel:"contato", label:"OYAG Academy", subject:"OYAG Academy — contato pelo site" }
  };

  function getConfig(href){
    if(!href || !href.startsWith("mailto:")) return null;
    const email=href.slice(7).split("?")[0].toLowerCase();
    return MAP[email] || null;
  }

  function build(){
    const node=document.createElement("div");
    node.className="site-contact-modal";
    node.hidden=true;
    node.innerHTML=`
      <div class="site-contact-backdrop" data-close-contact></div>
      <section class="site-contact-dialog" role="dialog" aria-modal="true" aria-labelledby="site-contact-title">
        <button type="button" class="site-contact-close" aria-label="Fechar" data-close-contact>×</button>
        <p class="eyebrow">Contato</p>
        <h2 id="site-contact-title">Envie sua mensagem</h2>
        <p class="site-contact-intro">Canal selecionado: <strong data-contact-label></strong></p>
        <form class="site-contact-form" novalidate>
          <input class="site-contact-hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="site-contact-row">
            <label>Nome<input name="name" type="text" minlength="2" maxlength="120" autocomplete="name" required placeholder="Seu nome"></label>
            <label>E-mail<input name="email" type="email" maxlength="180" autocomplete="email" required placeholder="voce@exemplo.com"></label>
          </div>
          <div class="site-contact-row">
            <label>WhatsApp <small>(opcional)</small><input name="whatsapp" type="tel" maxlength="40" autocomplete="tel" placeholder="(00) 00000-0000"></label>
            <label>Assunto<input name="subject" type="text" maxlength="160" required></label>
          </div>
          <label>Mensagem<textarea name="message" minlength="10" maxlength="5000" rows="6" required placeholder="Escreva sua mensagem"></textarea></label>
          <div class="site-contact-status" role="status" aria-live="polite"></div>
          <div class="site-contact-actions">
            <button class="button primary site-contact-submit" type="submit">Enviar mensagem</button>
            <a class="button secondary site-contact-mailto" href="#">Abrir no e-mail</a>
          </div>
          <small class="site-contact-note">Os dados serão usados somente para responder ao seu contato.</small>
        </form>
      </section>`;
    document.body.appendChild(node);
    return node;
  }

  const modal=build();
  const form=modal.querySelector(".site-contact-form");
  const label=modal.querySelector("[data-contact-label]");
  const status=modal.querySelector(".site-contact-status");
  const submit=modal.querySelector(".site-contact-submit");
  const mailto=modal.querySelector(".site-contact-mailto");
  let active={channel:"contato",label:"Contato geral",subject:"Contato pelo site"};
  let opener=null;

  function updateMailto(){
    const data=new FormData(form);
    const body=[
      "Nome: "+String(data.get("name")||""),
      "E-mail: "+String(data.get("email")||""),
      "WhatsApp: "+String(data.get("whatsapp")||""),
      "",
      String(data.get("message")||"")
    ].join("\n");
    const destination=active.channel==="suporte"?"suporte@cledemilsonoliveira.com":"contato@cledemilsonoliveira.com";
    mailto.href=`mailto:${destination}?subject=${encodeURIComponent(String(data.get("subject")||active.subject))}&body=${encodeURIComponent(body)}`;
  }

  function open(config,source){
    active=config;
    opener=source||null;
    label.textContent=config.label;
    form.reset();
    form.elements.subject.value=config.subject;
    status.textContent="";
    status.className="site-contact-status";
    updateMailto();
    modal.hidden=false;
    document.documentElement.classList.add("site-contact-open");
    setTimeout(()=>form.elements.name.focus(),20);
  }

  function close(){
    modal.hidden=true;
    document.documentElement.classList.remove("site-contact-open");
    if(opener) opener.focus();
  }

  document.querySelectorAll('a[href^="mailto:"]').forEach(link=>{
    const config=getConfig(link.getAttribute("href"));
    if(!config) return;
    link.addEventListener("click",event=>{
      if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey) return;
      event.preventDefault();
      open(config,link);
    });
  });

  modal.querySelectorAll("[data-close-contact]").forEach(el=>el.addEventListener("click",close));
  document.addEventListener("keydown",e=>{ if(!modal.hidden && e.key==="Escape") close(); });
  form.addEventListener("input",updateMailto);

  form.addEventListener("submit",async event=>{
    event.preventDefault();
    if(!form.reportValidity()) return;
    const data=new FormData(form);
    const payload={
      channel:active.channel,
      name:String(data.get("name")||"").trim(),
      email:String(data.get("email")||"").trim(),
      whatsapp:String(data.get("whatsapp")||"").trim(),
      subject:String(data.get("subject")||active.subject).trim(),
      message:String(data.get("message")||"").trim(),
      company:String(data.get("company")||"").trim(),
      source_url:location.href
    };

    submit.disabled=true;
    submit.textContent="Enviando...";
    status.textContent="Enviando sua mensagem.";

    try{
      const response=await fetch(ENDPOINT,{cache:"no-store",
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      });
      const result=await response.json().catch(()=>({}));
      if(!response.ok||!result.ok) throw new Error(result.error||"Não foi possível enviar agora.");
      status.className="site-contact-status success";
      status.textContent=result.email_sent?`Mensagem enviada com sucesso. Protocolo: ${result.id||"OYAG"}. O contato foi registrado no OYAG e encaminhado por e-mail.`:`Mensagem registrada no OYAG, mas a entrega por e-mail não foi confirmada. Protocolo: ${result.id||"OYAG"}.`;
      form.reset();
      form.elements.subject.value=active.subject;
      updateMailto();
      submit.textContent="Mensagem enviada ✓";
      setTimeout(()=>{submit.disabled=false;submit.textContent="Enviar mensagem";},1800);
    }catch(err){
      status.className="site-contact-status error";
      status.textContent=err?.message||"Não foi possível enviar agora. Use “Abrir no e-mail” como alternativa.";
      submit.disabled=false;
      submit.textContent="Enviar mensagem";
    }
  });
})();