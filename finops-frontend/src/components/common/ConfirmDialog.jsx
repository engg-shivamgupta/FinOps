import Modal from './Modal.jsx';
import Spinner from './Spinner.jsx';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', destructive = false, busy = false, onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={busy ? undefined : onCancel} size="sm" dismissible={!busy}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy} data-autofocus>Cancel</button>
        <button type="button" className={destructive ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={busy}>
          {busy && <Spinner />} {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
