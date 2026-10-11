import { useEffect, useState } from 'react';
import { Languages, Volume2, VolumeX, Eye } from 'lucide-react';
import { languages, useI18n, type LanguageCode } from '../i18n/I18nProvider';

export function LanguageSelect() {
  const { language, setLanguage, t } = useI18n();
  return <label className="language-control">
    <Languages size={17} aria-hidden="true" />
    <span className="sr-only">{t('lang.label')}</span>
    <select aria-label={t('lang.label')} value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>
      {languages.map((item) => <option key={item.code} value={item.code}>{item.nativeName}</option>)}
    </select>
  </label>;
}

export function ListenButton() {
  const { locale, language, t } = useI18n();
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sync = () => setSpeaking(Boolean(window.speechSynthesis?.speaking));
    window.speechSynthesis?.addEventListener?.('voiceschanged', sync);
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', sync);
  }, []);

  function stop() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setMessage('');
  }

  function listen() {
    if (!('speechSynthesis' in window)) {
      setMessage(t('voice.unavailable'));
      return;
    }
    if (speaking) { stop(); return; }
    const langPrefix = language.toLowerCase();
    const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().replace('_', '-').startsWith(langPrefix));
    if (!voice) {
      setMessage(t('voice.unavailable'));
      return;
    }
    const main = document.querySelector('main');
    if (!main) { setMessage(t('voice.unavailable')); return; }
    const copy = main.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('button, input, select, textarea, nav, footer, [aria-hidden="true"], .accessibility-toolbar').forEach((node) => node.remove());
    const text = (copy.innerText || copy.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 4500);
    if (!text) { setMessage(t('voice.unavailable')); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.voice = voice;
    utterance.rate = 0.86;
    utterance.pitch = 1;
    utterance.onstart = () => { setSpeaking(true); setMessage(t('voice.ready')); };
    utterance.onend = () => { setSpeaking(false); setMessage(''); };
    utterance.onerror = () => { setSpeaking(false); setMessage(t('voice.unavailable')); };
    window.speechSynthesis.speak(utterance);
  }

  return <span className="listen-control">
    <button type="button" className={`access-icon-button listen-button${speaking ? ' active' : ''}`} onClick={listen} aria-label={speaking ? t('voice.stop') : t('voice.listen')} aria-pressed={speaking} title={speaking ? t('voice.stop') : t('voice.listen')}>
      {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}<span className="listen-label">{speaking ? t('voice.stop') : t('voice.listen')}</span>
    </button>
    {message && <span className="voice-status" role="status" aria-live="polite">{message}</span>}
  </span>;
}

export function EasyViewToggle() {
  const { easyView, toggleEasyView, t } = useI18n();
  return <button type="button" className={`easy-view-button${easyView ? ' active' : ''}`} onClick={toggleEasyView} aria-pressed={easyView}>
    <Eye size={17} /><span>{t('simple.label')}</span><span className="easy-view-state">{easyView ? t('simple.on') : t('simple.off')}</span>
  </button>;
}

export default function AccessibilityTools({ includeEasyView = false }: { includeEasyView?: boolean }) {
  return <div className="accessibility-toolbar"><LanguageSelect /><ListenButton />{includeEasyView && <EasyViewToggle />}</div>;
}
