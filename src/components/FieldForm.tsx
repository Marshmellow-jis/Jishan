import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CalendarDays, Check, MapPin, Sprout } from 'lucide-react';
import type { FarmField, FieldInput } from '../lib/contracts';
import { api, asErrorMessage } from '../lib/http';
import { useI18n, type MessageKey } from '../i18n/I18nProvider';

interface Props { initial?: FarmField; onSaved: (field: FarmField) => void; }
const emptyForm: FieldInput = { farmName: '', fieldName: '', crop: 'Potato', variety: '', growthStage: 'Vegetative', plantingDate: '', region: '' };
function fromField(initial?: FarmField): FieldInput {
  if (!initial) return { ...emptyForm };
  return { farmName: initial.farmName, fieldName: initial.name, crop: initial.crop as FieldInput['crop'], variety: initial.variety || '', growthStage: initial.growthStage as FieldInput['growthStage'], plantingDate: initial.plantingDate || '', region: initial.region };
}
const crops: { value: FieldInput['crop']; key: MessageKey; icon: string }[] = [
  { value: 'Potato', key: 'crop.Potato', icon: '🥔' }, { value: 'Rice', key: 'crop.Rice', icon: '🌾' }, { value: 'Cotton', key: 'crop.Cotton', icon: '☁️' }, { value: 'Soybean', key: 'crop.Soybean', icon: '🌱' }, { value: 'Other', key: 'crop.Other', icon: '🌿' },
];
const stages: { value: FieldInput['growthStage']; key: MessageKey }[] = [
  { value: 'Seedling', key: 'stage.Seedling' }, { value: 'Vegetative', key: 'stage.Vegetative' }, { value: 'Flowering', key: 'stage.Flowering' }, { value: 'Fruiting / tuber', key: 'stage.Fruiting / tuber' }, { value: 'Maturity', key: 'stage.Maturity' }, { value: 'Not sure', key: 'stage.Not sure' },
];

