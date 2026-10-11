import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CircleHelp, Leaf, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Brand from '../components/Brand';
import AccessibilityTools from '../components/AccessibilityTools';
import { api, asErrorMessage } from '../lib/http';
import { useAuth } from '../app/AuthContext';
import { useI18n } from '../i18n/I18nProvider';

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [params] = useSearchParams();
  const { user, loading } = useAuth();
  const { t } = useI18n();

  async function beginLogin() {
    setBusy(true); setError('');
    try {
      const result = await api<{ authorizationUrl: string }>('/auth/start', { method: 'POST', body: JSON.stringify({ origin: window.location.origin }) });
      window.location.assign(result.authorizationUrl);
    } catch (cause) { setError(asErrorMessage(cause)); setBusy(false); }
  }

  if (!loading && user) return <main className="login-page"><div className="login-card"><Brand /><h1>{t('login.title')}</h1><p>{t('login.intro')}</p><Link className="button button-primary button-wide" to="/app">{t('public.start')} <ArrowRight size={18} /></Link></div></main>;

  return <main className="login-page">
    <div className="login-top"><Link className="back-link" to="/"><ArrowLeft size={17} /> {t('login.back')}</Link><AccessibilityTools /><Brand compact /></div>
    <div className="login-layout">
      <section className="login-story"><div className="login-story-mark"><Leaf size={21} /></div><div className="eyebrow eyebrow-light"><span className="eyebrow-line" /> {t('nav.workspace')}</div><h1>{t('login.title')}</h1><p>{t('login.intro')} {t('public.safety')}</p><div className="login-proof"><span><ShieldCheck size={18} /> {t('login.safe')}</span><span><Check size={18} /> {t('field.locationHint')}</span></div><div className="login-story-contour" /></section>
      <section className="login-form-card"><span className="form-kicker">AGRI · SHIELD · AI</span><h2>{t('login.title')}</h2><p>{t('login.intro')}</p>
        {params.get('error') && <div className="inline-alert danger">{params.get('error')}</div>}{error && <div className="inline-alert danger">{error}</div>}
        <button className="button button-primary button-wide login-main-action" onClick={() => void beginLogin()} disabled={busy}>{busy ? <span className="spinner spinner-light" /> : <span className="manus-symbol">M</span>}{busy ? t('login.connecting') : t('login.continue')}{!busy && <ArrowRight size={18} />}</button>
        <div className="login-divider"><span /> <small>ACCOUNT ACCESS</small> <span /></div>
        <div className="login-support-row"><div className="support-icon"><CircleHelp size={19} /></div><p><strong>{t('login.noOtp')}</strong><br />No SMS sign-in provider is connected in this prototype.</p></div>
        <div className="login-privacy"><ShieldCheck size={15} /><span>{t('login.safe')}</span></div><Link to="/" className="login-home-link">{t('login.back')} <ArrowRight size={15} /></Link>
      </section>
    </div>
    <div className="login-bottom">AgriShield AI <span>·</span> Prototype <span>·</span> {t('prototype.note')}</div>
  </main>;
}
