import { ArrowRight, MapPin, Plus, Sprout } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import type { AppLayoutContext } from '../app/AppShell';
import { useI18n, type MessageKey } from '../i18n/I18nProvider';

export default function FieldsPage() {
  const { fields } = useOutletContext<AppLayoutContext>();
  const { t } = useI18n();
  const localizedValue = (prefix: 'crop' | 'stage', value: string) => { const key = `${prefix}.${value}` as MessageKey; const result = t(key); return result === key ? value : result; };
  return <>
    <div className="page-heading"><div><div className="section-label"><span className="eyebrow-line" /> {t('field.title')}</div><h1>{t('field.title')}</h1><p>{t('field.locationHint')}</p></div><Link className="button button-primary large-action-button" to="/app/onboarding"><Plus size={19} /> {t('field.add')}</Link></div>
    {fields.length === 0 ? <section className="panel empty-state farmer-empty-state"><div className="empty-icon"><Sprout size={25} /></div><h3>{t('field.empty')}</h3><p>{t('field.locationHint')}</p><Link className="button button-primary large-action-button" to="/app/onboarding">{t('dashboard.addField')} <ArrowRight size={17} /></Link></section> : <div className="field-card-grid">
      {fields.map((field) => <Link className="field-card panel farmer-field-card" to={`/app/fields/${field.id}`} key={field.id}>
        <div className="field-card-top"><span className="field-card-mark"><Sprout size={21} /></span><span className="soft-badge">{t('field.saved')}</span></div>
        <span className="field-card-farm">{field.farmName}</span><h2>{field.name}</h2><div className="field-card-details"><span>{localizedValue('crop', field.crop)}{field.variety ? ` · ${field.variety}` : ''}</span><span>{localizedValue('stage', field.growthStage)}</span></div>
        <div className="field-card-location"><MapPin size={15} /> {field.region || t('field.location')}</div><div className="field-card-footer"><span>{t('field.open')}</span><ArrowRight size={17} /></div>
      </Link>)}
    </div>}
    <div className="sample-disclosure farmer-disclosure"><Sprout size={17} /><span>{t('field.cropSupportNote')} {t('public.safety')}</span></div>
  </>;
}
