import { Link } from 'react-router-dom';

export function BrandMark({ className = '' }: { className?: string }) {
  return <svg className={`brand-mark ${className}`} viewBox="0 0 128 128" aria-hidden="true" focusable="false">
    <rect width="128" height="128" rx="34" fill="currentColor" />
    <path d="M64 18 99 31v30c0 24-14.8 39.9-35 49C43.8 100.9 29 85 29 61V31l35-13Z" fill="#f8f7ef" />
    <path d="M64 91V53" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="6" />
    <path d="M62 60c-15.2-.2-23.2-7.4-23.5-20.7 14.8.2 22.7 7.4 23.5 20.7Z" fill="#6c9b5a" />
    <path d="M66 50c.4-14.3 8.3-22.1 23.6-23.3-.5 14.7-8.4 22.5-23.6 23.3Z" fill="currentColor" />
    <path d="M48 78c4.8 2.9 10.1 4.4 16 4.4s11.2-1.5 16-4.4" fill="none" stroke="#e3ad52" strokeLinecap="round" strokeWidth="4" />
  </svg>;
}

export default function Brand({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return <span className={`brand-lockup${compact ? ' compact' : ''}${light ? ' light' : ''}`}>
    <BrandMark />
    <span className="brand-name"><strong>AgriShield</strong><small>AI</small></span>
  </span>;
}
