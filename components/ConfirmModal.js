export default function ConfirmModal({
    open,
    title = "Delete item?",
    message = "This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
    onCancel,
    onConfirm
}) {
    if (!open) return null;

    return (
        <div className="modal-backdrop" role="presentation" onClick={onCancel}>
            <div
                className="modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-copy"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-title" id="confirm-title">{title}</div>
                <div className="modal-copy" id="confirm-copy">{message}</div>
                <div className="modal-actions">
                    <button className="btn ghost" type="button" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className="btn danger" type="button" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
