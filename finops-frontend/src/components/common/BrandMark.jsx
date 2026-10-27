import { Landmark } from 'lucide-react';

export default function BrandMark({ light = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white"><Landmark className="h-5 w-5" aria-hidden="true" /></span>
      <span className={`text-lg font-semibold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>FinOps</span>
    </div>
  );
}
