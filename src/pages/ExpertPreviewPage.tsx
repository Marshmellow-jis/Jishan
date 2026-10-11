import { useState } from 'react';
import { ArrowRight, BadgeCheck, CircleHelp, ClipboardCheck, CloudSun, Eye, FileClock, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const examples = [
  { id: 'EX-01', field: 'Sample potato plot', crop: 'Potato', status: 'Image check needed', action: 'Request clearer close-up', note: 'Example: image evidence is not verified.' },
  { id: 'EX-02', field: 'Sample paddy field', crop: 'Rice', status: 'Weather unavailable', action: 'Withhold risk claim', note: 'Example: do not fill missing forecast inputs with a guess.' },
  { id: 'EX-03', field: 'Sample cotton row', crop: 'Cotton', status: 'Pest review needed', action: 'Use scouting workflow', note: 'Example: pink bollworm needs its own pest evidence.' },
];
type FeedbackFlag = 'possible_false_alarm' | 'possible_missed_outbreak';

export default function ExpertPreviewPage() {
  const [flags, setFlags] = useState<Record<string, FeedbackFlag | null>>({});
  function setFlag(id: string, flag: FeedbackFlag) {
    setFlags((current) => ({ ...current, [id]: current[id] === flag ? null : flag }));
  }

  return <>
    <div className="page-heading"><div><div className="section-label"><span className="eyebrow-line" /> SAMPLE ROLE VIEW</div><h1>Expert review preview</h1><p>See how uncertainty and provenance could be surfaced to an agronomist.</p></div><span className="soft-badge amber"><Eye size={12} /> SAMPLE WORKSPACE</span></div>
    <div className="preview-watermark"><ShieldAlert size={15} /><span><strong>Illustrative expert workspace.</strong> These rows are fictional design examples; no farmer case has been assigned or reviewed. The buttons below only toggle an unsaved local preview flag; they do not change any diagnosis or submit feedback.</span></div>
    <div className="preview-summary-grid"><article className="stat-card"><div className="stat-card-top"><span>EXAMPLE CASES</span><span className="stat-card-icon"><CircleHelp size={14} /></span></div><strong>03</strong><small>Fictional sample rows</small></article><article className="stat-card"><div className="stat-card-top"><span>REVIEW STATE</span><span className="stat-card-icon"><ClipboardCheck size={14} /></span></div><strong style={{ fontSize: 14, marginTop: 13 }}>Preview only</strong><small>No real cases or edits</small></article><article className="stat-card"><div className="stat-card-top"><span>VERIFIED LABELS</span><span className="stat-card-icon"><BadgeCheck size={14} /></span></div><strong>—</strong><small>No validated labels in prototype</small></article></div>
    <section className="panel panel-pad preview-cases"><div className="panel-heading"><div><h2>Cases to review</h2><p>Fictional examples of cautious handling</p></div><span className="soft-badge amber">SAMPLE DATA</span></div>
      <div className="preview-table-row header"><span>Case / field</span><span>Crop</span><span>Evidence state</span><span>Next step</span></div>
      {examples.map((item) => <div className="preview-table-row" key={item.id}><span><strong>{item.id}</strong> · {item.field}</span><span>{item.crop}</span><span>{item.status}<small className="expert-case-note">{item.note}</small></span><span>{item.action}</span></div>)}
      <div className="preview-readonly-note"><Eye size={13} /> Diagnosis, confidence, model version and alert delivery are unavailable; no case is treated as reviewed.</div>
    </section>
    <section className="panel panel-pad sample-feedback-panel"><div className="panel-heading"><div><h2>Sample feedback controls</h2><p>Explore how a false-alarm or missed-outbreak flag might look.</p></div><span className="soft-badge">LOCAL ONLY</span></div>
      {examples.map((item) => <div className="sample-flag-row" key={item.id}><span><strong>{item.id} · {item.crop}</strong><small>{flags[item.id] ? `Preview flag: ${flags[item.id] === 'possible_false_alarm' ? 'possible false alarm' : 'possible missed outbreak'} · not saved` : 'No preview flag set'}</small></span><div><button className={flags[item.id] === 'possible_false_alarm' ? 'text-button is-selected' : 'text-button'} aria-pressed={flags[item.id] === 'possible_false_alarm'} onClick={() => setFlag(item.id, 'possible_false_alarm')}>False alarm</button><button className={flags[item.id] === 'possible_missed_outbreak' ? 'text-button is-selected' : 'text-button'} aria-pressed={flags[item.id] === 'possible_missed_outbreak'} onClick={() => setFlag(item.id, 'possible_missed_outbreak')}>Possible miss</button></div></div>)}
      <div className="preview-local-note">Flags remain in this page's memory only. They are not transmitted or retained as model labels.</div>
    </section>
    <section className="expert-provenance"><article className="panel"><span><BadgeCheck size={15} /></span><small>Model / version</small><strong>No model connected</strong></article><article className="panel"><span><CloudSun size={15} /></span><small>Weather snapshot</small><strong>Unavailable</strong></article><article className="panel"><span><FileClock size={15} /></span><small>Alert history</small><strong>No live events</strong></article></section>
    <section className="expert-principles"><div><span className="expert-principle-icon"><ShieldAlert size={16} /></span><h3>Escalate uncertainty</h3><p>Missing or poor image evidence requests a retake or expert review—not a confident guess.</p></div><div><span className="expert-principle-icon"><BadgeCheck size={16} /></span><h3>Keep labels distinct</h3><p>Farmer reports are observations. Only reviewed cases would become expert-verified labels.</p></div><div><span className="expert-principle-icon"><ClipboardCheck size={16} /></span><h3>Keep an audit trail</h3><p>Future review changes should record the actor, reason and model version.</p></div></section>
    <div className="preview-footer-actions"><Link className="button button-outline" to="/app/history">Return to farmer history <ArrowRight size={14} /></Link></div>
  </>;
}
