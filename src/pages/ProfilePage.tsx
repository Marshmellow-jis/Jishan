import { useState } from 'react';
import { ArrowRight, Globe2, LogOut, MapPin, ShieldCheck, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import Brand from '../components/Brand';
import { LanguageSelect } from '../components/AccessibilityTools';
import { languages, useI18n } from '../i18n/I18nProvider';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { language, t } = useI18n();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  async function signOut() { setBusy(true); try { await logout(); } finally { navigate('/login', { replace: true }); setBusy(false); } }
  const selectedLanguage = languages.find((item) => item.code === language)?.nativeName || 'English';
  return <>
    <div className="page-heading"><div><div className="section-label"><span className="eyebrow-line" /> {t('nav.profile')}</div><h1>{t('nav.profile')}</h1><p>{t('login.safe')}</p></div></div>
    <div className="profile-grid"><section className="panel profile-identity"><div className="profile-identity-top"><span className="profile-avatar-large"><UserRound size={25} /></span><span className="soft-badge green"><ShieldCheck size={14} /> ACCOUNT</span></div><h2>{user?.name || 'Farmer'}</h2><p>{user?.email || 'Manus account'}</p><div className="profile-role"><span>{t('nav.workspace')}</span><strong>{user?.role || 'farmer'}</strong><small>{t('login.safe')}</small></div><button className="button button-outline profile-signout" onClick={() => void signOut()} disabled={busy}>{busy ? <span className="spinner" /> : <LogOut size={17} />} {t('nav.signout')} <ArrowRight size={16} /></button></section>
      <div className="profile-side-stack"><section className="panel panel-pad"><div className="panel-heading"><div><h2>Privacy & location</h2><p>{t('field.locationHint')}</p></div><MapPin size={19} className="profile-panel-icon" /></div><div className="profile-info-row"><span>GPS access</span><strong>Not requested</strong></div><div className="profile-info-row"><span>{t('field.location')}</span><strong>{t('field.optional')}</strong></div><div className="profile-info-row"><span>{t('scan.choosePhoto')}</span><strong>{t('scan.photoPrivate')}</strong></div></section>
        <section className="panel panel-pad language-profile-panel"><div className="panel-heading"><div><h2>{t('profile.language')}</h2><p>{t('lang.help')}</p></div><Globe2 size={19} className="profile-panel-icon" /></div><div className="profile-info-row"><span>{t('profile.language')}</span><strong>{selectedLanguage}</strong></div><div className="language-profile-picker"><LanguageSelect /><span>{t('profile.changeLanguage')}</span></div><p className="translation-review-note">{t('lang.translationNote')}</p><div className="language-coverage">{t('lang.coverage')}</div></section>
      </div></div>
    <div className="profile-brand-note"><Brand compact /><span>{t('prototype.note')}</span></div>
  </>;
}
