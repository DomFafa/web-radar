/** First-party interactions allowed both in generated pages and the private preview. */
export function materialsRuntime(){
  if(!document.querySelector('.wr-materials-site'))return;
  const mobile=matchMedia('(max-width:767px)');
  const posters=()=>document.querySelectorAll<HTMLVideoElement>('video[data-wr-desktop-poster]').forEach(video=>{video.poster=(mobile.matches?video.dataset.wrMobilePoster:video.dataset.wrDesktopPoster)||'';});
  mobile.addEventListener('change',posters);posters();
  window.addEventListener('wr:materials-media-ready',posters);
  document.querySelectorAll<HTMLElement>('.senseng-detail-thumbs').forEach(group=>{
    const buttons=Array.from(group.querySelectorAll<HTMLElement>('[data-wr-material-thumb]'));
    const main=document.querySelector<HTMLImageElement>('#detailMainImg');if(!main||!buttons.length)return;
    let current=0;
    const show=(index:number)=>{current=(index+buttons.length)%buttons.length;const image=buttons[current].querySelector<HTMLImageElement>('img');if(!image)return;
      main.closest('picture')?.querySelectorAll('source').forEach(source=>source.remove());main.src=image.currentSrc||image.src;main.alt=image.alt;
      main.style.cssText=image.style.cssText;buttons.forEach((button,i)=>button.classList.toggle('active',i===current));
    };
    buttons.forEach((button,i)=>{button.addEventListener('click',()=>show(i));button.setAttribute('role','button');button.tabIndex=0;button.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();show(i);}});});
    const arrows=group.querySelectorAll('.senseng-thumb-arrow');arrows[0]?.addEventListener('click',()=>show(current-1));arrows[1]?.addEventListener('click',()=>show(current+1));
  });
}
