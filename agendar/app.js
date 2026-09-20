const cfg=window.SITE_CONFIG;
const sb=supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:false,autoRefreshToken:false}});
const slotsEl=document.querySelector('#slots'),slotInput=document.querySelector('#slotStart'),feedback=document.querySelector('#bookingFeedback'),form=document.querySelector('#bookingForm'),bookButton=document.querySelector('#bookButton');
const params=new URLSearchParams(location.search);
const requestedService=params.get('service');
if(['gestao_trafego','redes_sociais','estrategia_marketing_vendas','criacao_site','geral'].includes(requestedService))document.querySelector('#serviceType').value=requestedService;

function formatDateLabel(iso){
  const d=new Date(iso);
  return new Intl.DateTimeFormat('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit',timeZone:'America/Sao_Paulo'}).format(d);
}
function formatTime(iso){
  return new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}).format(new Date(iso));
}
async function loadSlots(){
  slotInput.value='';
  slotsEl.innerHTML='<p class="booking-muted">Consultando a agenda…</p>';
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const {data,error}=await sb.rpc('oyag_public_available_slots',{p_start_date:today,p_days:21});
  if(error){slotsEl.innerHTML='<p class="booking-muted">Não foi possível consultar a agenda agora. Você pode falar pelo WhatsApp.</p>';return}
  const slots=Array.isArray(data)?data:[];
  if(!slots.length){slotsEl.innerHTML='<div class="booking-empty"><strong>Agenda em configuração</strong><p>Os horários online ainda estão sendo definidos. Enquanto isso, fale pelo WhatsApp e combinamos um horário.</p><a href="https://wa.me/5514991469159" target="_blank" rel="noopener noreferrer">Falar pelo WhatsApp</a></div>';return}
  const grouped=new Map();
  slots.forEach(s=>{const k=formatDateLabel(s.slot_start);if(!grouped.has(k))grouped.set(k,[]);grouped.get(k).push(s)});
  slotsEl.innerHTML=[...grouped].map(([date,items])=>'<div class="slot-day"><strong>'+date+'</strong><div>'+items.map(s=>'<button type="button" class="slot" data-slot="'+s.slot_start+'">'+formatTime(s.slot_start)+'</button>').join('')+'</div></div>').join('');
  slotsEl.querySelectorAll('.slot').forEach(b=>b.onclick=()=>{
    slotsEl.querySelectorAll('.slot').forEach(x=>x.classList.remove('selected'));
    b.classList.add('selected');
    slotInput.value=b.dataset.slot;
    feedback.textContent='';
  });
}
document.querySelector('#refreshSlots').onclick=loadSlots;

form.addEventListener('submit',async e=>{
  e.preventDefault();
  feedback.className='booking-feedback';
  feedback.textContent='';
  if(!slotInput.value){feedback.classList.add('error');feedback.textContent='Escolha um horário disponível antes de continuar.';return}
  if(!document.querySelector('#privacyConsent').checked){feedback.classList.add('error');feedback.textContent='Confirme a leitura do Aviso de Privacidade.';return}
  bookButton.disabled=true;bookButton.textContent='Confirmando…';
  const payload={
    p_slot_start:slotInput.value,
    p_service_type:document.querySelector('#serviceType').value,
    p_contact_name:document.querySelector('#contactName').value.trim(),
    p_contact_email:document.querySelector('#contactEmail').value.trim(),
    p_contact_whatsapp:document.querySelector('#contactWhatsapp').value.trim(),
    p_company_name:document.querySelector('#companyName').value.trim()||null,
    p_company_segment:document.querySelector('#companySegment').value.trim()||null,
    p_message:document.querySelector('#message').value.trim()||null
  };
  const {data,error}=await sb.rpc('oyag_public_book_presentation',payload);
  if(error){
    feedback.classList.add('error');
    const known={slot_unavailable:'Esse horário acabou de ficar indisponível. Escolha outro.',too_many_active_bookings:'Já existem agendamentos futuros vinculados a este e-mail. Entre em contato pelo WhatsApp para ajustar.',invalid_email:'Confira o e-mail informado.',invalid_whatsapp:'Confira o número de WhatsApp informado.'};
    feedback.textContent=known[error.message]||'Não foi possível concluir o agendamento. Atualize os horários e tente novamente.';
    bookButton.disabled=false;bookButton.textContent='Confirmar agendamento';await loadSlots();return;
  }
  const result=Array.isArray(data)?data[0]:data;
  const when=new Intl.DateTimeFormat('pt-BR',{dateStyle:'full',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(new Date(result.scheduled_at));
  form.innerHTML='<div class="booking-success"><span>✓</span><p class="eyebrow">Agendamento registrado</p><h2>Horário reservado.</h2><p>Sua apresentação ficou registrada para <strong>'+when+'</strong>.</p><p>Código: <strong>'+result.confirmation_code+'</strong></p><p>Guarde este código. O contato poderá ser confirmado pelos canais informados.</p><a class="button primary large" href="../">Voltar ao site</a></div>';
});
loadSlots();