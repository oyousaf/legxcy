import { useState } from "react";
import { motion } from "framer-motion";
import { FaPlusCircle } from "react-icons/fa";
import { IoMdCloudUpload } from "react-icons/io";
import { LuLoader } from "react-icons/lu";
import { toast } from "react-hot-toast";
import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";

const categories = ["hub", "mid"];

const CreateProductForm = () => {
  const { user, profile } = useUserStore();
  const { createProduct, loading } = useProductStore();

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  if (!user || profile?.role !== "admin") {
    return (
      <div className="text-center p-4 text-red-600 font-bold">
        Admin access only.
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct((prev) => ({ ...prev, image: reader.result }));
        toast.success("Image uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !newProduct.name.trim() ||
      !newProduct.description.trim() ||
      !newProduct.price ||
      !newProduct.category ||
      !newProduct.image
    ) {
      toast.error("All fields are required.");
      return;
    }
    try {
      await createProduct(newProduct);
      toast.success("Product created!");
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
      });
    } catch (err) {
      toast.error("Error creating a product.");
    }
  };

  return (
    <motion.div
      className="bg-emerald-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-gray-300">
        Create New Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div>
          <label
            htmlFor="product-name"
            className="block text-sm font-medium text-gray-300"
          >
            Product Name
          </label>
          <input
            type="text"
            id="product-name"
            name="name"
            value={newProduct.name}
            onChange={handleChange}
            autoComplete="off"
            className="mt-1 block w-full bg-emerald-700 border border-emerald-600 rounded-md shadow-sm py-2
            px-3 text-white focus:outline-none focus:ring-2
            focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="product-description"
            className="block text-sm font-medium text-gray-300"
          >
            Description
          </label>
          <textarea
            id="product-description"
            name="description"
            value={newProduct.description}
            onChange={handleChange}
            rows="3"
            autoComplete="off"
            className="mt-1 block w-full bg-emerald-700 border border-emerald-600 rounded-md shadow-sm
            py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 
            focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="product-price"
            className="block text-sm font-medium text-gray-300"
          >
            Price
          </label>
          <input
            type="number"
            id="product-price"
            name="price"
            value={newProduct.price}
            onChange={handleChange}
            step="1"
            min="0"
            autoComplete="off"
            className="mt-1 block w-full bg-emerald-700 border border-emerald-600 rounded-md shadow-sm 
            py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
            focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="product-category"
            className="block text-sm font-medium text-gray-300"
          >
            Category
          </label>
          <select
            id="product-category"
            name="category"
            value={newProduct.category}
            onChange={handleChange}
            autoComplete="off"
            className="mt-1 block w-full bg-emerald-700 border border-emerald-600 rounded-md
            shadow-sm py-2 px-3 text-white focus:outline-none 
            focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-1 flex items-center">
          <input
            type="file"
            id="product-image"
            name="image"
            accept="image/*"
            className="sr-only"
            onChange={handleImageChange}
            autoComplete="off"
          />
          <label
            htmlFor="product-image"
            className="cursor-pointer bg-emerald-700 py-2 px-3 border border-emerald-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-300 hover:text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <IoMdCloudUpload className="h-5 w-5 inline-block mr-2" />
            Upload image
          </label>
          {newProduct.image && (
            <span className="ml-3 text-sm text-emerald-400">
              Image uploaded!
            </span>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
          shadow-sm text-sm font-medium text-gray-300 hover:text-white bg-emerald-600 hover:bg-emerald-700 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <>
              <LuLoader
                className="mr-2 h-5 w-5 animate-spin"
                aria-hidden="true"
              />
              Loading...
            </>
          ) : (
            <>
              <FaPlusCircle className="mr-2 h-5 w-5" />
              Create Product
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateProductForm;
