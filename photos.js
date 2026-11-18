(() => {
    "use strict";
    const root = document.querySelector("[data-gallery-ref]");
    if (!root) return;
    const ref = root.dataset.galleryRef;
    const fallback = root.querySelector(".gallery-placeholder");
    const image = root.querySelector(".gallery-image");
    const controls = root.querySelector(".gallery-controls");
    const thumbs = root.querySelector(".gallery-thumbnails");
    const status = root.querySelector(".gallery-status");
    const count = root.querySelector(".gallery-count");
    const open = root.querySelector(".gallery-open");
    const prev = root.querySelector(".gallery-prev");
    const next = root.querySelector(".gallery-next");
    let photos = [];
    let active = 0;
    let modal = null;
    const clean = (p) => {
      const v = typeof p === "string" ? {src:p} : p;
      if (!v || typeof v.src !== "string" || !(/^(https:\/\/|\/)/.test(v.src))) return null;
      return {src:v.src, alt:typeof v.alt==="string"&&v.alt.trim()?v.alt:"Photographie du bien immobilier, référence "+ref};
    };
    function render(){
      if (!photos.length) return;
      const p = photos[active];
      image.src=p.src;
      image.alt=p.alt;
      count.textContent=(active+1)+" / "+photos.length;
      Array.from(thumbs.children).forEach((button,i)=>button.setAttribute("aria-current",String(i===active)));
      prev.disabled=next.disabled=photos.length<2;
      if(modal) {modal.querySelector("img").src=p.src;modal.querySelector("img").alt=p.alt;}
    }
    function select(i){if(!photos.length)return;active=(i+photos.length)%photos.length;render();}
    function closeModal(){if(!modal)return;modal.remove();modal=null;document.body.style.overflow="";open.focus();}
    function showModal(){
      if(!photos.length)return;
      modal=document.createElement("div");
      modal.className="gallery-lightbox";
      modal.setAttribute("role","dialog");
      modal.setAttribute("aria-modal","true");
      modal.setAttribute("aria-label","Photo du bien agrandie");
      modal.innerHTML='<button type="button" class="close-lightbox" aria-label="Fermer">×</button><button type="button" class="prev-lightbox" aria-label="Photo précédente">‹</button><img alt=""><button type="button" class="next-lightbox" aria-label="Photo suivante">›</button>';
      document.body.appendChild(modal);
      document.body.style.overflow="hidden";
      modal.querySelector(".close-lightbox").addEventListener("click",closeModal);
      modal.querySelector(".prev-lightbox").addEventListener("click",()=>select(active-1));
      modal.querySelector(".next-lightbox").addEventListener("click",()=>select(active+1));
      modal.addEventListener("click",e=>{if(e.target===modal)closeModal();});
      modal.querySelector(".close-lightbox").focus();
      render();
    }
    document.addEventListener("keydown", e => {
      if(modal) {
        if(e.key==="Escape"){e.preventDefault();closeModal();}
        if(e.key==="ArrowLeft"){e.preventDefault();select(active-1);}
        if(e.key==="ArrowRight"){e.preventDefault();select(active+1);}
      } else if(root.contains(document.activeElement)){
        if(e.key==="ArrowLeft"){e.preventDefault();select(active-1);}
        if(e.key==="ArrowRight"){e.preventDefault();select(active+1);}
      }
    });
    prev.addEventListener("click",()=>select(active-1));
    next.addEventListener("click",()=>select(active+1));
    open.addEventListener("click",showModal);
    image.addEventListener("click",showModal);
    image.addEventListener("error",()=>{status.textContent="Cette photo ne peut pas être affichée pour le moment.";});
    fetch("/biens-photos.json", {cache:"no-store"}).then(r=>r.ok?r.json():{}).then(data=>{
      photos=(Array.isArray(data[ref])?data[ref]:[]).map(clean).filter(Boolean);
      if (!photos.length) return;
      fallback.hidden=true;
      image.hidden=false;
      controls.hidden=false;
      open.hidden=false;
      thumbs.hidden=false;
      count.hidden=false;
      root.dataset.hasImages="true";
      status.textContent=photos.length===1?"1 photo disponible":photos.length+" photos disponibles";
      thumbs.replaceChildren(...photos.map((p,i)=>{
        const button=document.createElement("button");
        button.type="button";
        button.className="gallery-thumb";
        button.setAttribute("aria-label","Voir la photo "+(i+1));
        const small=document.createElement("img");
        small.src=p.src;small.alt=p.alt;small.loading="lazy";
        button.appendChild(small);
        button.addEventListener("click",()=>select(i));
        return button;
      }));
      const following=root.nextElementSibling;
      if(following && following.tagName==="P" && following.hasAttribute("style"))following.hidden=true;
      render();
    }).catch(()=>{status.textContent="Les photos de ce bien seront bientôt disponibles.";});
  })();