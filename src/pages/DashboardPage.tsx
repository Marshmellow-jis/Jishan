import { Activity, ArrowRight, BookOpenCheck, CloudSun, FilePlus2, Leaf, MessageSquareText, ScanLine, ShieldCheck, Sprout } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import type { AppLayoutContext } from '../app/AppShell';
import RiskChart from '../components/RiskChart';
import { sampleWeather } from '../data/sample';
import { useI18n, type MessageKey } from '../i18n/I18nProvider';

export default function DashboardPage() {
  const { fields } = useOutletContext<AppLayoutContext>();
  const { t, easyView } = useI18n();
  const field = fields[0];
  const localizedCrop = (crop: string) => { const key = `crop.${crop}` as MessageKey; const result = t(key); return result === key ? crop : result; };
  return <>
    <div className="page-heading easy-dashboard-heading"><div><div className="section-label"><span className="eyebrow-line" /> {t('app.sampleTag')}</div><h1>{t('dashboard.greeting')}</h1><p>{t('dashboard.simplePrompt')}</p></div></div>
    <div className="easy-sample-warning"><ShieldCheck size={21} /><span><strong>{t('dashboard.sampleWarning')}</strong><small>{t('lang.translationNote')}</small></span></div>

    <section className="easy-next-step"><div className="easy-next-copy"><span className="easy-step-icon"><Leaf size={25} /></span><div><span className="easy-kicker">{field?.name || t('nav.workspace')}</span><h2>{t('dashboard.actionTitle')}</h2><p>{t('dashboard.actionText')}</p></div></div><p className="easy-safety-line"><ShieldCheck size={19} />{t('dashboard.noSpray')}</p></section>

    <section className="easy-action-section" aria-labelledby="easy-actions-title"><h2 id="easy-actions-title" className="easy-actions-heading">{t('dashboard.simplePrompt')}</h2><div className="easy-action-grid">
      <Link className="easy-action-card action-green" to={fields.length ? '/app/fields' : '/app/onboarding'}><span className="easy-action-icon"><Sprout size={28} /></span><strong>{fields.length ? t('nav.fields') : t('dashboard.addField')}</strong><span className="easy-card-arrow"><ArrowRight size={19} /></span></Link>
      <Link className="easy-action-card action-gold" to={fields.length ? '/app/scan' : '/app/onboarding'}><span className="easy-action-icon"><ScanLine size={28} /></span><strong>{fields.length ? t('dashboard.takePhoto') : t('dashboard.addField')}</strong><span className="easy-card-arrow"><ArrowRight size={19} /></span></Link>
      <Link className="easy-action-card action-blue" to="/app/history"><span className="easy-action-icon"><MessageSquareText size={28} /></span><strong>{t('dashboard.fieldNotes')}</strong><span className="easy-card-arrow"><ArrowRight size={19} /></span></Link>
      <Link className="easy-action-card action-soft" to="/app/advisory"><span className="easy-action-icon"><BookOpenCheck size={28} /></span><strong>{t('dashboard.actionTitle')}</strong><span className="easy-card-arrow"><ArrowRight size={19} /></span></Link>
    </div></section>

    {fields.length === 0 && <section className="easy-empty-field"><FilePlus2 size={23} /><div><strong>{t('field.empty')}</strong><p>{t('field.locationHint')}</p></div><Link className="button button-primary" to="/app/onboarding">{t('dashboard.addField')} <ArrowRight size={18} /></Link></section>}

    {fields.length > 0 && <section className="panel panel-pad easy-my-fields"><div className="panel-heading"><div><h2>{t('field.title')}</h2><p>{fields.length} · {t('field.saved')}</p></div><Link className="button button-outline" to="/app/fields">{t('field.open')} <ArrowRight size={17} /></Link></div><div className="field-mini-list">{fields.slice(0, 3).map((item) => <Link to={`/app/fields/${item.id}`} className="field-mini-row" key={item.id}><span className="field-mini-icon"><Leaf size={18} /></span><span className="field-mini-copy"><strong>{item.name} · {localizedCrop(item.crop)}</strong><small>{item.farmName} · {item.region || t('field.location')}</small></span><ArrowRight size={17} /></Link>)}</div></section>}

    {!easyView && <details className="panel dashboard-example-details"><summary><span><CloudSun size={19} /> {t('dashboard.weatherExample')}</span><span>{t('dashboard.sampleWarning')}</span></summary><div className="sample-disclosure"><ShieldCheck size={16} /><span>{t('dashboard.sampleWarning')} {t('prototype.note')}</span></div><RiskChart /><div className="example-weather-grid">{sampleWeather.map((item) => <div key={item.label}><strong>{item.label}</strong><span>{item.value}</span><small>{item.note}</small></div>)}</div></details>}

    <div className="dashboard-gentle-footer"><Activity size={18} /><span>{t('scan.noAi')}</span></div>
  </>;
}
