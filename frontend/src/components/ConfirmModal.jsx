import { motion, AnimatePresence } from "motion/react";
import PropTypes from "prop-types";

const ConfirmModal = ({ isOpen, onClose, onConfirm, itemName }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="rounded-xl bg-red-800 p-6 shadow-lg w-80"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <h2 className="text-lg text-white mb-2 text-center">
            Are you sure you want to remove{" "}
            <span className="font-bold">{itemName}</span> from your cart?
          </h2>
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
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  itemName: PropTypes.string,
};

export default ConfirmModal;
