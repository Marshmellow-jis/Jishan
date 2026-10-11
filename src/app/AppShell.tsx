import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Activity, Bell, BookOpenCheck, ChevronDown, CircleHelp, CloudSun, Flower2, History, Menu, ScanLine, ShieldCheck, Sprout, UserRound, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { api, asErrorMessage } from '../lib/http';
import type { FarmField } from '../lib/contracts';
import Brand from '../components/Brand';
import AccessibilityTools, { EasyViewToggle, LanguageSelect, ListenButton } from '../components/AccessibilityTools';
import { useI18n, type MessageKey } from '../i18n/I18nProvider';

export interface AppLayoutContext { fields: FarmField[]; refreshFields: () => Promise<void>; setToast: (message: string) => void; }

const primaryNavigation: { label: MessageKey; to: string; icon: typeof Activity; end?: boolean }[] = [
  { label: 'nav.home', to: '/app', icon: Activity, end: true },
  { label: 'nav.fields', to: '/app/fields', icon: Sprout },
  { label: 'nav.scan', to: '/app/scan', icon: ScanLine },
  { label: 'nav.risk', to: '/app/risk', icon: CloudSun },
  { label: 'nav.advisory', to: '/app/advisory', icon: BookOpenCheck },
  { label: 'nav.alerts', to: '/app/alerts', icon: Bell },
  { label: 'nav.history', to: '/app/history', icon: History },
];

