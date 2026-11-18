import {createFormStore,FORM_ERROR} from "/js/wix/form-store.js";
const el=document.getElementById("wix-contact");
const store=createFormStore({formId:"488bc378-9912-4099-934c-d3f455114796"});
const esc=(x)=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let initialized=false;
function render(s){
 if(s.outcome){el.innerHTML='<div class="success">'+esc(s.outcome.message||"Merci, nous avons reçu votre demande.")+'</div>';return;}
 if(!s.form){el.innerHTML='<p>'+esc(s.errors?.[FORM_ERROR]||"Chargement du formulaire…")+'</p>';return;}
 if(s.closed){el.innerHTML='<p>Ce formulaire ne reçoit pas de nouvelles demandes pour le moment.</p>';return;}
 if(!initialized){
 el.innerHTML=s.form.fields.map(f=>{const t=esc(f.target),label=esc(f.label),req=f.required?' *':'',placeholder=esc(f.placeholder||'');let control;
 if(f.control==='textarea')control='<textarea name="'+t+'" id="'+t+'" placeholder="'+placeholder+'"></textarea>';
 else if(f.control==='select')control='<select name="'+t+'" id="'+t+'"><option value="">Choisir…</option>'+(f.choices||[]).map(c=>'<option value="'+esc(c.value)+'">'+esc(c.label)+'</option>').join('')+'</select>';
 else if(f.control==='checkbox')control='<input type="checkbox" name="'+t+'" id="'+t+'">';
 else control='<input name="'+t+'" id="'+t+'" type="'+({phone:'tel',email:'email',number:'number'}[f.control]||'text')+'" placeholder="'+placeholder+'">';
 return '<div class="field"><label for="'+t+'">'+label+req+'</label>'+control+'<p class="error" data-error="'+t+'"></p></div>';}).join('')+'<p class="error" id="form-error"></p><button class="btn" type="submit">Envoyer ma demande</button>';
 initialized=true;
 }
 for(const f of s.form.fields){const node=el.querySelector('[data-error="'+f.target+'"]');if(node)node.textContent=s.errors?.[f.target]||'';}
 const ferr=el.querySelector('#form-error');if(ferr)ferr.textContent=s.errors?.[FORM_ERROR]||'';
 const btn=el.querySelector('button');if(btn){btn.disabled=!!s.loading;btn.textContent=s.loading?'Envoi en cours…':'Envoyer ma demande';}
}
el.addEventListener('input',e=>{if(e.target.name)store.setValue(e.target.name,e.target.type==='checkbox'?e.target.checked:e.target.value)});
el.addEventListener('focusout',e=>{if(e.target.name)store.validate(e.target.name)});
el.addEventListener('submit',e=>store.submit(e));
store.subscribe(render);render(store.getState());store.start();