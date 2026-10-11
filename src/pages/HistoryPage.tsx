import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Activity, ArrowRight, BookOpen, CalendarClock, ClipboardCheck, MessageSquareText } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import type { AppLayoutContext } from '../app/AppShell';
import type { FarmField } from '../lib/contracts';
import { api, asErrorMessage } from '../lib/http';
import { useI18n, type MessageKey } from '../i18n/I18nProvider';

interface CaseHistory { id: string; fieldId: string; fieldName: string; crop: string; imageCount: number; status: string; createdAt: string; }
interface ObservationHistory { id: string; fieldId: string; fieldName: string; observedSymptoms: string; actionTaken: string | null; symptomsImproved: boolean | null; verifiedByExpert: boolean; createdAt: string; }

export default function HistoryPage() {
  const { fields, setToast } = useOutletContext<AppLayoutContext>(); const { t, locale } = useI18n();
  const localizedCrop = (crop: string) => { const key = `crop.${crop}` as MessageKey; const result = t(key); return result === key ? crop : result; };
  const [cases, setCases] = useState<CaseHistory[]>([]); const [observations, setObservations] = useState<ObservationHistory[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const [fieldId, setFieldId] = useState(''); const [symptoms, setSymptoms] = useState(''); const [action, setAction] = useState(''); const [improved, setImproved] = useState('unknown');
  const refresh = useCallback(async () => { try { const result = await api<{ cases: CaseHistory[]; observations: ObservationHistory[] }>('/history'); setCases(result.cases); setObservations(result.observations); setError(''); } catch (cause) { setError(asErrorMessage(cause)); } finally { setLoading(false); } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { if (!fieldId && fields[0]) setFieldId(fields[0].id); }, [fieldId, fields]);
  async function submitObservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!fieldId) { setError(t('field.empty')); return; }
    setSaving(true); setError('');
    try { await api('/observations', { method: 'POST', body: JSON.stringify({ fieldId, observedSymptoms: symptoms, actionTaken: action, symptomsImproved: improved === 'unknown' ? null : improved === 'yes' }) }); setSymptoms(''); setAction(''); setImproved('unknown'); await refresh(); setToast(t('history.save')); }
    catch (cause) { setError(asErrorMessage(cause)); } finally { setSaving(false); }
  }
  const timeline = [
    ...cases.map((item) => ({ id: item.id, type: 'case' as const, title: t('scan.review'), details: `${item.fieldName} · ${localizedCrop(item.crop)} · ${t('diagnosis.noModel')}`, createdAt: item.createdAt })),
    ...observations.map((item) => ({ id: item.id, type: 'observation' as const, title: item.verifiedByExpert ? t('history.verified') : t('history.notVerified'), details: `${item.fieldName} · ${item.observedSymptoms}${item.actionTaken ? ` · ${item.actionTaken}` : ''}`, createdAt: item.createdAt, expertVerified: item.verifiedByExpert })),
  ].sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return <>
    <div className="page-heading"><div><div className="section-label"><span className="eyebrow-line" /> {t('history.title')}</div><h1>{t('history.title')}</h1><p>{t('history.notVerified')}</p></div></div>
    {error && <div className="inline-alert danger" style={{ marginBottom: 14 }} role="alert">{error}</div>}
    <div className="history-layout"><section className="panel panel-pad history-timeline"><div className="panel-heading"><div><h2>{t('history.title')}</h2><p>{t('scan.photoPrivate')}</p></div><span className="soft-badge"><CalendarClock size={14} />{t('history.title')}</span></div>
      {loading ? <div className="empty-state"><span className="spinner" /><p>{t('history.loading')}</p></div> : timeline.length ? timeline.map((item) => <div className="history-row" key={`${item.type}-${item.id}`}><span className="history-icon">{item.type === 'case' ? <BookOpen size={17} /> : <ClipboardCheck size={17} />}</span><span className="history-copy"><strong>{item.title}</strong><small>{item.details}</small>{item.type === 'observation' && <em className="verification-state">{item.expertVerified ? t('history.verified') : t('history.notVerified')}</em>}</span><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString(locale)}</time></div>) : <div className="empty-state compact-empty"><div className="empty-icon"><Activity size={21} /></div><h3>{t('history.empty')}</h3><p>{t('field.locationHint')}</p>{fields.length ? <Link to="/app/scan" className="button button-outline large-action-button">{t('scan.review')} <ArrowRight size={16} /></Link> : <Link to="/app/onboarding" className="button button-outline large-action-button">{t('dashboard.addField')} <ArrowRight size={16} /></Link>}</div>}
    </section>
    <section className="panel panel-pad observation-panel"><div className="panel-heading"><div><h2>{t('history.record')}</h2><p>{t('history.notVerified')}</p></div><span className="soft-badge green"><MessageSquareText size={14} />{t('history.record')}</span></div>
      {!fields.length ? <div className="empty-state compact-empty"><p>{t('field.empty')}</p><Link className="button button-primary large-action-button" to="/app/onboarding">{t('dashboard.addField')}</Link></div> : <form onSubmit={(event) => void submitObservation(event)}>
        <div className="form-field large-form-field" style={{ marginTop: 16 }}><label htmlFor="observationField">{t('scan.field')}</label><select id="observationField" value={fieldId} onChange={(event) => setFieldId(event.target.value)}>{fields.map((field: FarmField) => <option key={field.id} value={field.id}>{field.name} · {localizedCrop(field.crop)}</option>)}</select></div>
        <div className="form-field large-form-field" style={{ marginTop: 12 }}><label htmlFor="symptoms">{t('history.symptoms')}</label><textarea id="symptoms" required maxLength={1200} value={symptoms} onChange={(event) => setSymptoms(event.target.value)} /></div>
        <div className="form-field large-form-field" style={{ marginTop: 12 }}><label htmlFor="action">{t('history.action')}</label><textarea id="action" maxLength={800} value={action} onChange={(event) => setAction(event.target.value)} /></div>
        <div className="form-field large-form-field" style={{ marginTop: 12 }}><label htmlFor="improved">{t('history.improved')}</label><select id="improved" value={improved} onChange={(event) => setImproved(event.target.value)}><option value="unknown">{t('history.unsure')}</option><option value="yes">{t('history.yes')}</option><option value="no">{t('history.no')}</option></select></div>
        <div className="consent-note" style={{ marginTop: 12 }}>{t('history.notVerified')}</div><div className="form-actions"><button className="button button-primary large-action-button" disabled={saving}>{saving ? <span className="spinner spinner-light" /> : null}{t('history.save')} <ArrowRight size={16} /></button></div>
      </form>}
    </section></div>
    <div className="sample-disclosure farmer-disclosure">{t('history.notVerified')}</div>
  </>;
}
