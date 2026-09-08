import toast from "react-hot-toast";
import PropTypes from "prop-types";
import { FaCartShopping } from "react-icons/fa6";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const ProductCard = ({ product }) => {
  const { user } = useUserStore();
  const { addToCart } = useCartStore();

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please log in to add products to your cart", {
        id: "login",
      });
      return;
    }
    addToCart(product);
  };

  return (
    <div className="flex w-full flex-col items-center overflow-hidden rounded-lg border border-emerald-700 shadow-lg bg-emerald-900">
      <div className="relative mt-4 flex h-56 w-11/12 overflow-hidden rounded-xl">
        <img
          className="object-cover w-full h-full"
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={320}
          height={224}
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>

      <div className="flex flex-col items-center mt-4 px-6 pb-6 w-full">
        <h5 className="text-xl font-semibold text-gray-200 text-center">
          {product.name}
        </h5>
        {product.description && (
          <p className="mt-2 mb-3 text-sm text-emerald-300 text-center min-h-[44px]">
            {product.description}
          </p>
        )}
        <span className="mb-4 text-3xl font-bold text-emerald-400 text-center">
          £{product.price}
        </span>
        <button
          type="button"
          className="flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          onClick={handleAddToCart}
        >
          <FaCartShopping size={22} className="mr-2" />
          Add to cart
        </button>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    image: PropTypes.string,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

export default ProductCard;
