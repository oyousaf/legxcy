const ConfirmModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="rounded-xl bg-gray-800 p-6 shadow-lg w-80">
        <h2 className="text-lg font-semibold text-white mb-2">
          Remove item from cart?
        </h2>
        <p className="text-gray-300 mb-6">
          Are you sure you want to remove <span className="font-bold">{itemName}</span> from your cart?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 bg-gray-600 text-white hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-lg px-4 py-2 bg-red-600 text-white hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
