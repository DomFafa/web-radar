export const referenceOverrides = `
.wr-crafto-hero {
  height: calc(100svh - 92px);
  min-height: 720px;
  margin-top: 92px;
  position: relative;
  border-radius: 6px;
  overflow: hidden;
}
.wr-crafto-hero [data-wr-slide] {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}
.wr-crafto-rings {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    #163354a8 0 439px,
    #16335466 440px 586px,
    #16233f1a 587px
  );
}
.wr-crafto-copy {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  color: white;
  padding: 60px 24px;
}
.wr-crafto-copy > span {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 1px;
  margin-bottom: 25px;
}
.wr-crafto-copy h1,
.wr-crafto-copy h2 {
  font-size: 73px;
  font-weight: 700;
  line-height: 68px;
  max-width: 720px;
  color: white;
  letter-spacing: -2px;
  margin: 0 0 32px;
  text-shadow: 3px 3px 15px #0b1236;
}
.wr-crafto-copy p {
  font-size: 20px;
  font-weight: 300;
  line-height: 35px;
  max-width: 490px;
  color: #fff9;
  margin: 0 0 35px;
}
.wr-crafto-copy a {
  background: linear-gradient(110deg, #ff7d4d, #ed5273, #aa4ad8);
  border-radius: 40px;
  color: white;
  font-size: 18px;
  padding: 20px 45px;
}
.wr-quality {
  position: absolute;
  top: 18%;
  right: 13%;
  width: 119px;
  height: 119px;
  border-radius: 50%;
  background: #5758df;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: white;
  font-size: 13px;
  text-align: center;
}
[data-wr-slider] > button {
  position: absolute;
  top: 50%;
  z-index: 5;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1px solid #ffffff50;
  background: #ffffff17;
  color: white;
  font-size: 22px;
  cursor: pointer;
}
[data-wr-prev] {
  left: 30px;
}
[data-wr-next] {
  right: 30px;
}
[data-wr-slide][hidden] {
  display: none !important;
}
.wr-juno-hero {
  position: relative;
  width: 100vw;
  left: 50%;
  margin-left: -50vw;
  height: 650px;
  background: #d9effb;
  overflow: hidden;
}
.wr-juno-hero [data-wr-slide] {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}
.wr-juno-copy {
  position: relative;
  max-width: 1170px;
  margin: auto;
  padding: 190px 0 80px;
  color: #172849;
}
.wr-juno-copy h1,
.wr-juno-copy h2 {
  font-family: Quicksand, sans-serif;
  font-weight: 700;
  font-size: 56px;
  line-height: 1.13;
  max-width: 520px;
  color: #172849;
  margin: 0 0 25px;
  letter-spacing: -1.5px;
}
.wr-juno-copy p {
  font-family: "DM Sans", sans-serif;
  font-size: 17px;
  line-height: 26px;
  max-width: 460px;
  color: #334768;
  margin: 0 0 37px;
}
.wr-juno-copy a {
  display: inline-block;
  padding: 19px 42px;
  border-radius: 6px;
  background: #277cd1;
  color: white;
  font:
    600 15px "DM Sans",
    sans-serif;
}
.wr-juno-clouds {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  max-width: none !important;
  pointer-events: none;
}
.wr-juno-hero > button {
  background: white;
  color: #172849;
  top: 45%;
  border: 0;
  width: 40px;
  height: 40px;
}
.wr-consulting-hero {
  position: relative;
}
.wr-consulting-hero .slider-area {
  width: 100% !important;
  left: 0 !important;
  opacity: 1 !important;
  visibility: visible !important;
}
.wr-consulting-hero .title span {
  color: #a680ff;
}
.corpox-ai-agency h1 .wr-emphasis {
  color: #ef6464;
}
@media (max-width: 991px) {
  .wr-crafto-hero {
    min-height: 650px;
    height: calc(100svh - 80px);
    margin-top: 80px;
  }
  .wr-crafto-copy h1,
  .wr-crafto-copy h2 {
    font-size: 56px;
    line-height: 1.05;
    max-width: 640px;
  }
  .wr-quality {
    display: none;
  }
  .wr-juno-copy {
    padding-left: 70px;
    padding-right: 40px;
  }
  .wr-juno-copy h1,
  .wr-juno-copy h2 {
    max-width: 430px;
    font-size: 48px;
  }
  .wr-juno-copy p {
    max-width: 360px;
  }
}
@media (max-width: 575px) {
  .wr-crafto-hero {
    min-height: 660px;
  }
  .wr-crafto-copy {
    padding: 60px 30px;
  }
  .wr-crafto-copy h1,
  .wr-crafto-copy h2 {
    font-size: 46px;
    line-height: 1.1;
    letter-spacing: -1px;
  }
  .wr-crafto-copy p {
    font-size: 17px;
    line-height: 28px;
  }
  [data-wr-slider] > button {
    width: 32px;
    height: 32px;
    top: auto;
    bottom: 20px;
  }
  .wr-juno-hero {
    height: 650px;
  }
  .wr-juno-hero [data-wr-slide] {
    background-position: 60% center;
  }
  .wr-juno-copy {
    padding: 80px 28px 60px;
    background: linear-gradient(90deg, #e8f5ffe8, #e8f5ff70, transparent);
    height: 100%;
  }
  .wr-juno-copy h1,
  .wr-juno-copy h2 {
    font-size: 42px;
    max-width: 290px;
  }
  .wr-juno-copy p {
    max-width: 270px;
    font-size: 16px;
  }
  .wr-consulting-hero .title {
    font-size: 48px !important;
    line-height: 1.15 !important;
  }
}

.wr-reference .tmp-title-split *,
.wr-reference .splitted * {
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
}
.wr-reference .line-effect {
  display: none !important;
}
.wr-reference .slick-track {
  transform: none !important;
  width: auto !important;
  display: flex;
  gap: 0;
}
.wr-reference .slick-track > .slick-slide {
  display: block;
  flex-shrink: 0;
  opacity: 1 !important;
  visibility: visible !important;
}
.wr-reference .slick-list {
  overflow: auto;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
}
.wr-reference .slick-track > .slick-slide {
  scroll-snap-align: start;
}
.wr-reference .brand-list .slick-slide {
  flex: 0 0 calc(100% / 6 - 30px);
  margin: 0 15px;
}
.wr-reference .brand-list img {
  opacity: 1 !important;
}
.wr-reference .tmp-header .wr-reference-brand {
  color: inherit;
}
.wr-reference.corpox-consulting .header-transparent .wr-reference-brand {
  color: white;
}
.wr-reference .odometer-digit-spacer {
  display: none !important;
}
.wr-reference.saas-automation header nav a,
.wr-reference.fintech-platform header nav a,
.wr-reference.digital-marketing header nav a {
  color: #525252 !important;
}
.digital-marketing main > section:first-child .marquee img {
  filter: brightness(0);
  opacity: 0.65;
}
.wr-reference .navbar-modern-inner,
.wr-reference .navbar-show-modern-bg {
  display: none !important;
}
.wr-reference .swiper,
.wr-reference .swiper-container {
  overflow: hidden;
  max-width: 100%;
}
.wr-reference .swiper-slide {
  max-width: 100%;
}
.wr-reference.crafto-corporate .box-layout {
  overflow: clip;
  max-width: 100%;
}
.wr-reference .brand-list .slick-slide img {
  filter: brightness(0);
  opacity: 0.65 !important;
}
.wr-reference .appear-animation,
.wr-reference .animated-icon {
  animation: none !important;
  transform: none !important;
  opacity: 1 !important;
}
.wr-reference .animated-icon svg {
  opacity: 1 !important;
}
.juno-toys header .wr-reference-brand {
  min-height: 70px;
}
.juno-toys .wr-juno-copy {
  max-width: 1290px;
  padding-top: 200px;
}
.juno-toys .wr-juno-copy h1,
.juno-toys .wr-juno-copy h2 {
  max-width: 460px;
  line-height: 52px;
  letter-spacing: -2px;
  color: #181d4e;
}
.juno-toys .wr-juno-copy p {
  max-width: 430px;
  line-height: 24px;
  color: #5e6071;
}
.juno-toys .wr-juno-clouds {
  top: 40px;
  bottom: auto;
  left: 50%;
  transform: translateX(-50%);
  width: 1269px;
  height: 117px;
}
.wr-crafto-rings {
  background: radial-gradient(
    circle at center,
    #16233fa5 0 439px,
    #16233f70 440px 586px,
    #16233f1a 587px
  );
}
.wr-quality {
  top: 8.4%;
  right: 9%;
  background: #3c2fc0;
  text-transform: uppercase;
  font-size: 12px;
  line-height: 16px;
}
.wr-crafto-copy a {
  position: relative;
  background: linear-gradient(100deg, #ff6639, #3c2fc0);
  padding: 18px 72px 18px 48px;
}
.wr-crafto-copy a:after {
  content: "→";
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: white;
  color: #3c2fc0;
  font-size: 25px;
  line-height: 42px;
  text-align: center;
}
.wr-crafto-hero > [data-wr-prev] {
  left: 50px;
}
.wr-crafto-hero > [data-wr-next] {
  right: 50px;
}
.wr-consulting-hero > button {
  top: auto;
  bottom: 52px;
  border: 0;
  background: #9385d6;
  font-size: 0;
  width: 10px;
  height: 10px;
}
.wr-consulting-hero > [data-wr-prev] {
  left: calc(50% - 24px);
}
.wr-consulting-hero > [data-wr-next] {
  right: calc(50% - 24px);
}
.wr-consulting-hero:after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 20px;
  opacity: 0.8;
  background: repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 9px);
  clip-path: polygon(
    0 20%,
    3% 0,
    6% 80%,
    9% 0,
    12% 65%,
    15% 0,
    20% 90%,
    24% 0,
    29% 70%,
    35% 0,
    42% 85%,
    48% 0,
    56% 65%,
    60% 0,
    65% 90%,
    70% 0,
    79% 70%,
    83% 0,
    89% 80%,
    96% 0,
    100% 60%,
    100% 100%,
    0 100%
  );
}
@media (max-width: 575px) {
  .juno-toys header .wr-reference-brand {
    min-height: 38px;
  }
  .juno-toys .wr-juno-copy {
    padding-top: 100px;
  }
  .juno-toys .wr-juno-copy h1,
  .juno-toys .wr-juno-copy h2 {
    max-width: 290px;
    line-height: 1.1;
  }
  .juno-toys .wr-juno-clouds {
    width: 700px;
    height: auto;
    top: 12px;
  }
  .wr-crafto-hero > [data-wr-prev] {
    left: 25px;
  }
  .wr-crafto-hero > [data-wr-next] {
    right: 25px;
  }
}
.wr-video-toggle {
  z-index: 40;
  top: 110px;
  bottom: auto;
  right: max(24px, calc((100vw - 1290px) / 2));
  background: #17284977;
}
.saas-automation figure:has(img[alt="bottom-gradient"]) {
  pointer-events: none;
}
.wr-reference .accordion-content .split-text-line {
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
}
.wr-inner .detail {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 56px;
  align-items: start;
}
.wr-inner .chapter {
  margin-top: 80px;
}
.wr-inner .specs dt {
  font-weight: 600;
}
.wr-inner .specs dd {
  margin: 8px 0;
}
.wr-inner .text-link {
  display: inline-block;
  margin: 14px 0;
}
.saas-automation .wr-inner .button {
  color: #172014;
}
@media (max-width: 767px) {
  .wr-inner .detail {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
html {
  scroll-behavior: smooth;
}
body.wr-reference {
  overflow-x: clip;
  margin: 0;
}
.wr-reference * {
  box-sizing: border-box;
}
[data-ns-animate],
[data-text-reveal],
[data-anime],
.appear-animation,
.elementor-invisible,
.wow {
  opacity: 1 !important;
  visibility: visible !important;
  filter: none !important;
}
[data-text-reveal] .text-reveal-line,
.text-anime-style-2 div,
.split-inner {
  transform: none !important;
  opacity: 1 !important;
}
.wr-reference .wr-reference-brand {
  display: inline-flex;
  align-items: center;
  min-width: 100px;
  max-width: 205px;
  font-size: 26px;
  font-weight: 750;
  line-height: 1.05;
  letter-spacing: -1px;
  color: inherit;
  text-decoration: none;
}
.wr-reference-brand img {
  width: auto !important;
  height: auto !important;
  max-width: 180px !important;
  max-height: 48px !important;
  object-fit: contain;
}
.wr-reference header .wr-reference-brand {
  color: var(--wr-ink);
}
.wr-reference footer .wr-reference-brand {
  color: inherit;
}
.wr-reference [data-wr-bound-product] {
  object-fit: contain !important;
  background: transparent;
}
.wr-reference img {
  max-width: 100%;
}
.wr-reference video {
  object-fit: cover;
  max-width: none;
}
.wr-reference.saas-automation #hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.wr-video-toggle {
  position: absolute;
  z-index: 15;
  right: 28px;
  bottom: 28px;
  border: 1px solid #ffffff80;
  border-radius: 100%;
  width: 40px;
  height: 40px;
  background: #0005;
  color: white;
  cursor: pointer;
}
.wr-reference .dropdown-menu,
.wr-reference .tmp-megamenu,
.wr-reference .popup-mobile-menu {
  display: none !important;
}
.wr-reference .header-sticky.sticky,
.wr-reference .sticky-active {
  position: relative !important;
}
.wr-reference .swiper-wrapper {
  height: auto;
}
.wr-reference .swiper-slide {
  flex-shrink: 0;
}
.wr-reference .owl-stage-outer {
  overflow: hidden;
}
.wr-reference .owl-stage {
  display: flex;
}
.wr-reference .owl-item {
  flex-shrink: 0;
}
.wr-reference .slick-cloned {
  display: none !important;
}
.wr-reference .slick-list {
  overflow: hidden;
}
.wr-reference .cd-words-wrapper {
  width: auto !important;
}
.wr-reference .cd-words-wrapper b.is-hidden {
  display: none;
}
.wr-reference .cd-words-wrapper b.is-visible {
  position: relative;
  opacity: 1;
}
.wr-reference .odometer-inside {
  white-space: nowrap;
}
.wr-mobile-nav {
  display: none;
}
.wr-mobile-nav summary {
  cursor: pointer;
  list-style: none;
  font-size: 24px;
}
.wr-mobile-nav nav {
  position: absolute;
  top: 64px;
  right: 16px;
  min-width: 220px;
  padding: 20px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 15px 50px #0002;
  display: grid;
  gap: 16px;
}
.wr-mobile-nav a {
  color: var(--wr-ink);
}
.wr-products {
  font-family: var(--wr-font), sans-serif;
  color: var(--wr-ink);
  padding: 100px max(24px, calc((100% - 1290px) / 2));
  background: var(--wr-surface);
  clear: both;
}
.wr-section-title {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 40px;
}
.wr-section-title h2 {
  font-family: inherit;
  font-size: 48px;
  line-height: 1.15;
  margin: 0;
  color: inherit;
  letter-spacing: -1.6px;
}
.wr-section-title a {
  color: inherit;
  white-space: nowrap;
}
.wr-product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}
.wr-product-card {
  min-width: 0;
  background: white;
  border-radius: 20px;
  padding: 20px;
}
.wr-product-card a {
  text-decoration: none;
  color: var(--wr-ink);
}
.wr-product-card img {
  width: 100%;
  height: 240px;
  object-fit: contain;
}
.wr-product-card h3 {
  font:
    600 22px/1.3 var(--wr-font),
    sans-serif;
  margin: 24px 0 12px;
  color: inherit;
}
.wr-product-card p {
  font:
    400 15px/1.7 var(--wr-font),
    sans-serif;
  color: inherit;
  opacity: 0.72;
}
.wr-product-card .wr-details {
  font-size: 14px;
  font-weight: 600;
  display: block;
  margin-top: 20px;
}
.wr-inner {
  font:
    400 17px/1.75 var(--wr-font),
    sans-serif;
  color: var(--wr-ink);
  background: white;
}
.wr-inner h1,
.wr-inner h2,
.wr-inner h3 {
  font-family: inherit;
  color: inherit;
}
.wr-inner-title {
  padding: 180px max(24px, calc((100% - 1290px) / 2)) 80px;
  background: var(--wr-surface);
}
.wr-inner-title h1 {
  font-size: clamp(40px, 5vw, 68px);
  line-height: 1.12;
  letter-spacing: -2px;
  max-width: 1000px;
  margin: 0;
}
.wr-inner-body {
  max-width: 1290px;
  padding: 80px 24px;
  margin: auto;
}
.wr-inner .grid,
.wr-inner .contact-layout,
.wr-inner .detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
}
.wr-inner .grid {
  grid-template-columns: repeat(3, 1fr);
}
.wr-inner .page-heading {
  margin-bottom: 40px;
}
.wr-inner .product-image img,
.wr-inner .detail-image img {
  width: 100%;
  height: 360px;
  object-fit: contain;
}
.wr-inner a {
  color: var(--wr-ink);
}
.wr-inner .product-card {
  padding: 24px;
  background: var(--wr-surface);
  border-radius: 16px;
}
.wr-inner .form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.wr-inner .field {
  display: grid;
  gap: 8px;
}
.wr-inner .field.full,
.wr-inner .form-status {
  grid-column: 1/-1;
}
.wr-inner input,
.wr-inner select,
.wr-inner textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 14px;
  background: white;
  color: var(--wr-ink);
  font: inherit;
}
.wr-inner .button {
  display: inline-block;
  border: 0;
  border-radius: 8px;
  padding: 16px 24px;
  background: var(--wr-accent);
  color: white;
  font:
    600 15px var(--wr-font),
    sans-serif;
  cursor: pointer;
}
.wr-inner .honeypot {
  position: absolute;
  left: -10000px;
}
.wr-inner .hero,
.wr-inner .contact-band,
.wr-inner .story-visual {
  display: none;
}
.wr-inner .specs div {
  padding: 16px 0;
  border-bottom: 1px solid #ddd;
}
@media (max-width: 991px) {
  .wr-mobile-nav {
    display: block;
    position: fixed;
    z-index: 1000;
    right: 32px;
    top: 30px;
    color: var(--wr-ink);
    background: white;
    border-radius: 8px;
    padding: 2px 10px;
  }
  .wr-reference header button[data-bs-toggle],
  .wr-reference .hamburger,
  .wr-reference .mobile-menu-bar {
    display: none !important;
  }
  .wr-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .wr-products {
    padding: 64px 24px;
  }
  .wr-section-title h2 {
    font-size: 36px;
  }
  .wr-inner .contact-layout,
  .wr-inner .detail-layout {
    grid-template-columns: 1fr;
  }
  .wr-inner .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 575px) {
  .wr-reference .wr-reference-brand {
    font-size: 20px;
    max-width: 155px;
  }
  .wr-reference-brand img {
    max-width: 140px !important;
    max-height: 38px !important;
  }
  .wr-product-grid {
    gap: 12px;
  }
  .wr-product-card {
    padding: 12px;
    border-radius: 14px;
  }
  .wr-product-card img {
    height: 155px;
  }
  .wr-product-card h3 {
    font-size: 18px;
  }
  .wr-section-title {
    align-items: start;
    flex-direction: column;
  }
  .wr-inner .grid,
  .wr-inner .form-grid {
    grid-template-columns: 1fr;
  }
  .wr-inner-title {
    padding-top: 130px;
  }
  .wr-mobile-nav {
    right: 26px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .wr-reference * {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}

.corpox-ai-agency header .wr-reference-brand { color: #161616 !important; }
.wr-reference .tmp-jump__item { transform: none !important; }
@media (max-width: 767px) {
  .wr-reference header .header-btn .tmp-btn,
  .wr-reference header .dot-btn,
  .wr-reference header .search-area-btn { display: none !important; }
  .wr-reference .brand-list .slick-slide { flex: 0 0 calc(50% - 24px); margin: 0 12px; }
}

/* Source carousels initialize only after scrolling; retain their horizontal layout without the vendor plugin. */
.porto-accounting .owl-carousel.carousel-half-full-width-right {
  display: flex !important;
  width: calc(100vw - max(24px, (100vw - 1140px) / 2));
  gap: 20px;
  align-items: flex-start;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
}
.porto-accounting .owl-carousel.carousel-half-full-width-right > div {
  flex: 0 0 calc((100% - 80px) / 5);
  min-width: 0;
  scroll-snap-align: start;
}
.wr-owl-controls { display: flex; gap: 10px; margin-top: 24px; }
.wr-owl-controls button { width: 54px; height: 54px; border: 2px solid #fff; border-radius: 50%; background: transparent; color: white; font-size: 25px; cursor: pointer; }
.corpox-consulting .large-video-playing video { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; }
.corpox-consulting .grow-thumbnail-1-overlay { display: none; }
@media (max-width: 1199px) { .porto-accounting .owl-carousel.carousel-half-full-width-right > div { flex-basis: calc((100% - 60px) / 4); } }
@media (max-width: 991px) { .porto-accounting .owl-carousel.carousel-half-full-width-right > div { flex-basis: calc((100% - 40px) / 3); } }
@media (max-width: 767px) { .porto-accounting .owl-carousel.carousel-half-full-width-right > div { flex-basis: 100%; } }
`;
