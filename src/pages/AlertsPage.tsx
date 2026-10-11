import { useEffect, useState } from 'react';
import { Bell, Check, Clock3, CloudRain, Info, MessageCircle, RotateCcw, ShieldCheck, Smartphone } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const prefsKey = 'agrishield-alert-preferences-v1';
interface Prefs { inApp: boolean; quietStart: string; quietEnd: string; }
const defaults: Prefs = { inApp: true, quietStart: '20:00', quietEnd: '07:00' };
type SampleView = 'current' | 'corrected' | 'hidden';

export default function AlertsPage() {
  const { t } = useI18n(); const [prefs, setPrefs] = useState<Prefs>(defaults); const [sampleView, setSampleView] = useState<SampleView>('current');
  useEffect(() => { try { const saved = localStorage.getItem(prefsKey); if (saved) setPrefs({ ...defaults, ...JSON.parse(saved) as Partial<Prefs> }); } catch { /* keep defaults */ } }, []);
  function change(next: Prefs) { setPrefs(next); try { localStorage.setItem(prefsKey, JSON.stringify(next)); } catch { /* local preferences are optional */ } }
  return <>
    <div className="page-heading"><div><div className="section-label"><span className="eyebrow-line" /> {t('app.sampleTag')}</div><h1>{t('alerts.title')}</h1><p>{t('alerts.none')}</p></div><span className="soft-badge amber"><Bell size={14} /> {t('alerts.notSent')}</span></div>
    <div className="easy-no-spray alert-empty-banner"><span className="easy-no-spray-icon"><Bell size={23} /></span><div><h2>{t('alerts.none')}</h2><p>{t('alerts.notSent')}</p></div></div>
    <div className="sample-disclosure farmer-disclosure"><ShieldCheck size={18} /><span>{t('lang.coverage')} {t('lang.translationNote')}</span></div>

    <details className="panel alerts-english-details"><summary><span><Info size={17} />{t('lang.coverage')}</span></summary><div className="alerts-layout"><div className="alerts-main"><section className="panel panel-pad"><div className="panel-heading"><div><h2>Recent sample alerts · English</h2><p>Example content only</p></div><span className="soft-badge amber">SAMPLE</span></div>
      {!prefs.inApp ? <div className="empty-state compact-empty"><div className="empty-icon"><Bell size={19} /></div><h3>Sample preview is off</h3><p>No real delivery preference changed.</p></div> : sampleView === 'hidden' ? <div className="empty-state compact-empty"><div className="empty-icon"><Check size={20} /></div><h3>Sample hidden</h3><p>No real alert was changed.</p><button className="button button-outline" onClick={() => setSampleView('current')}>Show sample card</button></div> : sampleView === 'corrected' ? <div className="alert-correction-card" aria-live="polite"><span className="alert-card-icon"><RotateCcw size={18} /></span><div className="alert-card-copy"><span className="soft-badge amber">WITHDRAWN · SAMPLE</span><strong>Example notice withdrawn after the forecast changed</strong><p>Correction preview only. No live alert was cancelled or sent.</p><span className="alert-meta"><Clock3 size={14} /> Not delivered</span></div><button className="text-button" onClick={() => setSampleView('current')}>Show original example</button></div> : <div className="alert-card" style={{ marginTop: 15 }}><span className="alert-card-icon"><CloudRain size={18} /></span><div className="alert-card-copy"><strong>Illustrative sample alert · not connected to your field</strong><p>Mock content only. No disease has been confirmed. Use field scouting and clear image capture.</p><span className="alert-meta"><Clock3 size={14} /> Not delivered</span></div><div className="alert-sample-actions"><button className="text-button" onClick={() => setSampleView('corrected')}>Preview a correction</button><button className="text-button" onClick={() => setSampleView('hidden')}>Hide sample</button></div></div>}
      </section><div className="alerts-integrations"><div className="integration-card"><span><Smartphone size={18} /></span><div><strong>In-app alerts</strong><small>Preference preview only</small></div><span className="soft-badge amber">Demo</span></div><div className="integration-card"><span><MessageCircle size={18} /></span><div><strong>SMS / WhatsApp</strong><small>Not connected</small></div><span className="soft-badge">Planned</span></div></div></div>
      <section className="panel panel-pad preference-panel"><div className="panel-heading"><div><h2>Sample preferences · English</h2><p>Saved on this device only.</p></div><span className="soft-badge"><Info size={14} /> DEMO</span></div>
        <div className="preference-row"><span><strong>In-app sample previews</strong><small>Changes only this example card in this browser.</small></span><button className="toggle" role="switch" aria-checked={prefs.inApp} aria-label="Toggle sample preview" onClick={() => change({ ...prefs, inApp: !prefs.inApp })} /></div>
        <div className="quiet-hours"><div className="quiet-heading"><Clock3 size={16} /><strong>Quiet-hour example</strong></div><div className="quiet-time-fields"><label>From<input type="time" value={prefs.quietStart} onChange={(event) => change({ ...prefs, quietStart: event.target.value })} /></label><label>To<input type="time" value={prefs.quietEnd} onChange={(event) => change({ ...prefs, quietEnd: event.target.value })} /></label></div><small>No alerts are scheduled or suppressed by this prototype.</small></div>
        <div className="preference-footnote"><ShieldCheck size={15} /> A real system would deduplicate alerts and withdraw stale forecasts.</div>
      </section></div></details>
  </>;
}
