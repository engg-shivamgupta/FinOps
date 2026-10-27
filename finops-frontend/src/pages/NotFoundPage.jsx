import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="card">
      <EmptyState icon={Compass} title="Page not found" message="That address doesn't match any page in FinOps."
        action={<Link to="/dashboard" className="btn-primary">Go to dashboard</Link>} />
    </div>
  );
}
