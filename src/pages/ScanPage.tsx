import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { AlertTriangle, ArrowRight, Camera, FileImage, Info, ScanLine, ShieldCheck, Trash2 } from 'lucide-react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import type { AppLayoutContext } from '../app/AppShell';
import type { FarmField, DiagnosisResult } from '../lib/contracts';
import { api, asErrorMessage } from '../lib/http';
import { useI18n, type MessageKey } from '../i18n/I18nProvider';

interface LocalImage { file: File; url: string; width: number; height: number; }
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxFileBytes = 8 * 1024 * 1024;
async function imageDimensions(file: File): Promise<{ width: number; height: number }> {
  if ('createImageBitmap' in window) { const bitmap = await createImageBitmap(file); const dimensions = { width: bitmap.width, height: bitmap.height }; bitmap.close(); return dimensions; }
  return new Promise((resolve, reject) => { const temporaryUrl = URL.createObjectURL(file); const image = new Image(); image.onload = () => { URL.revokeObjectURL(temporaryUrl); resolve({ width: image.naturalWidth, height: image.naturalHeight }); }; image.onerror = () => { URL.revokeObjectURL(temporaryUrl); reject(new Error('Image could not be opened.')); }; image.src = temporaryUrl; });
}

export default function ScanPage() {
  const { fields } = useOutletContext<AppLayoutContext>();
  const { t } = useI18n();
  const localizedValue = (prefix: 'crop' | 'stage', value: string) => { const key = `${prefix}.${value}` as MessageKey; const result = t(key); return result === key ? value : result; };
  const navigate = useNavigate();
  const [fieldId, setFieldId] = useState(fields[0]?.id || '');
  const [images, setImages] = useState<LocalImage[]>([]);
  const imageUrls = useRef(new Set<string>());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const field = useMemo(() => fields.find((item) => item.id === fieldId), [fields, fieldId]);
  useEffect(() => { if (!fieldId && fields[0]) setFieldId(fields[0].id); }, [fields, fieldId]);
  useEffect(() => () => { imageUrls.current.forEach((url) => URL.revokeObjectURL(url)); imageUrls.current.clear(); }, []);

  async function addFiles(event: ChangeEvent<HTMLInputElement>) {
    setError(''); const selected = Array.from(event.target.files || []); event.target.value = ''; if (!selected.length) return;
    if (images.length + selected.length > 3) { setError(t('scan.photoCount')); return; }
    const additions: LocalImage[] = [];
    for (const file of selected) {
      if (!allowedTypes.includes(file.type)) { setError(t('scan.badType')); continue; }
      if (file.size > maxFileBytes) { setError(t('scan.badSize')); continue; }
      try { const dimensions = await imageDimensions(file); if (Math.min(dimensions.width, dimensions.height) < 240 || Math.max(dimensions.width, dimensions.height) < 360) { setError(t('scan.tooSmall')); continue; } const url = URL.createObjectURL(file); imageUrls.current.add(url); additions.push({ file, url, ...dimensions }); }
      catch { setError(t('scan.tooSmall')); }
    }
    setImages((current) => [...current, ...additions].slice(0, 3));
  }

  function removeImage(index: number) { const image = images[index]; if (image) { URL.revokeObjectURL(image.url); imageUrls.current.delete(image.url); } setImages((current) => current.filter((_item, itemIndex) => itemIndex !== index)); }

  async function createReview() {
    if (!fieldId) { setError(t('scan.field')); return; }
    if (!images.length) { setError(t('scan.noPhoto')); return; }
    setBusy(true); setError('');
    try { const result = await api<{ diagnosis: DiagnosisResult }>('/diagnoses', { method: 'POST', body: JSON.stringify({ fieldId, imageCount: images.length }) }); navigate(`/app/diagnosis/${result.diagnosis.id}`, { state: { diagnosis: result.diagnosis } }); }
    catch (cause) { setError(asErrorMessage(cause)); }
    finally { setBusy(false); }
  }

  if (!fields.length) return <>
    <div className="page-heading"><div><div className="section-label"><span className="eyebrow-line" /> {t('scan.title')}</div><h1>{t('scan.title')}</h1><p>{t('field.empty')}</p></div></div>
    <section className="panel empty-state farmer-empty-state"><div className="empty-icon"><ScanLine size={25} /></div><h3>{t('field.empty')}</h3><p>{t('field.locationHint')}</p><Link className="button button-primary large-action-button" to="/app/onboarding">{t('dashboard.addField')} <ArrowRight size={17} /></Link></section>
  </>;

  return <>
    <div className="page-heading"><div><div className="section-label"><span className="eyebrow-line" /> {t('scan.title')}</div><h1>{t('scan.title')}</h1><p>{t('scan.cameraHint')}</p></div><span className="soft-badge amber"><Info size={14} />{t('scan.noAi')}</span></div>
    <div className="scan-layout"><div className="scan-main-stack">
      <section className="panel panel-pad easy-scan-panel"><div className="panel-heading"><div><h2>{t('scan.field')}</h2><p>{t('field.chooseCrop')}</p></div><span className="step-number-inline">01</span></div>
        <div className="form-field large-form-field" style={{ marginTop: 17 }}><label htmlFor="scanField">{t('scan.field')}</label><select id="scanField" value={fieldId} onChange={(event) => setFieldId(event.target.value)}>{fields.map((item: FarmField) => <option value={item.id} key={item.id}>{item.name} · {localizedValue('crop', item.crop)} · {item.region}</option>)}</select></div>
        {field && <div className="scan-context"><span className="scan-context-icon"><FileImage size={18} /></span><span><strong>{localizedValue('crop', field.crop)}</strong><small>{field.name} · {localizedValue('stage', field.growthStage)}</small></span></div>}
      </section>

      <section className="panel panel-pad easy-scan-panel"><div className="panel-heading"><div><h2>{t('scan.camera')}</h2><p>{t('scan.cameraHint')}</p></div><span className="step-number-inline">02</span></div>
        <label className="upload-zone farmer-upload-zone" htmlFor="cropImages" style={{ marginTop: 16 }}><input id="cropImages" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple onChange={(event) => void addFiles(event)} /><span><span className="upload-zone-icon"><Camera size={27} /></span><strong>{t('scan.camera')}</strong><small>{t('scan.photoCount')} · JPEG, PNG or WebP · 8 MB maximum per image</small></span></label>
        {images.length > 0 && <div className="upload-preview-grid">{images.map((image, index) => <div className="upload-preview" key={`${image.file.name}-${index}`}><img src={image.url} alt={`${t('scan.choosePhoto')} ${index + 1}`} /><button type="button" onClick={() => removeImage(index)} aria-label={`${t('scan.removePhoto')} ${index + 1}`}><Trash2 size={16} /></button></div>)}</div>}
        <div className="scan-message"><Info size={16} />{t('scan.photoPrivate')}</div>
        <ul className="guide-list scan-guidance"><li><ShieldCheck size={16} />{t('scan.cameraHint')}</li><li><ShieldCheck size={16} />{t('scan.noAi')}</li></ul>
      </section>
    </div>

    <aside className="scan-side-stack"><section className="panel panel-pad scan-request-card"><div className="request-step">03</div><h2>{t('scan.review')}</h2><p>{t('scan.photoPrivate')}</p><div className="request-summary"><span>{t('scan.field')}</span><strong>{field?.name || '—'}</strong><span>{t('scan.photoCount')}</span><strong>{images.length} / 3</strong></div>
      {error && <div className="inline-alert danger" role="alert">{error}</div>}
      <button className="button button-primary button-wide large-action-button" onClick={() => void createReview()} disabled={busy || !images.length}>{busy ? <span className="spinner spinner-light" /> : null}{t('scan.review')} <ArrowRight size={17} /></button>
      <div className="request-safety"><AlertTriangle size={16} /><span>{t('scan.noAi')}</span></div></section>
      <div className="sample-disclosure farmer-disclosure"><ShieldCheck size={17} /><span>{t('diagnosis.safe')}</span></div>
    </aside></div>
  </>;
}
