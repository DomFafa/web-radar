/** Trusted first-party runtime, also installed explicitly in the sandboxed private preview. */
export const bannerRuntime = `(()=>{
for(const root of document.querySelectorAll('[data-wr-banner="custom"]')){
 if(root.dataset.wrBannerReady)continue;root.dataset.wrBannerReady='1';
 const slides=[...root.querySelectorAll('[data-wr-slide]')],video=root.querySelector('[data-wr-banner-video]');
 const previous=root.querySelector('[data-wr-banner-prev]'),next=root.querySelector('[data-wr-banner-next]'),toggle=root.querySelector('[data-wr-banner-toggle]'),status=root.querySelector('[data-wr-banner-status]');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');let index=0,manual=motion.matches||root.dataset.autoplay!=='true',hover=false,hidden=document.hidden,timer;
 const interval=Math.min(30,Math.max(3,Number(root.dataset.interval)||5))*1000;
 const show=()=>{slides.forEach((slide,i)=>{slide.hidden=i!==index;slide.setAttribute('aria-hidden',String(i!==index));});if(status)status.textContent=(index+1)+' / '+slides.length;};
 const label=()=>{if(toggle){const paused=video?video.paused:manual;toggle.textContent=paused?'▶':'Ⅱ';toggle.setAttribute('aria-label',paused?'Play banner':'Pause banner');toggle.setAttribute('aria-pressed',String(!paused));}};
 const sync=()=>{clearInterval(timer);if(video){video.muted=true;if(manual||hidden)video.pause();else if(video.getAttribute('src'))video.play().catch(error=>{if(error.name!=='AbortError'){manual=true;label();}});}else if(slides.length>1&&!manual&&!hover&&!hidden)timer=setInterval(()=>{index=(index+1)%slides.length;show();},interval);label();};
 const move=(step)=>{manual=true;index=(index+step+slides.length)%slides.length;show();sync();};
 previous?.addEventListener('click',()=>move(-1));next?.addEventListener('click',()=>move(1));
 toggle?.addEventListener('click',()=>{manual=video?!video.paused:!manual;sync();});
 root.addEventListener('mouseenter',()=>{hover=true;if(!video)sync();});root.addEventListener('mouseleave',()=>{hover=false;if(!video)sync();});
 root.addEventListener('focusin',event=>{if(event.target!==toggle){manual=true;sync();}});
 document.addEventListener('visibilitychange',()=>{hidden=document.hidden;sync();});
 motion.addEventListener('change',()=>{if(motion.matches)manual=true;sync();});
 video?.addEventListener('play',label);video?.addEventListener('pause',label);video?.addEventListener('error',()=>{manual=true;label();});
 document.addEventListener('wr:banner-media-ready',()=>{video?.load();sync();});
 window.addEventListener('pagehide',()=>{clearInterval(timer);video?.pause();});
 show();sync();
}
})();`;
