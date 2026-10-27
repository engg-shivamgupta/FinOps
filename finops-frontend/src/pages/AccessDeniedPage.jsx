import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import EmptyState from '../components/common/EmptyState.jsx';

export default function AccessDeniedPage() {
  return (
    <div className="card">
      <EmptyState icon={ShieldAlert} title="Access denied (403)" message="Your role doesn't include access to this page. If you think that's a mistake, ask an administrator."
        action={<Link to="/dashboard" className="btn-primary">Back to dashboard</Link>} />
    </div>
  );
}
