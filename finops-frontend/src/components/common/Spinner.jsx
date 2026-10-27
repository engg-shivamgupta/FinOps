import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Loading', className = 'h-4 w-4' }) {
  return <Loader2 role="status" aria-label={label} className={`animate-spin motion-reduce:animate-none ${className}`} />;
}
