/** Reviewed, self-contained runtime; the Framer bundle never runs in customer sites. */
export function lumiRuntime(): void {
  if(document.body.dataset.template!=='lumi-business')return;
  const root=document.getElementById('lumi-root');if(!root)return;
  const templates=[...document.querySelectorAll<HTMLTemplateElement>('template[data-lumi-screen]')];
  let mounted='desktop';const cleanup:Array<()=>void>=[];
  const formRequests=new Map<string,{requestId:string;submitted:string}>();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const bind=()=>{
    root.querySelectorAll<HTMLVideoElement>('video').forEach(video=>{
      if(video.hasAttribute('data-wr-banner-video'))return;
      video.muted=true;if(reduced.matches)video.pause();else video.play().catch(()=>{});
      const host=video.parentElement;if(!host||host.querySelector('[data-lumi-video-toggle]'))return;
      host.style.position='relative';const button=document.createElement('button');button.type='button';button.className='lumi-video-toggle';button.dataset.lumiVideoToggle='true';
      const update=()=>{button.textContent=video.paused?'▶':'Ⅱ';button.setAttribute('aria-label',video.paused?'Play background video':'Pause background video')};
      button.addEventListener('click',()=>{if(video.paused)video.play().catch(()=>{});else video.pause();update()});video.addEventListener('play',update);video.addEventListener('pause',update);host.appendChild(button);update();
    });
    root.querySelectorAll<HTMLElement>('[data-wr-banner="custom"]').forEach(banner=>{
      if(banner.dataset.wrBannerReady)return;banner.dataset.wrBannerReady='1';
      const slides=[...banner.querySelectorAll<HTMLElement>('[data-wr-slide]')],video=banner.querySelector<HTMLVideoElement>('[data-wr-banner-video]');
      const toggle=banner.querySelector<HTMLButtonElement>('[data-wr-banner-toggle]'),status=banner.querySelector<HTMLElement>('[data-wr-banner-status]');
      let index=0,manual=reduced.matches||banner.dataset.autoplay!=='true',hover=false,timer:ReturnType<typeof setInterval>|undefined;
      const controller=new AbortController();const show=()=>{slides.forEach((slide,i)=>{slide.hidden=i!==index;slide.setAttribute('aria-hidden',String(i!==index))});if(status)status.textContent=`${index+1} / ${slides.length}`};
      const label=()=>{if(toggle){const paused=video?video.paused:manual;toggle.textContent=paused?'▶':'Ⅱ';toggle.setAttribute('aria-label',paused?'Play banner':'Pause banner')}};
      const sync=()=>{clearInterval(timer);if(video){video.muted=true;if(manual||document.hidden)video.pause();else video.play().catch(()=>{manual=true;label()})}else if(slides.length>1&&!manual&&!hover&&!document.hidden)timer=setInterval(()=>{index=(index+1)%slides.length;show()},Math.min(30,Math.max(3,Number(banner.dataset.interval)||5))*1000);label()};
      const move=(direction:number)=>{if(!slides.length)return;manual=true;index=(index+direction+slides.length)%slides.length;show();sync()};
      banner.querySelector('[data-wr-banner-prev]')?.addEventListener('click',()=>move(-1));banner.querySelector('[data-wr-banner-next]')?.addEventListener('click',()=>move(1));toggle?.addEventListener('click',()=>{manual=video?!video.paused:!manual;sync()});
      banner.addEventListener('mouseenter',()=>{hover=true;sync()});banner.addEventListener('mouseleave',()=>{hover=false;sync()});banner.addEventListener('focusin',event=>{if(event.target!==toggle){manual=true;sync()}});
      document.addEventListener('visibilitychange',sync,{signal:controller.signal});document.addEventListener('wr:banner-media-ready',()=>{video?.load();sync()},{signal:controller.signal});reduced.addEventListener('change',()=>{if(reduced.matches)manual=true;sync()},{signal:controller.signal});video?.addEventListener('play',label);video?.addEventListener('pause',label);
      cleanup.push(()=>{controller.abort();clearInterval(timer);video?.pause()});show();sync();
    });
    root.querySelectorAll<HTMLElement>('.framer-slideshow').forEach(slider=>{
      const track=slider.firstElementChild?.firstElementChild as HTMLElement|undefined;if(!track)return;
      const initial=new DOMMatrixReadOnly(getComputedStyle(track).transform==='none'?undefined:getComputedStyle(track).transform).m41;track.querySelectorAll<HTMLElement>('[aria-hidden]').forEach(card=>{card.removeAttribute('aria-hidden');card.style.visibility='visible';card.querySelectorAll('[tabindex="-1"]').forEach(link=>link.removeAttribute('tabindex'))});
      let offset=0;const shift=(direction:number)=>{const first=track.querySelector<HTMLElement>('[data-framer-name^="Service Card"]')||track.firstElementChild as HTMLElement|null;const step=(first?.getBoundingClientRect().width||slider.clientWidth/3)+34;offset+=direction*step;if(Math.abs(offset)>step*5)offset=0;track.style.transition=reduced.matches?'none':'transform 450ms ease';track.style.transform=`translateX(${initial+offset}px)`};
      slider.querySelector<HTMLButtonElement>('button[aria-label="Previous"]')?.addEventListener('click',()=>shift(1));slider.querySelector<HTMLButtonElement>('button[aria-label="Next"]')?.addEventListener('click',()=>shift(-1));
      slider.querySelectorAll<HTMLButtonElement>('button[aria-label^="Scroll to page"]').forEach((button,i)=>button.addEventListener('click',()=>{offset=0;shift(-i)}));
    });
    const menu=root.querySelector<HTMLElement>('[data-lumi-mobile-menu]');
    const toggle=root.querySelector<HTMLButtonElement>('[data-lumi-menu-toggle]');
    toggle?.addEventListener('click',()=>{if(!menu)return;menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden))});
    root.querySelectorAll<HTMLElement>('[data-lumi-tabs]').forEach(group=>{
      const tabs=[...group.querySelectorAll<HTMLElement>('[data-lumi-tab]')];const panel=group.querySelector<HTMLElement>('[data-lumi-tab-content]');
      const descriptions=['We focus on delivering practical solutions that simplify complex workflows and help teams focus on what matters.','Our approach connects strategy, design and execution, with each step aligned to your goals.','Fresh perspectives turn opportunities into clear, useful next steps for your business.','Discuss your goals with our team and get thoughtful support for your next project.'];
      const activate=(tab:HTMLElement,i:number)=>{tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1});if(panel){const heading=panel.querySelector('h3,h4');if(heading)heading.textContent=tab.querySelector('h4,h5,h6')?.textContent||tab.textContent;const paragraph=panel.querySelector('p');if(paragraph)paragraph.textContent=descriptions[i%4]}};
      tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activate(tab,i));tab.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();activate(tab,i)}if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const next=(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();activate(tabs[next],next)}})});
    });
    root.querySelectorAll<HTMLFormElement>('form[data-lumi-form]').forEach(form=>{const key=form.dataset.lumiForm||'contact';const state=formRequests.get(key)||{requestId:crypto.randomUUID(),submitted:''};formRequests.set(key,state);form.addEventListener('submit',async event=>{
      event.preventDefault();const status=form.querySelector<HTMLElement>('[role="status"]');
      if(form.dataset.wrPreviewDisabled==='true'||!form.getAttribute('action')||form.getAttribute('action')==='#'){if(status)status.textContent='Private preview — no message is sent.';return}
      if(!form.reportValidity())return;const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');if(button)button.disabled=true;
      const fields=Object.fromEntries(new FormData(form));const productId=new URL(location.href).searchParams.get('productId');if(productId)fields.productId=productId;const serialized=JSON.stringify(fields);if(state.submitted&&state.submitted!==serialized)state.requestId=crypto.randomUUID();state.submitted=serialized;
      try{const response=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,requestId:state.requestId})});const result=await response.json() as {error?:string;message?:string};if(!response.ok)throw Error(result.message||result.error||'Unable to send your enquiry.');if(status)status.textContent='Thank you. Your enquiry has been sent.';form.reset();state.requestId=crypto.randomUUID();state.submitted=''}
      catch(error){if(status)status.textContent=error instanceof Error?error.message:'Unable to send your enquiry.'}
      finally{if(button)button.disabled=false}
    });});
    if(root.dataset.lumiPreview==='true')root.querySelectorAll<HTMLButtonElement>('button[type="submit"]').forEach(b=>b.disabled=true);
  };
  const mount=()=>{const screen=innerWidth<810?'mobile':innerWidth<1300?'tablet':'desktop';if(screen===mounted)return;const source=templates.find(t=>t.dataset.lumiScreen===screen);if(!source)return;
    const forms=[...root.querySelectorAll<HTMLFormElement>('form')].map(form=>[...form.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('input,textarea')].map(input=>({name:input.name,value:input.value})));
    cleanup.splice(0).forEach(dispose=>dispose());root.replaceChildren(source.content.cloneNode(true));mounted=screen;
    [...root.querySelectorAll<HTMLFormElement>('form')].forEach((form,index)=>{for(const field of forms[index]||[]){const input=[...form.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('input,textarea')].find(input=>input.name===field.name);if(input)input.value=field.value}});
    bind();window.dispatchEvent(new Event('wr:template-mounted'));
  };
  mount();if(mounted==='desktop')bind();
  addEventListener('keydown',event=>{if(event.key!=='Escape')return;const menu=root.querySelector<HTMLElement>('[data-lumi-mobile-menu]'),toggle=root.querySelector<HTMLButtonElement>('[data-lumi-menu-toggle]');if(menu&&!menu.hidden){menu.hidden=true;toggle?.setAttribute('aria-expanded','false');toggle?.focus()}});
  addEventListener('resize',mount,{passive:true});addEventListener('pagehide',()=>cleanup.splice(0).forEach(dispose=>dispose()));reduced.addEventListener('change',()=>root.querySelectorAll<HTMLVideoElement>('video').forEach(v=>{if(reduced.matches)v.pause();else v.play().catch(()=>{})}));
}
