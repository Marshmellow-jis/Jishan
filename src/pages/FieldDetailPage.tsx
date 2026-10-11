import { useEffect, useState } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import type { AppLayoutContext } from '../app/AppShell';
import type { FarmField } from '../lib/contracts';
import { api, asErrorMessage } from '../lib/http';
import FieldForm from '../components/FieldForm';
import { useI18n, type MessageKey } from '../i18n/I18nProvider';

function localizedValue(prefix: 'crop' | 'stage', value: string, t: (key: MessageKey) => string) { const key = `${prefix}.${value}` as MessageKey; const result = t(key); return result === key ? value : result; }
export default function FieldDetailPage() {
  const { fieldId = '' } = useParams(); const navigate = useNavigate();
  const { refreshFields, setToast } = useOutletContext<AppLayoutContext>(); const { t } = useI18n();
  const [field, setField] = useState<FarmField | null>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; api<{ field: FarmField }>(`/fields/${fieldId}`).then(({ field: value }) => { if (active) setField(value); }).catch((cause) => { if (active) setError(asErrorMessage(cause)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [fieldId]);
  async function saved(value: FarmField) { await refreshFields(); setToast(t('field.saved')); navigate(`/app/fields/${value.id}`); setField(value); }
  if (loading) return <div className="panel empty-state"><span className="spinner" /><p>{t('field.title')}…</p></div>;
  if (error || !field) return <section className="panel empty-state farmer-empty-state"><div className="empty-icon"><MapPin size={22} /></div><h3>{t('field.title')}</h3><p>{error || t('diagnosis.safe')}</p><Link className="button button-outline" to="/app/fields"><ArrowRight size={16} /> {t('nav.fields')}</Link></section>;
  return <>
    <div className="page-heading"><div><Link to="/app/fields" className="back-link"><ArrowRight size={15} /> {t('nav.fields')}</Link><h1 style={{ marginTop: 12 }}>{field.name}</h1><p>{field.farmName} · {localizedValue('crop', field.crop, t)} · {localizedValue('stage', field.growthStage, t)}</p></div><span className="soft-badge"><MapPin size={14} /> {field.region || t('field.location')}</span></div>
    <FieldForm initial={field} onSaved={(value) => void saved(value)} />
    <div className="sample-disclosure farmer-disclosure"><MapPin size={16} /><span>{t('field.locationHint')} {t('field.locationConsent')}</span></div>
  </>;
}
