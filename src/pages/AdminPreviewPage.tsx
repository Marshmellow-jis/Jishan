import { ArrowRight, Bell, ClipboardList, CloudSun, Database, Eye, FileClock, ShieldCheck, SlidersHorizontal, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pilotCrops } from '../data/sample';

const validationTargets = [
  ['Pilot coverage', '3–5 validated crop/disease combinations'],
  ['Image diagnostics', 'Macro-F1 ≥ 0.85 on representative data'],
  ['Risk calibration', 'Brier score and reliability plots'],
  ['Weather availability', '≥ 95% when external services work'],
  ['Advisory latency', 'Median ≤ 10 seconds, excluding slow services'],
  ['High-risk alerts', 'Precision ≥ 80%, subject to pilot sample size'],
  ['Farmer task completion', '≥ 85%'],
  ['Spray minimization', 'Measure through expert-reviewed pilot audits'],
];

export default function AdminPreviewPage() {
  return <>
    <div className="page-heading"><div><div className="section-label"><span className="eyebrow-line" /> SAMPLE ROLE VIEW</div><h1>Administrator preview</h1><p>Illustrative model governance and alert-quality surfaces—not live system settings.</p></div><span className="soft-badge amber"><Eye size={12} /> READ ONLY</span></div>
    <div className="preview-watermark"><ShieldCheck size={15} /><span><strong>No configuration changes are available.</strong> This account cannot edit thresholds, promote roles, publish model versions or change advisory rules. All cards below are examples for interface discussion.</span></div>
    <div className="admin-preview-grid">
      <section className="panel panel-pad"><div className="panel-heading"><div><h2>Model registry</h2><p>Candidate pilot coverage · not active</p></div><span className="soft-badge amber"><SlidersHorizontal size={12} /> UNCONFIGURED</span></div>
        <div className="registry-list">{pilotCrops.map((crop) => <div className="registry-row" key={crop.name}><span className="registry-mark"><Database size={15} /></span><span><strong>{crop.name} · {crop.disease}</strong><small>{crop.note}</small></span><span className="soft-badge">No model</span></div>)}</div>
        <div className="admin-note">No active model version is connected. A crop profile is not an approved model; candidate workflows need representative field data, evaluation and documented release review.</div>
      </section>
      <section className="panel panel-pad"><div className="panel-heading"><div><h2>Alert quality</h2><p>Evaluation dashboard placeholder</p></div><span className="soft-badge">NO DATA</span></div>
        <div className="admin-metrics"><div><small>False alarms</small><strong>Not measured</strong></div><div><small>Missed outbreaks</small><strong>Not measured</strong></div><div><small>Precision / recall</small><strong>Not measured</strong></div></div>
        <div className="admin-note">Pilot targets are hypotheses to test—not current system performance. Risk calibration, severe-disease false negatives and geo-temporal separation matter.</div>
      </section>
    </div>
    <section className="panel panel-pad admin-targets"><div className="panel-heading"><div><h2>Targets to validate in a pilot</h2><p>PRD evaluation hypotheses · not measured results</p></div><span className="soft-badge amber">NOT PERFORMANCE CLAIMS</span></div>
      <div className="admin-target-grid">{validationTargets.map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
    </section>
    <section className="panel panel-pad audit-preview"><div className="panel-heading"><div><h2>Alert history preview</h2><p>No live alert events are connected or delivered.</p></div><span className="soft-badge amber"><Bell size={12} /> EXAMPLE</span></div>
      <div className="audit-example"><span className="audit-mark"><CloudSun size={15} /></span><span><strong>Illustrative alert: review an example weather change</strong><small>Sample design event · not tied to a real field · not delivered</small></span><span className="soft-badge">Not sent</span></div>
      <div className="audit-example"><span className="audit-mark"><Wind size={15} /></span><span><strong>Illustrative correction: withdraw a stale forecast notice</strong><small>Example of future correction behavior · no live history or delivery service</small></span><span className="soft-badge">Not sent</span></div>
    </section>
    <section className="panel panel-pad audit-preview"><div className="panel-heading"><div><h2>Audit trail preview</h2><p>No model-administration events are connected.</p></div><span className="soft-badge amber"><FileClock size={12} /> EXAMPLE</span></div>
      <div className="audit-example"><span className="audit-mark"><ClipboardList size={15} /></span><span><strong>Future event: approve disease-specific rule</strong><small>Example only · actor, model version, evidence and reason would be recorded</small></span><span className="soft-badge">Not recorded</span></div>
      <div className="audit-example"><span className="audit-mark"><ShieldCheck size={15} /></span><span><strong>Future event: withdraw a stale forecast alert</strong><small>Example only · no external notifications are currently sent</small></span><span className="soft-badge">Not recorded</span></div>
    </section>
    <div className="preview-footer-actions"><Link className="button button-outline" to="/app/expert-preview">Open expert sample <ArrowRight size={14} /></Link></div>
  </>;
}
