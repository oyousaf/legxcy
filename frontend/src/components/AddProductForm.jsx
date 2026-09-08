import { useState } from "react";
import { motion } from "framer-motion";
import { FaPlusCircle } from "react-icons/fa";
import { IoMdCloudUpload } from "react-icons/io";
import { LuLoader } from "react-icons/lu";
import { toast } from "react-hot-toast";
import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";

const categories = ["hub", "mid"];

const AddProductForm = () => {
  const { user, profile } = useUserStore();
  const { addProduct, loading } = useProductStore();

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct((prev) => ({ ...prev, image: reader.result }));
        toast.success("Image selected!");
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
      await addProduct(newProduct);
      toast.success("Product added!");
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
      });
    } catch {
      toast.error("Error creating a product.");
    }
  };

  if (!user || profile?.role !== "admin") {
    return (
      <div className="text-center p-4 text-red-600 font-bold">
        Admin access only.
      </div>
    );
  }

  return (
    <motion.div
      className="bg-emerald-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div>
          <input
            type="text"
            id="product-name"
            name="name"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={handleChange}
            autoComplete="off"
            className="mt-1 block w-full bg-emerald-700 border border-emerald-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
            disabled={loading}
          />
        </div>

        <div>
          <textarea
            id="product-description"
            name="description"
            placeholder="Description"
            value={newProduct.description}
            onChange={handleChange}
            rows="3"
            autoComplete="off"
            className="mt-1 block w-full bg-emerald-700 border border-emerald-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
            disabled={loading}
          />
        </div>

        <div>
          <input
            type="number"
            id="product-price"
            name="price"
            placeholder="Price"
            value={newProduct.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            autoComplete="off"
            className="mt-1 block w-full bg-emerald-700 border border-emerald-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
            disabled={loading}
          />
        </div>

        <div>
          <select
            id="product-category"
            name="category"
            placeholder="Category"
            value={newProduct.category}
            onChange={handleChange}
            autoComplete="off"
            className="mt-1 block w-full bg-emerald-700 border border-emerald-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
            disabled={loading}
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
            disabled={loading}
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
              Image selected!
            </span>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-300 hover:text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
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
              Add Product
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default AddProductForm;
