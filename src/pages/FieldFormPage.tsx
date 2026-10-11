import { ArrowRight } from 'lucide-react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import type { AppLayoutContext } from '../app/AppShell';
import type { FarmField } from '../lib/contracts';
import FieldForm from '../components/FieldForm';
import { useI18n } from '../i18n/I18nProvider';

export default function FieldFormPage() {
  const navigate = useNavigate();
  const { refreshFields, setToast } = useOutletContext<AppLayoutContext>();
  const { t } = useI18n();
  async function saved(field: FarmField) { await refreshFields(); setToast(t('field.saved')); navigate(`/app/fields/${field.id}`); }
  return <>
    <div className="page-heading"><div><Link to="/app/fields" className="back-link"><ArrowRight size={16} /> {t('nav.fields')}</Link><h1 style={{ marginTop: 12 }}>{t('field.add')}</h1><p>{t('field.locationHint')}</p></div></div>
    <FieldForm onSaved={(field) => void saved(field)} />
  </>;
}
