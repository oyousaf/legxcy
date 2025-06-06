import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoTrash } from "react-icons/go";
import { FaStar } from "react-icons/fa6";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";

// Filters and sorts (add Featured to filters)
const FILTERS = [
  { label: "All", value: "" },
  { label: "Hub", value: "hub" },
  { label: "Featured", value: "featured" },
  { label: "Mid", value: "mid" },
];

const SORTS = [
  { label: "A–Z", value: "az" },
  { label: "Z–A", value: "za" },
  { label: "Price: Low–High", value: "price-asc" },
  { label: "Price: High–Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

function ConfirmModal({ open, onConfirm, onCancel, productName }) {
  if (!open) return null;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center text-center justify-center bg-black bg-opacity-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-red-900 rounded-lg p-6 shadow-lg max-w-sm w-full border border-emerald-700"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="text-white font-semibold text-lg mb-2">
          Delete product?
        </div>
        <div className="text-emerald-300 text-sm mb-6">
          Are you sure you want to delete{" "}
          <span className="font-bold">{productName}</span>? This action cannot
          be undone.
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-800 text-gray-200 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const ProductsList = () => {
  const { deleteProduct, toggleFeaturedProduct, products, updateProduct } =
    useProductStore();
  const { profile } = useUserStore();

  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("az");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({
    name: "",
    category: "",
    price: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const isAdmin = profile?.role === "admin";
  const getId = (product) => product.id ?? product._id;

  // Filter logic
  let filteredProducts = products;
  if (filter === "featured") {
    filteredProducts = products.filter((p) => p.isFeatured);
  } else if (filter) {
    filteredProducts = products.filter((p) => p.category === filter);
  }

  // Search logic (case-insensitive)
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filteredProducts = filteredProducts.filter((p) =>
      p.name?.toLowerCase().includes(q)
    );
  }

  // Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sort) {
      case "az":
        return a.name.localeCompare(b.name);
      case "za":
        return b.name.localeCompare(a.name);
      case "price-asc":
        return (a.price ?? 0) - (b.price ?? 0);
      case "price-desc":
        return (b.price ?? 0) - (a.price ?? 0);
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      default:
        return 0;
    }
  });

  // Edit and CRUD handlers
  const startEdit = (product) => {
    setEditing(getId(product));
    setEditValues({
      name: product.name,
      category: product.category,
      price: product.price,
    });
  };

  const handleSaveEdit = async (product) => {
    setSavingEdit(true);
    try {
      if (
        !editValues.name.trim() ||
        !editValues.category.trim() ||
        !editValues.price ||
        isNaN(Number(editValues.price))
      ) {
        toast.error("All fields are required and price must be a number.");
        setSavingEdit(false);
        return;
      }
      await updateProduct(getId(product), {
        name: editValues.name,
        category: editValues.category,
        price: Number(editValues.price),
      });
      toast.success("Product updated!");
      setEditing(null);
    } catch {
      toast.error("Could not update product.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setEditValues({ name: "", category: "", price: "" });
  };

  const handleDelete = (id, name) => setConfirmDelete({ id, name });
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteProduct(confirmDelete.id);
      toast.success("Product deleted!");
    } catch {
      toast.error("Could not delete product.");
    }
    setConfirmDelete(null);
  };

  return (
    <motion.div
      className="bg-emerald-800 shadow-lg rounded-lg p-4 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      tabIndex={0}
    >
      {/* Filters, Sort, and Search */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center items-center">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition ${
              filter === value
                ? "bg-emerald-600 border-emerald-400 text-white"
                : "bg-emerald-900 border-emerald-700 text-emerald-300 hover:bg-emerald-700"
            }`}
            aria-pressed={filter === value}
          >
            {label}
          </button>
        ))}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="ml-2 px-4 py-2 rounded-full border-2 bg-emerald-900 border-emerald-700 text-emerald-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition cursor-pointer"
          aria-label="Sort products"
        >
          {SORTS.map(({ label, value }) => (
            <option
              value={value}
              key={value}
              className="bg-emerald-900 text-emerald-300 cursor-pointer"
            >
              {label}
            </option>
          ))}
        </select>

        {/* Search bar */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="ml-2 px-4 py-2 rounded-full border-2 bg-emerald-900 border-emerald-700 text-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
        />
      </div>

      {/* Product Cards */}
      <div className="grid gap-6 grid-cols-1">
        <AnimatePresence>
          {sortedProducts.length === 0 ? (
            <motion.div
              className="col-span-full text-center py-8 text-gray-300 text-lg"
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No products found.
            </motion.div>
          ) : (
            sortedProducts.map((product, i) => {
              const isEditing = editing === getId(product);
              return (
                <motion.div
                  key={getId(product)}
                  className="relative bg-emerald-900 rounded-xl shadow p-0 overflow-hidden"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  layout
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 8px 32px 0 rgba(16,185,129,0.25)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Actions bar */}
                  <div
                    className="absolute flex justify-between items-center left-0 right-0 top-0 px-3 pt-3 z-10 pointer-events-none"
                    style={{ minHeight: "48px" }}
                  >
                    <div className="pointer-events-auto">
                      <button
                        onClick={() => {
                          if (!isAdmin) {
                            toast.error("Admin access required.");
                            return;
                          }
                          toggleFeaturedProduct(getId(product));
                        }}
                        className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors duration-200
                          ${
                            product.isFeatured
                              ? "bg-yellow-400 text-emerald-900"
                              : "bg-emerald-700 text-emerald-300"
                          } hover:bg-yellow-500`}
                        disabled={!isAdmin}
                        title={
                          isAdmin
                            ? "Toggle featured"
                            : "Only admins can change featured status"
                        }
                        aria-label="Toggle featured"
                      >
                        <FaStar className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="pointer-events-auto flex gap-1">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(product)}
                            className="p-2 text-emerald-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-full transition"
                            disabled={!isAdmin || savingEdit}
                            title="Save changes"
                            aria-label="Save"
                          >
                            <FiSave className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full transition"
                            disabled={savingEdit}
                            title="Cancel"
                            aria-label="Cancel"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              if (!isAdmin) {
                                toast.error("Admin access required.");
                                return;
                              }
                              startEdit(product);
                            }}
                            className="p-2 text-blue-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full transition"
                            disabled={!isAdmin}
                            title={
                              isAdmin ? "Edit product" : "Only admins can edit"
                            }
                            aria-label="Edit"
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              if (!isAdmin) {
                                toast.error("Admin access required.");
                                return;
                              }
                              handleDelete(getId(product), product.name);
                            }}
                            className="p-2 text-red-400 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-full transition"
                            disabled={!isAdmin}
                            title={
                              isAdmin
                                ? "Delete product"
                                : "Only admins can delete"
                            }
                            aria-label="Delete product"
                          >
                            <GoTrash className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-14 px-4 pb-6">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-24 h-24 rounded-xl object-cover border-2 border-emerald-800 shadow-md bg-gray-900"
                      loading="lazy"
                    />
                    <div className="flex-1 w-full mt-2 sm:mt-0">
                      {isEditing ? (
                        <form
                          className="space-y-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveEdit(product);
                          }}
                        >
                          <input
                            className="w-full bg-emerald-800 rounded p-2 text-white border border-emerald-700 mb-1"
                            value={editValues.name}
                            onChange={(e) =>
                              setEditValues((ev) => ({
                                ...ev,
                                name: e.target.value,
                              }))
                            }
                            disabled={savingEdit}
                            required
                            placeholder="Name"
                            autoComplete="off"
                          />
                          <select
                            className="w-full bg-emerald-800 rounded p-2 text-white border border-emerald-700 mb-1"
                            value={editValues.category}
                            onChange={(e) =>
                              setEditValues((ev) => ({
                                ...ev,
                                category: e.target.value,
                              }))
                            }
                            disabled={savingEdit}
                            required
                          >
                            <option value="">Select category</option>
                            <option value="hub">Hub-Drive</option>
                            <option value="mid">Mid-Drive</option>
                          </select>
                          <input
                            className="w-full bg-emerald-800 rounded p-2 text-white border border-emerald-700"
                            type="number"
                            step="0.01"
                            min="0"
                            value={editValues.price}
                            onChange={(e) =>
                              setEditValues((ev) => ({
                                ...ev,
                                price: e.target.value,
                              }))
                            }
                            disabled={savingEdit}
                            required
                            placeholder="Price"
                            autoComplete="off"
                          />
                        </form>
                      ) : (
                        <>
                          <div className="text-xl font-semibold text-white mb-1">
                            {product.name}
                          </div>
                          <div className="text-emerald-300 text-base mb-2 capitalize">
                            {product.category}
                          </div>
                          <div className="text-emerald-200 font-bold text-lg mb-1">
                            £{Number(product.price).toFixed(0)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        <ConfirmModal
          open={!!confirmDelete}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleConfirmDelete}
          productName={confirmDelete?.name}
        />
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductsList;
