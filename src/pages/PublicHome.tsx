import { ArrowDown, ArrowRight, Check, CloudSun, Leaf, ScanLine, ShieldCheck, Sprout, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import Brand from '../components/Brand';
import AccessibilityTools, { ListenButton } from '../components/AccessibilityTools';
import { useI18n } from '../i18n/I18nProvider';

const heroImage = '/manus-storage/async-images/ZGpdqMHzYq3P6SUIGWFW2R/image-1.webp';

export default function PublicHome() {
  const { t } = useI18n();
  const crops = [
    { name: t('crop.Potato'), example: t('public.potatoExample') },
    { name: t('crop.Rice'), example: t('public.riceExample') },
    { name: t('crop.Cotton'), example: t('public.cottonExample') },
  ];
  return <div className="public-page">
    <header className="public-header">
      <Link to="/" aria-label="AgriShield AI home"><Brand /></Link>
      <nav className="public-nav" aria-label={t('nav.home')}><a href="#how-it-works">{t('public.how')}</a><a href="#crops-supported">{t('nav.cropExamples')}</a><a href="#about">{t('nav.about')}</a></nav>
      <div className="public-header-tools"><AccessibilityTools /><Link className="button button-outline public-login" to="/login">{t('login.title')} <ArrowRight size={15} /></Link></div>
      <a className="mobile-login-link" href="#how-it-works" aria-label={t('public.how')}><ArrowDown size={18} /></a>
    </header>

    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> {t('public.tag')}</div>
          <h1>{t('public.title1')}<br /><em>{t('public.title2')}</em></h1>
          <p className="hero-lede">{t('public.intro')}</p>
          <div className="hero-actions"><Link className="button button-primary" to="/login">{t('public.start')} <ArrowRight size={17} /></Link><a className="text-link" href="#how-it-works">{t('public.how')} <ArrowDown size={15} /></a><span className="hero-mobile-listen"><ListenButton /></span></div>
          <div className="hero-proof"><span><ShieldCheck size={18} /> {t('diagnosis.safe')}</span><span><Leaf size={18} /> {t('field.locationHint')}</span></div>
          <div className="hero-disclosure"><span className="disclosure-dot" />{t('public.safety')}</div>
          <p className="language-prompt">{t('public.languagePrompt')}</p>
        </div>
        <div className="hero-visual">
          <div className="hero-image-frame"><img src={heroImage} alt={t('public.caption')} /></div><div className="hero-image-shade" />
          <div className="hero-image-caption"><span className="caption-kicker">01</span><strong>{t('public.caption')}</strong><span>{t('public.bannerBody')}</span></div>
          <div className="hero-signal-card"><div className="signal-card-top"><span className="signal-icon"><CloudSun size={17} /></span><span className="signal-label">{t('dashboard.weatherExample')}</span><span className="sample-pill">{t('public.sampleBadge')}</span></div><div className="signal-value-row"><strong>24–72h</strong><span>{t('dashboard.sampleWarning')}</span></div><div className="signal-card-bottom"><span className="signal-bar"><i /></span><span>{t('public.sampleBadge')}</span></div></div>
          <div className="hero-stamp"><Sprout size={17} /><span>{t('public.caption')}</span></div>
        </div>
      </section>

      <div className="prototype-banner"><div className="prototype-banner-icon"><ShieldCheck size={18} /></div><p><strong>{t('public.bannerHeading')}</strong> {t('public.bannerBody')} {t('lang.translationNote')}</p><Link to="/login">{t('public.start')} <ArrowRight size={15} /></Link></div>

      <section className="section how-section" id="how-it-works">
        <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> {t('public.stepsTitle')}</div><h2>{t('public.step1')}<br />{t('public.step2')}</h2></div><p>{t('public.intro')}</p></div>
        <div className="steps-row"><article className="step-card"><span className="step-number">01</span><div className="step-icon"><Sprout size={23} /></div><h3>{t('public.step1')}</h3><p>{t('field.locationHint')}</p><span className="step-tag">01</span></article><article className="step-card"><span className="step-number">02</span><div className="step-icon"><ScanLine size={23} /></div><h3>{t('public.step2')}</h3><p>{t('scan.cameraHint')}</p><span className="step-tag">02</span></article><article className="step-card"><span className="step-number">03</span><div className="step-icon"><ShieldCheck size={23} /></div><h3>{t('public.step3')}</h3><p>{t('scan.noAi')}</p><span className="step-tag">03</span></article></div>
      </section>

      <section className="section crop-section" id="crops-supported"><div className="crop-intro"><div className="eyebrow eyebrow-light"><span className="eyebrow-line" /> {t('nav.cropExamples')}</div><h2>{t('public.cropHeading')}</h2><p>{t('public.cropBody')}</p><Link to="/login" className="text-link text-link-light">{t('public.start')} <ArrowRight size={15} /></Link></div><div className="crop-list">{crops.map((crop, index) => <article className="crop-row" key={index}><span className="crop-row-index">0{index + 1}</span><div className="crop-symbol"><Leaf size={20} /></div><div className="crop-copy"><h3>{crop.name}</h3><p>{crop.example}</p></div><span className="crop-note">{t('public.sampleBadge')}</span><ArrowRight size={17} className="crop-arrow" /></article>)}<div className="crop-scope-note"><Wind size={18} /><span>{t('public.cropScope')}</span></div></div></section>

      <section className="section trust-section" id="about"><div className="trust-art"><div className="trust-contour contour-one" /><div className="trust-contour contour-two" /><div className="trust-badge"><ShieldCheck size={30} /><span>{t('public.caption')}</span></div><div className="trust-leaf"><Leaf size={25} /></div></div><div className="trust-copy"><div className="eyebrow"><span className="eyebrow-line" /> {t('public.aboutTag')}</div><h2>{t('public.aboutHeading')}</h2><p>{t('public.aboutBody')}</p><div className="trust-points"><span><Check size={17} /> {t('public.trust1')}</span><span><Check size={17} /> {t('public.trust2')}</span><span><Check size={17} /> {t('public.trust3')}</span></div><div className="trust-note">{t('lang.coverage')} {t('lang.translationNote')}</div></div></section>

      <section className="closing-cta"><div><span className="closing-kicker">{t('public.closingKicker')}</span><h2>{t('public.start')}</h2><p>{t('public.intro')}</p></div><Link to="/login" className="button button-warm">{t('public.start')} <ArrowRight size={17} /></Link><div className="closing-sun" /></section>
    </main>

    <footer className="public-footer"><Link to="/" aria-label="AgriShield home"><Brand compact /></Link><span>© {new Date().getFullYear()} AgriShield AI · {t('public.footerLabel')}</span><a href="#about">{t('nav.about')}</a><span className="footer-safety">{t('public.safety')}</span></footer>
  </div>;
}
