import { CloudRain, Info, Leaf, ShieldCheck, Wind } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import RiskChart from '../components/RiskChart';
import { sampleRisk, sampleWeather } from '../data/sample';
import type { AppLayoutContext } from '../app/AppShell';
import { useI18n } from '../i18n/I18nProvider';

export default function RiskPage() {
  const { fields } = useOutletContext<AppLayoutContext>();
  const { easyView, t } = useI18n();
  return <>
    <div className="page-heading"><div><div className="section-label"><span className="eyebrow-line" /> {t('app.sampleTag')}</div><h1>{t('risk.title')}</h1><p>{t('risk.askExpert')}</p></div><span className="soft-badge amber"><Info size={14} /> {t('risk.noWeather')}</span></div>
    <div className="easy-risk-notice"><ShieldCheck size={23} /><div><strong>{t('risk.warning')}</strong><p>{t('risk.noWeather')} {t('risk.noDiagnosis')}</p><p>{t('risk.noProbability')}</p></div></div>
    <div className="easy-action-grid risk-meaning-cards"><article className="easy-action-card action-blue"><span className="easy-action-icon"><CloudRain size={26} /></span><strong>{t('risk.noWeather')}</strong></article><article className="easy-action-card action-green"><span className="easy-action-icon"><Leaf size={26} /></span><strong>{t('risk.noDiagnosis')}</strong></article><article className="easy-action-card action-gold"><span className="easy-action-icon"><Wind size={26} /></span><strong>{t('risk.askExpert')}</strong></article></div>
    <div className="sample-disclosure farmer-disclosure"><ShieldCheck size={18} /><span>{t('advisory.noChemical')} <Link to="/app/advisory">{t('nav.advisory')} <span aria-hidden="true">→</span></Link></span></div>
    {!easyView && <details className="panel dashboard-example-details"><summary><span><CloudRain size={19} /> Technical sample values · English</span><span>{t('risk.warning')}</span></summary><div className="risk-page-grid"><section className="panel risk-panel"><div className="risk-panel-top"><div><div className="section-label">EXAMPLE RISK CURVE</div><h2>{fields[0]?.name || 'Potato Plot A'} · illustrative only</h2></div><span className="soft-badge amber">No model</span></div><div className="risk-number"><strong>48/100</strong><span>sample · not probability</span></div><RiskChart /><div className="risk-value-table"><div className="preview-table-row header"><span>Time</span><span>Sample</span><span>Data status</span><span>Read</span></div>{sampleRisk.map((point) => <div className="preview-table-row" key={point.label}><span>{point.label}</span><strong>{point.risk}/100</strong><span>Illustrative</span><span>Sample</span></div>)}</div></section><section className="panel panel-pad"><h2>Sample weather inputs</h2>{sampleWeather.map((factor) => <div className="weather-source-row" key={factor.label}><span><strong>{factor.label}</strong><small>{factor.note}</small></span><b>{factor.value}</b></div>)}</section></div></details>}
  </>;
}
