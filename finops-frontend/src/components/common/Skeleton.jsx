export default function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-slate-200/70 motion-reduce:animate-none ${className}`} />;
}
