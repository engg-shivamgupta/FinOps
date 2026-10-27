// Values mirror CategoryEnum / RecordType / RoleEnum in the backend models.
export const CATEGORIES = [
  'salary', 'freelance', 'investment', 'rent', 'utilities', 'groceries', 'transport',
  'entertainment', 'healthcare', 'education', 'shopping', 'food_dining', 'insurance', 'taxes', 'other',
];
export const RECORD_TYPES = ['income', 'expense'];
export const ROLES = ['admin', 'analyst', 'viewer'];

const OVERRIDES = { food_dining: 'Food & Dining' };

export function categoryLabel(value) {
  if (!value) return '—';
  if (OVERRIDES[value]) return OVERRIDES[value];
  return String(value)
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const typeLabel = (t) => (t === 'income' ? 'Income' : t === 'expense' ? 'Expense' : t || '—');
export const roleLabel = (r) => (r ? r.charAt(0).toUpperCase() + r.slice(1) : '—');

export const PERMISSION_LABELS = {
  can_view_records: 'View financial records',
  can_create_record: 'Create records',
  can_update_record: 'Edit records',
  can_delete_record: 'Delete records',
  can_view_dashboard: 'View dashboard',
  can_view_insights: 'View insights',
  can_manage_users: 'Manage users',
};
