/**
 * Brand accents for the active native templates. The caller adds these rules
 * only when a customer colour is selected, after the template's own styles.
 * Keep these selectors on interface elements: photos, video, masks and the
 * reference templates' motion/layout declarations must remain untouched.
 */
export const templateBrandColorRules: Record<string, string> = {
  auravell: `
body.wr-brand-color{--_colors---accent-color--accent-100:var(--wr-brand)!important;--_colors---accent-color--accent-200:var(--wr-brand-soft)!important;--_colors---text-color--text-tertiary:var(--wr-brand-link)!important;--_colors---background-color--bg-quinary:var(--wr-brand)!important}
body.wr-brand-color .rt-button-v1:not(.w-variant-db0400f1-88db-5b2d-aa8c-a7f3dad18f61),body.wr-brand-color .auravell-inquiry-box button[type="submit"]{background-color:var(--wr-brand)!important;border-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important}
body.wr-brand-color .rt-button-v1:not(.w-variant-db0400f1-88db-5b2d-aa8c-a7f3dad18f61) :is(.rt-button-text,.rt-whyus-ctaicon-v1),body.wr-brand-color .rt-button-v1:hover :is(.rt-button-text,.rt-whyus-ctaicon-v1){color:var(--wr-brand-ink)!important}
body.wr-brand-color .rt-button-v1.w-variant-db0400f1-88db-5b2d-aa8c-a7f3dad18f61 :is(.rt-button-text,.rt-whyus-ctaicon-v1){color:var(--wr-brand-link)!important}
body.wr-brand-color .rt-button-v1.w-variant-db0400f1-88db-5b2d-aa8c-a7f3dad18f61:hover :is(.rt-button-text,.rt-whyus-ctaicon-v1){color:var(--wr-brand-ink)!important}
body.wr-brand-color .rt-button-overlay{background-color:var(--wr-brand)!important}
body.wr-brand-color .rt-nav-link:hover,body.wr-brand-color .rt-nav-link.w--current,body.wr-brand-color .rt-nav-link[aria-current="page"],body.wr-brand-color .rt-class-tab-link-wrapper.w--current{color:var(--wr-brand-link)!important}
body.wr-brand-color .rt-menu-border-line,body.wr-brand-color .rt-experience-card-glow-line{background-color:var(--wr-brand)!important}
body.wr-brand-color .rt-contact-form-v1,body.wr-brand-color .auravell-inquiry-box{background-color:var(--wr-brand-soft)!important;border-color:var(--wr-brand-line)!important}
body.wr-brand-color .rt-contact-input-v1:focus,body.wr-brand-color .auravell-inquiry-box :is(input,select,textarea):focus{border-color:var(--wr-brand)!important;outline-color:var(--wr-brand)!important}
body.wr-brand-color .rt-blogcard-category-v1{color:var(--wr-brand-link)!important}
`,
  'careflow-healthcare': `
body.wr-brand-color{--core--colors--primary--100:var(--wr-brand-link)!important;--core--colors--primary--200:var(--wr-brand-soft)!important;--core--colors--primary--300:var(--wr-brand-soft)!important;--core--colors--primary--500:var(--wr-brand-soft)!important}
body.wr-brand-color .primary-button,body.wr-brand-color .primary-button-icon,body.wr-brand-color .cf-inquiry button[type="submit"]{background-color:var(--wr-brand)!important;border-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important}
body.wr-brand-color .primary-button :is(.button-text-in,.button-text-out,.button-text-container),body.wr-brand-color .primary-button-icon .icon-font{color:var(--wr-brand-ink)!important}
body.wr-brand-color .primary-button-line{background-color:var(--wr-brand-ink)!important}
body.wr-brand-color .list-nav-menu .link:hover,body.wr-brand-color .list-nav-menu .link[aria-current="page"],body.wr-brand-color .list-nav-menu .link.w--current,body.wr-brand-color .cf-pages-panel a:hover,body.wr-brand-color .cf-pages-panel a[aria-current="page"],body.wr-brand-color .text-primary-color-100{color:var(--wr-brand-link)!important}
body.wr-brand-color .toggle-button-bg,body.wr-brand-color .dot-navigation-item.active{background-color:var(--wr-brand)!important;border-color:var(--wr-brand)!important}
body.wr-brand-color .bg-primary-100,body.wr-brand-color .toggle-button-wrapper,body.wr-brand-color .social-media-icon-wrapper:not(.line):not(.linkedin){background-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important}
body.wr-brand-color .card.contact-card-v4,body.wr-brand-color .card.contact-card-v5,body.wr-brand-color .card.form-card,body.wr-brand-color .cf-form-card{background-color:var(--wr-brand-soft)!important;border-color:var(--wr-brand-line)!important}
body.wr-brand-color .card.contact-card-v4 a.link,body.wr-brand-color .cf-form-card a{color:var(--wr-brand-link)!important}
body.wr-brand-color .cf-thumbs button[aria-pressed="true"],body.wr-brand-color .cf-inquiry :is(input,select,textarea):focus{border-color:var(--wr-brand)!important;outline-color:var(--wr-brand)!important}
`,
  'lumi-business': `
body.wr-brand-color{--token-dd80e8ea-932b-470e-a52c-c12274622b13:var(--wr-brand)!important}
body.wr-brand-color .lumi-button,body.wr-brand-color .lumi-cta:not([data-framer-name^="White"]),body.wr-brand-color a[data-framer-name^="Dark "],body.wr-brand-color a[data-framer-name^="Blue "],body.wr-brand-color form button[type="submit"]{background-color:var(--wr-brand)!important;border-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important}
body.wr-brand-color .lumi-button .framer-text,body.wr-brand-color .lumi-cta:not([data-framer-name^="White"]) .framer-text,body.wr-brand-color a[data-framer-name^="Dark "] .framer-text,body.wr-brand-color a[data-framer-name^="Blue "] .framer-text,body.wr-brand-color form button[type="submit"] .framer-text{--framer-text-color:var(--wr-brand-ink)!important;color:var(--wr-brand-ink)!important}
body.wr-brand-color a[data-framer-name^="White "] .framer-text,body.wr-brand-color .lumi-service a{--framer-text-color:var(--wr-brand-link)!important;color:var(--wr-brand-link)!important}
body.wr-brand-color a[data-framer-name^="Dark "] [data-framer-name="Arrow"] svg,body.wr-brand-color a[data-framer-name^="Blue "] [data-framer-name="Arrow"] svg{--18mrqx2:var(--wr-brand-link)!important}
body.wr-brand-color [data-framer-name="Nav Links"] a:hover,body.wr-brand-color [data-framer-name="Nav Links"] a[aria-current="page"],body.wr-brand-color .lumi-mobile-menu a:hover,body.wr-brand-color .lumi-mobile-menu a[aria-current="page"]{--framer-link-text-color:var(--wr-brand-link)!important;color:var(--wr-brand-link)!important;text-decoration-color:var(--wr-brand)!important}
body.wr-brand-color [data-lumi-tab][aria-selected="true"]{background-color:var(--wr-brand-soft)!important;border-color:var(--wr-brand-line)!important}
body.wr-brand-color [data-lumi-tab]:focus-visible,body.wr-brand-color .lumi-detail-gallery button[aria-pressed="true"]{outline-color:var(--wr-brand)!important;border-color:var(--wr-brand)!important}
body.wr-brand-color [data-framer-name="Form Wrapper"]{background-color:var(--wr-brand-soft)!important;box-shadow:0 0 0 1px var(--wr-brand-line)!important}
body.wr-brand-color [data-framer-name="Contact Info"] [data-framer-name="Icon Top No Link"]{background-color:var(--wr-brand-soft)!important;border-color:var(--wr-brand-line)!important}
body.wr-brand-color form :is(input,select,textarea):focus{border-color:var(--wr-brand)!important;outline:2px solid var(--wr-brand)!important;outline-offset:2px}
`,
  'pawfect-groom': `
body.wr-brand-color{--pg-primary:var(--wr-brand)!important;--pg-ink:var(--wr-brand-ink)!important}
body.wr-brand-color .pg-button:not(.pg-secondary),body.wr-brand-color .pg-button:not(.pg-secondary):hover,body.wr-brand-color .form-grid button[type="submit"]{background-color:var(--wr-brand)!important;border-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important}
body.wr-brand-color .pg-header nav a:hover,body.wr-brand-color .pg-header nav a[aria-current="page"],body.wr-brand-color .pg-mobile-menu a:hover,body.wr-brand-color .pg-mobile-menu a[aria-current="page"],body.wr-brand-color .pg-text-link:not(.pg-why .pg-text-link){color:var(--wr-brand-link)!important}
body.wr-brand-color .pg-service,body.wr-brand-color .pg-service:hover{border-top-color:var(--wr-brand)!important}
body.wr-brand-color .pg-brand svg,body.wr-brand-color .pg-eyebrow svg,body.wr-brand-color .pg-number svg,body.wr-brand-color .pg-faq summary span{color:var(--wr-brand-link)!important}
body.wr-brand-color .pg-hero h1 em:after{background-color:var(--wr-brand)!important}
body.wr-brand-color .pg-form,body.wr-brand-color .pg-contact aside{background-color:var(--wr-brand-soft)!important;border-color:var(--wr-brand-line)!important}
body.wr-brand-color .pg-form :is(input,select,textarea):focus{border-color:var(--wr-brand)!important;outline-color:var(--wr-brand)!important}
`,
  'mello-coffee': `
body.wr-brand-color{--accent:var(--wr-brand)!important;--mello-accent-ink:var(--wr-brand-ink)!important}
body.wr-brand-color .button:not([class*="w-variant-"]),body.wr-brand-color .form-grid button[type="submit"],body.wr-brand-color .time-tab.w--current{background-color:var(--wr-brand)!important;border-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important}
body.wr-brand-color .button:not([class*="w-variant-"]) .emphasis-l{color:var(--wr-brand-ink)!important}
body.wr-brand-color .button:not([class*="w-variant-"]) .button-background{background-color:var(--wr-brand)!important}
body.wr-brand-color .button-border:not([class*="w-variant-"]),body.wr-brand-color .form-grid :is(input,select,textarea):focus{border-color:var(--wr-brand)!important;outline-color:var(--wr-brand)!important}
body.wr-brand-color .link-background{background-color:var(--wr-brand)!important}
body.wr-brand-color .menu-link:hover .emphasis-l,body.wr-brand-color .menu-link[aria-current="page"] .emphasis-l{color:var(--wr-brand-ink)!important}
body.wr-brand-color .menu-link:is(:hover,:focus-visible,[aria-current="page"]){background-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important}
body.wr-brand-color .h2.accent,body.wr-brand-color .mello-form-card a:not(.button){color:var(--wr-brand-link)!important}
body.wr-brand-color .section.black .h2.accent{color:color-mix(in srgb,var(--wr-brand) 30%,var(--white))!important}
body.wr-brand-color .location-block a,body.wr-brand-color .email-block a,body.wr-brand-color .hotspot-content.w-variant-15f52619-8149-7be7-d4da-02544603490c{color:var(--wr-brand-ink)!important}
body.wr-brand-color .mello-form-card{background-color:var(--wr-brand-soft)!important;border-color:var(--wr-brand-line)!important;box-shadow:8px 8px 0 var(--wr-brand-line)!important}
`,
  'toorun-early-learning': `
body.wr-brand-color{--tr-green:var(--wr-brand)!important}
body.wr-brand-color .tr-button:not(.tr-button-secondary),body.wr-brand-color .form-grid button[type="submit"]{background-color:var(--wr-brand)!important;border-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important}
body.wr-brand-color .tr-desktop-nav a:after{background-color:var(--wr-brand)!important}
body.wr-brand-color .tr-desktop-nav a:hover,body.wr-brand-color .tr-desktop-nav a[aria-current="page"]{color:var(--wr-brand-link)!important}
body.wr-brand-color .tr-menu nav>a:hover,body.wr-brand-color .tr-menu nav>a[aria-current="page"]{background-color:var(--wr-brand-soft)!important;color:var(--wr-brand-link)!important}
body.wr-brand-color .tr-menu summary{background-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important}
body.wr-brand-color .tr-contact aside{background-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important}
body.wr-brand-color .tr-contact aside :is(h2,h3,p,a,small,strong){color:var(--wr-brand-ink)!important}
body.wr-brand-color .tr-contact form,body.wr-brand-color .tr-contact .form-grid{border-color:var(--wr-brand-line)!important}
body.wr-brand-color .form-grid :is(input,select,textarea):focus{border-color:var(--wr-brand)!important;outline-color:var(--wr-brand)!important}
`,
  'senseng-video': `
body.wr-brand-color{--brand:var(--wr-brand)!important;--brand-ink:var(--wr-brand-ink)!important;--color-brand-blue:var(--wr-brand)!important;--color-brand-blue-hover:var(--wr-brand)!important;--color-pill-blue:var(--wr-brand-soft)!important;--color-pill-blue-text:var(--wr-brand-link)!important}
body.wr-brand-color .senseng-btn-pill,body.wr-brand-color .senseng-btn-detail,body.wr-brand-color .senseng-newsletter button,body.wr-brand-color .senseng-form button[type="submit"]{background-color:var(--wr-brand)!important;border-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important}
body.wr-brand-color .senseng-nav-link:hover,body.wr-brand-color .senseng-nav-link.active,body.wr-brand-color .senseng-nav-link[aria-current="page"]{color:var(--wr-brand-link)!important}
body.wr-brand-color .senseng-nav-link.active::after,body.wr-brand-color .senseng-nav-link[aria-current="page"]::after{background-color:var(--wr-brand)!important}
body.wr-brand-color .senseng-inquiry-box,body.wr-brand-color .wr-card-hover:has(>form.senseng-form){background-color:var(--wr-brand-soft)!important;border-color:var(--wr-brand-line)!important}
body.wr-brand-color .senseng-badge-pill{background-color:var(--wr-brand-soft)!important;color:var(--wr-brand-link)!important}
body.wr-brand-color .senseng-form :is(input,select,textarea):focus,body.wr-brand-color .senseng-thumb-btn[aria-pressed="true"]{border-color:var(--wr-brand)!important;outline-color:var(--wr-brand)!important}
`,
  'senseng-candy': `
body.wr-brand-color{--brand:var(--wr-brand)!important;--brand-ink:var(--wr-brand-ink)!important}
body.wr-brand-color .button[style*="background:#ff6b8b"],body.wr-brand-color .button[style*="background:linear-gradient(135deg, #ff6b8b"]{background:var(--wr-brand)!important;border-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important;box-shadow:0 6px 18px var(--wr-brand-line)!important}
body.wr-brand-color .wr-confirmed-hero .button{background-color:var(--wr-brand)!important;border-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important}
body.wr-brand-color header nav a:hover,body.wr-brand-color header nav a[aria-current="page"],body.wr-brand-color header nav a[style*="color:#ff6b8b"]{color:var(--wr-brand-link)!important}
body.wr-brand-color [data-wr-lang][aria-current="true"],body.wr-brand-color [data-wr-lang][aria-current="page"]{background-color:var(--wr-brand)!important;border-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important}
body.wr-brand-color main[data-wr-page="contact"] .wr-card-hover{background-color:var(--wr-brand-soft)!important;border-color:var(--wr-brand-line)!important}
body.wr-brand-color main[data-wr-page="contact"] a[href^="mailto:"],body.wr-brand-color main[data-wr-page="contact"] a[href^="tel:"]{color:var(--wr-brand-link)!important}
body.wr-brand-color #inquiry :is(input,select,textarea):focus{border-color:var(--wr-brand)!important;outline-color:var(--wr-brand)!important}
`,
  'senseng-nature': `
body.wr-brand-color{--brand:var(--wr-brand)!important;--brand-ink:var(--wr-brand-ink)!important}
body.wr-brand-color .button[style*="background:#2d4a22"],body.wr-brand-color .button[style*="background:#1e3318"]{background-color:var(--wr-brand)!important;border-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important;box-shadow:0 6px 18px var(--wr-brand-line)!important}
body.wr-brand-color .wr-confirmed-hero .button{background-color:var(--wr-brand)!important;border-color:var(--wr-brand)!important;color:var(--wr-brand-ink)!important}
body.wr-brand-color header nav a:hover,body.wr-brand-color header nav a[aria-current="page"]{color:var(--wr-brand-link)!important}
body.wr-brand-color main[data-wr-page="contact"] .wr-nature-card,body.wr-brand-color main[data-wr-page="contact"] .wr-card-hover:has(>form){background-color:var(--wr-brand-soft)!important;border-color:var(--wr-brand-line)!important}
body.wr-brand-color .wr-nature-card a[href^="mailto:"]{color:var(--wr-brand-link)!important}
body.wr-brand-color #inquiry :is(input,select,textarea):focus{border-color:var(--wr-brand)!important;outline-color:var(--wr-brand)!important}
`,
};
