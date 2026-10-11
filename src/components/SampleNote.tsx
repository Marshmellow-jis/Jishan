import { ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

export default function SampleNote({ children }: { children: ReactNode }) {
  return <div className="sample-disclosure"><ShieldCheck size={15} /><span>{children}</span></div>;
}