export default function FieldForm({ initial, onSaved }: Props) {
  const { t } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<FieldInput>(() => fromField(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const draftKey = `agrishield.field-draft.v1.${initial?.id || 'new'}`;

  useEffect(() => {
    const defaults = fromField(initial);
    try { const stored = sessionStorage.getItem(draftKey); if (stored) { const parsed = JSON.parse(stored) as Partial<FieldInput>; if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) { setForm({ ...defaults, ...parsed }); return; } } }
    catch { try { sessionStorage.removeItem(draftKey); } catch { /* Storage may be disabled. */ } }
    setForm(defaults);
  }, [draftKey, initial]);
  useEffect(() => { try { sessionStorage.setItem(draftKey, JSON.stringify(form)); } catch { /* keep the form usable */ } }, [draftKey, form]);

  function update<K extends keyof FieldInput>(key: K, value: FieldInput[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function nextStep() {
    if (step === 1 && formRef.current && !formRef.current.reportValidity()) return;
    setError(''); setStep((current) => Math.min(3, current + 1));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = initial ? await api<{ field: FarmField }>(`/fields/${initial.id}`, { method: 'PUT', body: JSON.stringify(form) }) : await api<{ field: FarmField }>('/fields', { method: 'POST', body: JSON.stringify(form) });
      try { sessionStorage.removeItem(draftKey); } catch { /* saved record remains authoritative */ }
      onSaved(result.field);
    } catch (cause) { setError(asErrorMessage(cause)); }
    finally { setBusy(false); }
  }

  return <form ref={formRef} className="panel form-panel easy-field-form" onSubmit={(event) => void submit(event)}>
    <div className="field-step-heading"><span className="field-step-icon"><Sprout size={25} /></span><div><span className="field-step-counter">{t('field.stepOf', { current: step, total: 3 })}</span><h2>{step === 1 ? t('field.nameFarm') : step === 2 ? t('field.chooseCrop') : t('field.location')}</h2><p>{t('field.locationHint')}</p></div></div>
    <div className="field-step-progress" aria-label={t('field.stepOf', { current: step, total: 3 })}><span className={step >= 1 ? 'done' : ''} /><span className={step >= 2 ? 'done' : ''} /><span className={step >= 3 ? 'done' : ''} /></div>
    {error && <div className="inline-alert danger" role="alert" style={{ marginTop: 15 }}>{error}</div>}

    {step === 1 && <div className="field-step-body">
      <div className="form-field large-form-field"><label htmlFor="farmName">{t('field.farmName')}</label><input autoFocus id="farmName" maxLength={120} required value={form.farmName} onChange={(event) => update('farmName', event.target.value)} /></div>
      <div className="form-field large-form-field"><label htmlFor="fieldName">{t('field.plotName')}</label><input id="fieldName" maxLength={120} required value={form.fieldName} onChange={(event) => update('fieldName', event.target.value)} /></div>
    </div>}

    {step === 2 && <div className="field-step-body">
      <fieldset className="crop-choice-fieldset"><legend>{t('field.chooseCrop')}</legend><div className="crop-choice-grid">{crops.map((crop) => <button className={`crop-choice${form.crop === crop.value ? ' selected' : ''}`} type="button" key={crop.value} onClick={() => update('crop', crop.value)} aria-pressed={form.crop === crop.value}><span className="crop-choice-icon" aria-hidden="true">{crop.icon}</span><span>{t(crop.key)}</span>{form.crop === crop.value && <Check size={18} className="crop-choice-check" />}</button>)}</div></fieldset>
      <div className="form-field large-form-field"><label htmlFor="growthStage">{t('field.chooseStage')}</label><select id="growthStage" value={form.growthStage} onChange={(event) => update('growthStage', event.target.value as FieldInput['growthStage'])}>{stages.map((stage) => <option value={stage.value} key={stage.value}>{t(stage.key)}</option>)}</select></div>
      <p className="field-hint field-safety-hint">{t('field.cropSupportNote')}</p>
    </div>}

    {step === 3 && <div className="field-step-body">
      <div className="form-field large-form-field"><label htmlFor="variety">{t('field.variety')} · {t('field.optional')}</label><input id="variety" maxLength={120} placeholder={t('field.varietyHint')} value={form.variety || ''} onChange={(event) => update('variety', event.target.value)} /></div>
      <div className="form-field large-form-field"><label htmlFor="plantingDate"><span className="label-icon-inline"><CalendarDays size={17} /> {t('field.plantingDate')}</span> · {t('field.optional')}</label><input id="plantingDate" type="date" value={form.plantingDate || ''} onChange={(event) => update('plantingDate', event.target.value)} /></div>
      <div className="form-field large-form-field"><label htmlFor="region"><span className="label-icon-inline"><MapPin size={17} /> {t('field.location')}</span></label><input id="region" maxLength={160} placeholder={t('field.location')} value={form.region} onChange={(event) => update('region', event.target.value)} /><span className="field-hint">{t('field.locationHint')}</span></div>
      <div className="consent-note field-consent"><ShieldCheckIcon />{t('field.locationConsent')}</div>
    </div>}

    <div className="field-step-actions">{step > 1 && <button className="button button-outline" type="button" onClick={() => { setError(''); setStep((current) => current - 1); }}>{t('field.back')}</button>}{step < 3 ? <button className="button button-primary" type="button" onClick={nextStep}>{t('field.next')} <span aria-hidden="true">→</span></button> : <button className="button button-primary" type="submit" disabled={busy}>{busy ? <span className="spinner spinner-light" /> : <Check size={18} />}{busy ? t('field.saving') : t('field.save')}</button>}</div>
    <p className="field-hint draft-note">{t('field.draftNote')}</p>
  </form>;
}

function ShieldCheckIcon() { return <span className="location-consent-mark" aria-hidden="true">✓</span>; }
