// Responsive reference geometry lives in motion-v2/reference.css. Only native interaction and project components below.
export const auravellFixes = `
.auravell .rt-button-v1{color:#fff}.auravell .rt-button-v1[class*="w-variant-"]{color:#99582a}.auravell .rt-button-icon.rt-1{transform:scale(0)}
/* Native interactions preserve the reference cascade and geometry. */
html{scroll-behavior:smooth}.auravell{overflow-x:clip}.auravell [hidden]{display:none!important}
.auravell :is(h1,h2,h3,h4,p,a){overflow-wrap:break-word;word-break:normal}.auravell :is(.w-layout-grid,.w-layout-hflex,.w-layout-vflex)>*{min-width:0}
.auravell :is(a,button,[role=button],[role=tab]):focus-visible{outline:3px solid #99582a;outline-offset:5px}.auravell img[data-wr-material-image]{object-position:var(--auravell-position,50% 50%)}.auravell-picture{display:contents}
.auravell .rt-navbar{position:relative}.auravell .rt-nav-section-v1{position:fixed;top:0;left:0;right:0}.auravell .rt-navbar-menu-dropdown.w--open{display:block;opacity:1;transform:none}.av-page-menu{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;padding:32px;background:white;box-shadow:0 16px 32px #17181a18}.av-page-menu a{padding:10px;color:#2a2b2f}.av-page-menu a:hover{color:#99582a}.av-brand{max-width:260px}.av-brand span{overflow-wrap:anywhere}.auravell:has(.av-preview-bar) .rt-nav-section-v1{top:var(--av-preview-height,36px)}.av-preview-bar{position:relative;z-index:60;text-align:center;background:#f5ede1;padding:8px;color:#99582a;font:13px/1.4 Inter,Arial,sans-serif}
.auravell .rt-programs-divider-v1{transform-origin:left;transform:scaleX(0);transition:transform .5s ease}.auravell .rt-programs-card-v1{transition:border-color .35s}.auravell .rt-programs-icon-v1{transition:color .3s}.auravell .rt-programs-card-v1.av-active{border-top-color:transparent}.auravell .av-active .rt-programs-divider-v1{transform:scaleX(1)}.auravell .av-active .rt-programs-icon-v1{color:#99582a}
.auravell .rt-offerings-card-content{transform:translateY(100%);transition:transform .65s cubic-bezier(.22,1,.36,1)}.auravell .rt-offerings-card-v1>img{transition:scale .65s cubic-bezier(.22,1,.36,1)}.auravell .rt-offerings-card-v1.av-active .rt-offerings-card-content{transform:translateY(0)}.auravell .rt-offerings-card-v1.av-active>img{scale:1.15}
.auravell .rt-practice-top-part>div{cursor:pointer}.auravell .rt-practice-itemrow-v1{transition:translate .65s,color .4s}.auravell .rt-practice-divider-v1{transform:scaleX(0);transform-origin:left;transition:transform .65s}.auravell .av-active .rt-practice-itemrow-v1{translate:15px 0;color:#99582a}.auravell .av-active .rt-practice-divider-v1{transform:scaleX(1)}.auravell .rt-practice-photocol-v1{isolation:isolate}.auravell .rt-practice-photocol-v1 img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.auravell .rt-practice-photocol-v1:after{content:'';display:block;aspect-ratio:1}
.auravell .rt-button-overlay{transition:width .4s ease}.auravell [button=v1] .rt-button-text,.auravell [button=v1] .rt-button-icon{transition:transform .4s ease}.auravell [button=v1]:is(:hover,:focus-visible) .rt-button-overlay{width:100%}.auravell [button=v1]:is(:hover,:focus-visible) .rt-button-text{transform:translateX(.5rem)}.auravell [button=v1]:is(:hover,:focus-visible) .rt-button-icon.rt-1{transform:translateX(.5rem) scale(1)}.auravell [button=v1]:is(:hover,:focus-visible) .rt-button-icon.rt-2{transform:scale(0)}
.auravell [team-card] img,.auravell [card-hover] img[card-image]{transition:transform .5s ease}.auravell [team-card]:is(:hover,:focus-within) img,.auravell [card-hover]:is(:hover,:focus-within) img[card-image]{transform:scale(1.1) rotate(-2deg)}.auravell .rt-team-card-overlay{opacity:0;transition:opacity .4s}.auravell [team-card]:is(:hover,:focus-within) .rt-team-card-overlay{opacity:1}.auravell .rt-team-frame{opacity:0;transform:scale(.5);transition:opacity .4s,transform .4s}.auravell [team-card]:is(:hover,:focus-within) .rt-team-frame{opacity:1;transform:scale(1)}
.auravell .rt-faq-top-content{cursor:pointer}.auravell .rt-faq-answer{height:auto;overflow:hidden}.auravell .rt-faq-icon{transition:transform .3s}.auravell .rt-faq-top-content[aria-expanded=true] .rt-faq-minus-icon{transform:rotate(90deg)}
.auravell .w-background-video video{object-fit:cover}.auravell .w-backgroundvideo-backgroundvideoplaypausebutton{cursor:pointer}.auravell .rt-video-btn-v1{color:#99582a}.auravell .w-tab-link{cursor:pointer}.auravell .rt-mobile-slider .w-slider-mask{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;white-space:normal}.auravell .rt-mobile-slider .w-slide{flex:0 0 100%;scroll-snap-align:start}.auravell .w-slider-nav{display:flex;justify-content:center;gap:8px}.av-slider-dot{border:0;width:10px;height:10px;border-radius:50%;background:#d7d2c8;padding:0}.av-slider-dot[aria-current=true]{background:#99582a}
.av-plans-inquiry{padding:40px;background:#f5ede1;border-radius:8px;margin:20px 0}.av-plans-inquiry .rt-button-v1{padding:16px 24px;color:white}.auravell .auravell-detail-section{padding-top:150px}.auravell-detail-thumbs{max-width:100%}.auravell-detail-gallery{min-width:0}.av-form-host{width:100%}
@media(max-width:991px){.auravell .rt-navbar-menu-wrapper[data-nav-menu-open]{display:block;position:absolute;top:100%;left:0;right:0;max-height:75svh;overflow:auto;background:white;padding:20px;border-radius:8px}.auravell .rt-navbar-inner-wrap{align-items:stretch}.auravell .av-page-menu{grid-template-columns:1fr 1fr;gap:8px;padding:16px}.auravell .rt-navbar-menu-dropdown.w--open{position:static}.auravell .av-brand{max-width:calc(100vw - 145px)}.auravell .rt-menu-button-main{flex:none}.auravell .rt-menu-line{transition:transform .35s,opacity .35s}.auravell .rt-menu-button-main.w--open .rt-menu-line:first-child{transform:translateY(6px) rotate(45deg)}.auravell .rt-menu-button-main.w--open .rt-menu-line:nth-child(2){opacity:0}.auravell .rt-menu-button-main.w--open .rt-menu-line:last-child{transform:translateY(-6px) rotate(-45deg)}}
@media(max-width:600px){.auravell img[data-wr-material-image]{object-position:var(--auravell-mobile-position,50% 50%)}.auravell .auravell-detail-section{padding-top:125px}.auravell .auravell-detail-content h1{font-size:34px}.auravell-inquiry-box{padding:20px}.auravell .rt-practice-itemrow-v1{translate:0!important}.av-brand span{font-size:20px!important}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.auravell *, .careflow-healthcare *{scroll-behavior:auto!important;transition:none!important;animation:none!important}.auravell [team-1],.auravell [team-2]{transform:none}.auravell .rt-team-frame{transition:none}}
/* Dynamic Class & Detail Components */
.auravell-class-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
  margin-top: 40px;
}
@media (max-width: 991px) {
  .auravell-class-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
}
@media (max-width: 640px) {
  .auravell-class-grid {
    grid-template-columns: 1fr;
  }
}
.auravell-class-card {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(215, 210, 200, 0.5);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.auravell-class-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(153, 88, 42, 0.12);
}
.auravell-class-card img {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
}
.auravell-class-card-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.auravell-class-card h3 {
  font-size: 22px;
  margin: 0 0 8px;
  font-family: "Playfair Display", Georgia, serif;
}
.auravell-class-card p {
  font-size: 15px;
  line-height: 1.6;
  color: #555;
  margin: 0 0 16px;
  flex-grow: 1;
}
.auravell-class-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #99582a;
  border-top: 1px solid #f0ebe1;
  padding-top: 12px;
}

/* Detail page styling */
.auravell-detail-section {
  max-width: 1240px;
  margin: 0 auto;
  padding: 80px 24px 120px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 56px;
}
@media (max-width: 860px) {
  .auravell-detail-section {
    grid-template-columns: 1fr;
    gap: 36px;
    padding-top: 40px;
  }
}
.auravell-detail-gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.auravell-detail-main-img {
  width: 100%;
  border-radius: 20px;
  aspect-ratio: 4/3;
  object-fit: cover;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}
.auravell-detail-thumbs {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}
.auravell-detail-thumb {
  width: 84px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
}
.auravell-detail-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.auravell-detail-thumb.active {
  border-color: #99582a;
}
.auravell-detail-content h1 {
  font-size: 42px;
  margin: 0 0 16px;
  font-family: "Playfair Display", Georgia, serif;
}
.auravell-detail-content .lead {
  font-size: 18px;
  line-height: 1.7;
  color: #444;
  margin-bottom: 24px;
}
.auravell-detail-features {
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
}
.auravell-detail-features li {
  padding: 8px 0 8px 28px;
  position: relative;
  font-size: 15px;
  color: #333;
}
.auravell-detail-features li::before {
  content: "✦";
  position: absolute;
  left: 0;
  color: #99582a;
}

/* Inquiry form in Auravell style */
.auravell-inquiry-box {
  background: #fdfaf4;
  border: 1px solid #ebdccb;
  border-radius: 20px;
  padding: 32px;
  margin-top: 32px;
}
.auravell-inquiry-box input,
.auravell-inquiry-box textarea,
.auravell-inquiry-box select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d9cdbd;
  border-radius: 10px;
  background: #ffffff;
  font-size: 15px;
  margin-bottom: 16px;
  font-family: "Inter", sans-serif;
  box-sizing: border-box;
}
.auravell-inquiry-box button[type="submit"] {
  background: #99582a;
  color: #ffffff;
  border: 0;
  border-radius: 30px;
  padding: 14px 32px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  transition: opacity 0.2s;
}
.auravell-inquiry-box button[type="submit"]:hover {
  opacity: 0.9;
}

`;
