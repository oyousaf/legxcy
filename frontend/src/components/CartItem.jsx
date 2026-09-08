import { useState } from "react";
import PropTypes from "prop-types";
import { FaMinus, FaPlus } from "react-icons/fa";
import { GoTrash } from "react-icons/go";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";
import { motion } from "framer-motion";

const CartItem = ({ item }) => {
  const [showModal, setShowModal] = useState(false);
  const { removeFromCart, updateQuantity } = useCartStore();
  const { user } = useUserStore();
  const navigate = useNavigate();

  const requireAuth = (action) => {
    if (!user) {
      toast.error("Please log in to modify your cart.");
      navigate("/login");
      return;
    }
    action();
  };

  const handleRemoveClick = () => {
    requireAuth(() => setShowModal(true));
  };

  const handleConfirmRemove = () => {
    requireAuth(() => removeFromCart(item.id));
    setShowModal(false);
  };

  return (
    <motion.div
      className="relative rounded-lg border p-4 shadow-sm border-emerald-700 bg-emerald-800 md:p-6"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
      transition={{ duration: 0.45, ease: [0.4, 0.12, 0.3, 1] }}
      layout
    >
      <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
        <div className="shrink-0 md:order-1">
          <img
            className="h-20 md:h-32 rounded object-cover"
            src={item.image}
            alt={item.name}
            loading="lazy"
            width={128}
            height={128}
          />
        </div>
        <div
          className="flex items-center justify-between md:order-3 md:justify-end"
          aria-label="Choose quantity"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`Decrease quantity of ${item.name}`}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border
                border-emerald-600 bg-emerald-700 hover:bg-emerald-600 focus:outline-none focus:ring-2
                focus:ring-emerald-500"
              onClick={() =>
                requireAuth(() => updateQuantity(item.id, item.quantity - 1))
              }
            >
              <FaMinus className="text-gray-300" />
            </button>
            <p aria-live="polite">{item.quantity}</p>
            <button
              type="button"
              aria-label={`Increase quantity of ${item.name}`}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border
                border-emerald-600 bg-emerald-700 hover:bg-emerald-600 focus:outline-none
                focus:ring-2 focus:ring-emerald-500"
              onClick={() =>
                requireAuth(() => updateQuantity(item.id, item.quantity + 1))
              }
            >
              <FaPlus className="text-gray-300" />
            </button>
          </div>
          <div className="text-end md:order-4 md:w-32">
            <p className="text-base font-bold text-emerald-400">
              £{item.price}
            </p>
          </div>
        </div>
        <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
          <p className="text-base font-medium text-white">{item.name}</p>
          <p className="text-sm text-emerald-400">{item.description}</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label={`Remove ${item.name} from cart`}
              className="inline-flex items-center text-sm font-medium text-red-500
                hover:text-red-400 hover:underline"
              onClick={handleRemoveClick}
            >
              <GoTrash size={25} />
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmRemove}
        itemName={item.name}
      />
    </motion.div>
  );
};

CartItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
  }).isRequired,
};

export default CartItem;
