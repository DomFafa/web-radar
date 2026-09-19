/** First-party interactions allowed both in generated pages and the private preview. */
export function materialsRuntime(){
  const isMaterials = Boolean(document.querySelector('.wr-materials-site'));
  if (isMaterials) {
    const mobile=matchMedia('(max-width:767px)');
    const posters=()=>document.querySelectorAll<HTMLVideoElement>('video[data-wr-desktop-poster]').forEach(video=>{video.poster=(mobile.matches?video.dataset.wrMobilePoster:video.dataset.wrDesktopPoster)||'';});
    mobile.addEventListener('change',posters);posters();
    window.addEventListener('wr:materials-media-ready',posters);
  }
  document.querySelectorAll<HTMLElement>('.senseng-detail-thumbs').forEach(group=>{
    const buttons=Array.from(group.querySelectorAll<HTMLElement>('[data-wr-material-thumb], .senseng-thumb-btn, .wr-detail-thumb'));
    const main=document.querySelector<HTMLImageElement>('#detailMainImg')||document.querySelector<HTMLImageElement>('#wr-detail-main-img');if(!main||!buttons.length)return;
    let current=Math.max(0, buttons.findIndex(b=>b.classList.contains('active')));
    const show=(index:number)=>{
      current=(index+buttons.length)%buttons.length;
      const btn=buttons[current];
      const image=btn.querySelector<HTMLImageElement>('img');
      const src=btn.getAttribute('data-src')||btn.getAttribute('data-large')||image?.src;
      if(!src)return;
      main.closest('picture')?.querySelectorAll('source').forEach(source=>source.remove());
      main.removeAttribute('srcset');main.removeAttribute('sizes');
      main.src=src;
      if(image?.alt)main.alt=image.alt;
      if(image?.style?.cssText)main.style.cssText=image.style.cssText;
      buttons.forEach((button,i)=>button.classList.toggle('active',i===current));
    };
    buttons.forEach((button,i)=>{
      button.addEventListener('click',()=>show(i));
      button.setAttribute('role','button');
      button.tabIndex=0;
      button.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();show(i);}});
    });
    const arrows=group.querySelectorAll('.senseng-thumb-arrow');
    arrows[0]?.addEventListener('click',()=>show(current-1));
    arrows[1]?.addEventListener('click',()=>show(current+1));
  });
}

