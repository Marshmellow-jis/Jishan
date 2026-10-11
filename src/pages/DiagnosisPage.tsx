import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, CalendarClock, CircleHelp, Leaf, ScanLine, ShieldCheck, Sprout } from 'lucide-react';
import { Link, useLocation, useOutletContext, useParams } from 'react-router-dom';
import type { AppLayoutContext } from '../app/AppShell';
import type { DiagnosisResult, FarmField } from '../lib/contracts';
import { api, asErrorMessage } from '../lib/http';
import { useI18n } from '../i18n/I18nProvider';

export default function DiagnosisPage() {
  const { diagnosisId = '' } = useParams();
  const location = useLocation();
  const { fields } = useOutletContext<AppLayoutContext>();
  const { easyView, t, locale } = useI18n();
  const stateDiagnosis = (location.state as { diagnosis?: DiagnosisResult } | null)?.diagnosis;
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(stateDiagnosis || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!stateDiagnosis);
  useEffect(() => { if (stateDiagnosis) return; let active = true; api<{ diagnosis: DiagnosisResult }>(`/diagnoses/${diagnosisId}`).then(({ diagnosis: value }) => { if (active) setDiagnosis(value); }).catch((cause) => { if (active) setError(asErrorMessage(cause)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [diagnosisId, stateDiagnosis]);
  const field = fields.find((item: FarmField) => item.id === diagnosis?.fieldId);
  if (loading) return <section className="panel empty-state"><span className="spinner" /><p>{t('diagnosis.title')}…</p></section>;
  if (!diagnosis) return <section className="panel empty-state farmer-empty-state"><div className="empty-icon"><CircleHelp size={25} /></div><h3>{t('diagnosis.notAvailable')}</h3><p>{error || t('diagnosis.safe')}</p><Link to="/app/history" className="button button-outline large-action-button"><ArrowRight size={17} /> {t('nav.history')}</Link></section>;
  return <>
    <div className="page-heading"><div><Link to="/app/history" className="back-link"><ArrowRight size={15} /> {t('nav.history')}</Link><h1 style={{ marginTop: 12 }}>{t('diagnosis.title')}</h1><p>{field ? `${field.name} · ${field.crop}` : t('field.open')}</p></div><span className="soft-badge amber"><CalendarClock size={14} /> {t('diagnosis.safe')}</span></div>
    <div className="easy-result-banner"><span className="easy-result-icon"><AlertTriangle size={24} /></span><div><h2>{t('diagnosis.noModel')}</h2><p>{t('diagnosis.safe')}</p></div></div>
    <div className="diagnosis-safe-actions"><Link className="button button-primary large-action-button" to="/app/history"><Sprout size={18} /> {t('history.record')}</Link><Link className="button button-outline large-action-button" to="/app/scan"><ScanLine size={18} /> {t('scan.title')} <ArrowRight size={16} /></Link></div>
    <div className="sample-disclosure farmer-disclosure"><ShieldCheck size={18} /><span>{t('diagnosis.risk')} {t('advisory.noChemical')}</span></div>
    {!easyView && <details className="panel technical-detail-panel"><summary>Technical details · English</summary><div className="result-grid"><section className="panel result-detail"><h3><ScanLine size={15} /> IMAGE EVIDENCE</h3><p>{diagnosis.imageCount} image(s) were selected on this device. Images remain local. Automated image-quality and disease checks are not available.</p><div className="result-null">Quality status: unverified</div></section><section className="panel result-detail"><h3>WEATHER & RISK</h3><p>Weather source: not connected. No calibrated probability or spread risk is available.</p><div className="result-null">Risk score: not estimated</div></section><section className="panel result-detail"><h3><Leaf size={15} /> PROVENANCE</h3><p>Image model: none · Weather source: none · {new Date(diagnosis.provenance.generatedAt).toLocaleString(locale)}</p><div className="result-null">Prototype record only</div></section></div></details>}
  </>;
}