function SidebarLinks({ onChoose }: { onChoose?: () => void }) {
  const { t } = useI18n();
  return <>
    <div className="side-section-label">{t('nav.workspace')}</div>
    {primaryNavigation.map(({ label, to, icon: Icon, end }) => (
      <NavLink key={to} end={end} to={to} onClick={onChoose} className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
        <Icon size={20} strokeWidth={1.8} /> <span>{t(label)}</span>
        {label === 'nav.alerts' && <span className="side-link-dot" aria-label={t('app.sampleTag')} />}
      </NavLink>
    ))}
    <div className="side-section-label side-section-spaced">Preview tools · English</div>
    <NavLink to="/app/expert-preview" onClick={onChoose} className={({ isActive }) => `side-link side-link-preview${isActive ? ' active' : ''}`}><CircleHelp size={18} strokeWidth={1.8} /><span>Expert preview</span><span className="tiny-tag">SAMPLE</span></NavLink>
    <NavLink to="/app/admin-preview" onClick={onChoose} className={({ isActive }) => `side-link side-link-preview${isActive ? ' active' : ''}`}><ShieldCheck size={18} strokeWidth={1.8} /><span>Admin preview</span><span className="tiny-tag">SAMPLE</span></NavLink>
  </>;
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const [fields, setFields] = useState<FarmField[]>([]);
  const [toast, setToast] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fieldsError, setFieldsError] = useState('');
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuPanelRef = useRef<HTMLDivElement>(null);

  const refreshFields = useCallback(async () => {
    try { const result = await api<{ fields: FarmField[] }>('/fields'); setFields(result.fields); setFieldsError(''); }
    catch (error) { setFieldsError(asErrorMessage(error)); }
  }, []);

  useEffect(() => { void refreshFields(); }, [refreshFields]);
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const panel = mobileMenuPanelRef.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), select') || []);
    focusable()[0]?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); setMobileMenuOpen(false); window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus()); return; }
      if (event.key !== 'Tab') return;
      const items = focusable(); const first = items[0]; const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 3200); return () => window.clearTimeout(timer); }, [toast]);

  const context: AppLayoutContext = { fields, refreshFields, setToast };
  const initials = (user?.name || 'Farmer').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return <div className="app-frame">
    <aside className="desktop-sidebar">
      <Link to="/app" className="side-brand" aria-label="AgriShield home"><Brand compact /></Link>
      <div className="sidebar-workspace"><div className="workspace-icon"><Flower2 size={17} /></div><div><span className="workspace-caption">WORKSPACE</span><strong>{t('nav.workspace')}</strong></div><ChevronDown size={15} className="muted-icon" /></div>
      <nav className="side-navigation" aria-label={t('nav.workspace')}><SidebarLinks /></nav>
      <div className="sidebar-bottom"><div className="data-status"><span className="status-dot" /><span>Prototype preview</span></div><div className="sidebar-footnote">Sample outlooks only.<br />No live model or weather feed.</div><NavLink to="/app/profile" className="profile-mini"><span className="avatar">{initials || 'F'}</span><span className="profile-mini-copy"><strong>{user?.name || 'Farmer'}</strong><small>{user?.role || 'farmer'} account</small></span><ChevronDown size={15} /></NavLink></div>
    </aside>

    <div className="mobile-app-header">
      <Link to="/app" aria-label="AgriShield home"><Brand compact /></Link>
      <div className="mobile-header-tools"><LanguageSelect /><ListenButton /><button ref={mobileMenuButtonRef} type="button" className="icon-button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? t('nav.close') : t('nav.menu')} aria-haspopup="dialog" aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation-dialog">{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
    </div>

    {mobileMenuOpen && <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
      <div ref={mobileMenuPanelRef} id="mobile-navigation-dialog" className="mobile-menu-panel" role="dialog" aria-modal="true" aria-label={t('nav.workspace')} onClick={(event) => event.stopPropagation()}>
        <div className="mobile-menu-heading"><span>{t('nav.workspace')}</span><button className="icon-button" onClick={() => setMobileMenuOpen(false)} aria-label={t('nav.close')}><X size={18} /></button></div>
        <div className="mobile-menu-settings"><EasyViewToggle /></div>
        <nav><SidebarLinks onChoose={() => setMobileMenuOpen(false)} /></nav>
        <button className="text-button mobile-logout" onClick={() => void logout()}>{t('nav.signout')}</button>
      </div>
    </div>}

    <main className="app-main">
      <div className="app-topbar"><div className="breadcrumbs"><span>AgriShield</span><span className="crumb-slash">/</span><strong>{titleForPath(location.pathname, t)}</strong></div><div className="topbar-actions"><span className="prototype-chip"><span className="tiny-dot" />Demo environment</span><AccessibilityTools includeEasyView /><NavLink to="/app/profile" className="avatar avatar-top" title={user?.name || 'Profile'}>{initials || 'F'}</NavLink></div></div>
      <div className="app-content">{fieldsError && <div className="inline-alert neutral"><span>{fieldsError}</span><button className="text-button" onClick={() => void refreshFields()}>{t('button.retry')}</button></div>}<Outlet context={context} /></div>
      <footer className="app-footer"><span>AgriShield AI</span><span>{t('lang.coverage')} · {t('lang.translationNote')}</span></footer>
    </main>

    <nav className="mobile-bottom-nav" aria-label={t('nav.workspace')}>
      {[{ to: '/app', label: 'nav.home' as const, icon: Activity, end: true }, { to: '/app/scan', label: 'nav.scan' as const, icon: ScanLine }, { to: '/app/fields', label: 'nav.fields' as const, icon: Sprout }, { to: '/app/alerts', label: 'nav.alerts' as const, icon: Bell }, { to: '/app/profile', label: 'nav.profile' as const, icon: UserRound }].map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}><Icon size={22} strokeWidth={1.8} /><span>{t(label)}</span></NavLink>)}
    </nav>
    {toast && <div className="toast" role="status"><span className="toast-check">✓</span>{toast}</div>}
  </div>;
}

function titleForPath(path: string, t: (key: MessageKey) => string): string {
  const titles: Record<string, MessageKey> = { '/app': 'nav.workspace', '/app/fields': 'nav.fields', '/app/onboarding': 'field.title', '/app/scan': 'nav.scan', '/app/risk': 'nav.risk', '/app/advisory': 'nav.advisory', '/app/alerts': 'nav.alerts', '/app/history': 'nav.history', '/app/profile': 'nav.profile' };
  if (path.startsWith('/app/diagnosis/')) return t('diagnosis.title');
  if (path.startsWith('/app/fields/')) return t('field.title');
  return titles[path] ? t(titles[path]) : 'Preview · English';
}
