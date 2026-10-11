import { AlertTriangle, ArrowRight, Camera, CheckCircle2, Clock3, ClipboardCheck, Leaf, ShieldCheck, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';

const steps = [
  { key: 'advisory.first' as const, icon: Sprout },
  { key: 'advisory.photo' as const, icon: Camera },
  { key: 'advisory.note' as const, icon: ClipboardCheck },
  { key: 'advisory.checkAgain' as const, icon: Clock3 },
];

export default function AdvisoryPage() {
  const { t } = useI18n();
  return <>
    <div className="page-heading"><div><div className="section-label"><span className="eyebrow-line" /> {t('app.sampleTag')}</div><h1>{t('advisory.title')}</h1><p>{t('dashboard.actionText')}</p></div><span className="soft-badge green"><ShieldCheck size={14} /> {t('advisory.noChemical')}</span></div>
    <div className="easy-advisory-lead"><span className="easy-step-icon"><Leaf size={26} /></span><div><h2>{t('dashboard.actionTitle')}</h2><p>{t('advisory.noChemical')}</p></div></div>
    <div className="easy-advisory-steps">{steps.map(({ key, icon: Icon }, index) => <article className="easy-advisory-step" key={key}><span className="easy-advisory-number">{index + 1}</span><span className="easy-advisory-icon"><Icon size={25} /></span><strong>{t(key)}</strong></article>)}</div>
    <section className="easy-no-spray"><span className="easy-no-spray-icon"><AlertTriangle size={23} /></span><div><h2>{t('advisory.noChemical')}</h2><p>{t('advisory.chemicalSafe')}</p></div></section>
    <div className="diagnosis-safe-actions"><Link className="button button-primary large-action-button" to="/app/scan"><Camera size={19} /> {t('scan.title')}</Link><Link className="button button-outline large-action-button" to="/app/history"><CheckCircle2 size={18} /> {t('history.record')} <ArrowRight size={16} /></Link></div>
    <div className="sample-disclosure farmer-disclosure"><ShieldCheck size={18} /><span>{t('prototype.note')}</span></div>
  </>;
}
