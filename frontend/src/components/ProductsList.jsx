import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoTrash } from "react-icons/go";
import { FaStar } from "react-icons/fa6";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Hub", value: "hub" },
  { label: "Mid", value: "mid" },
  { label: "Featured", value: "featured" },
];
const SORTS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "A–Z", value: "az" },
  { label: "Z–A", value: "za" },
  { label: "Price: Low–High", value: "price-asc" },
  { label: "Price: High–Low", value: "price-desc" },
];

function ConfirmModal({ open, onConfirm, onCancel, productName }) {
  if (!open) return null;
  return (
    <motion.div
      className="absolute left-0 right-0 top-0 z-50 flex items-center justify-center"
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

const getId = (p) => p.id ?? p._id;

const ProductsList = () => {
  const {
    deleteProduct,
    toggleFeaturedProduct,
    products,
    updateProduct,
    setProducts,
    fetchAllProducts,
  } = useProductStore();
  const { profile } = useUserStore();

  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [optimisticLoading, setOptimisticLoading] = useState({});
  const [togglingStar, setTogglingStar] = useState({});

  const isAdmin = profile?.role === "admin";
  const safeProducts = Array.isArray(products) ? products : [];

  // UseMemo to avoid recalculating on every render
  const filteredSortedProducts = useMemo(() => {
    let filtered = safeProducts;
    if (filter === "featured") filtered = filtered.filter((p) => p.isFeatured);
    else if (filter) filtered = filtered.filter((p) => p.category === filter);

    if (search.trim())
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.trim().toLowerCase())
      );

    return [...filtered].sort((a, b) => {
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
  }, [safeProducts, filter, search, sort]);

  const startEdit = (product) => {
    setEditing(getId(product));
    setEditValues({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description || "",
    });
  };

  const handleSaveEdit = async (product) => {
    setSavingEdit(true);
    setOptimisticLoading((prev) => ({ ...prev, [getId(product)]: true }));
    const prevProducts = [...safeProducts];
    const idx = safeProducts.findIndex((p) => getId(p) === getId(product));
    const updated = {
      ...product,
      name: editValues.name,
      category: editValues.category,
      price: Number(editValues.price),
      description: editValues.description,
    };
    const optimistic = [...safeProducts];
    optimistic[idx] = updated;
    setProducts(optimistic);

    try {
      await updateProduct(getId(product), {
        name: editValues.name,
        category: editValues.category,
        price: Number(editValues.price),
        description: editValues.description,
      });
      setEditing(null);
      setTimeout(fetchAllProducts, 1300);
      toast.success("Product updated!");
    } catch (err) {
      toast.error("Could not update product.");
      setProducts(prevProducts);
    } finally {
      setSavingEdit(false);
      setOptimisticLoading((prev) => ({ ...prev, [getId(product)]: false }));
    }
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setEditValues({ name: "", category: "", price: "", description: "" });
  };

  const handleDelete = (id, name) => setConfirmDelete({ id, name });

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setOptimisticLoading((prev) => ({ ...prev, [confirmDelete.id]: true }));
    const prevProducts = [...safeProducts];
    setProducts(safeProducts.filter((p) => getId(p) !== confirmDelete.id));
    try {
      await deleteProduct(confirmDelete.id);
      setTimeout(fetchAllProducts, 1300);
    } catch {
      toast.error("Could not delete product.");
      setProducts(prevProducts);
    }
    setOptimisticLoading((prev) => ({ ...prev, [confirmDelete.id]: false }));
    setConfirmDelete(null);
  };

  const handleToggleFeatured = async (product) => {
    if (!isAdmin) return toast.error("Admin access required.");
    const prodId = getId(product);
    const newValue = !product.isFeatured;
    setTogglingStar((prev) => ({ ...prev, [prodId]: true }));

    setProducts((prev) =>
      prev.map((p) =>
        getId(p) === prodId ? { ...p, isFeatured: newValue } : p
      )
    );
    try {
      const ok = await toggleFeaturedProduct(prodId, newValue);
      if (!ok) throw new Error();
      await fetchAllProducts();
    } catch {
      setProducts((prev) =>
        prev.map((p) =>
          getId(p) === prodId ? { ...p, isFeatured: product.isFeatured } : p
        )
      );
    } finally {
      setTogglingStar((prev) => ({ ...prev, [prodId]: false }));
    }
  };

  return (
    <motion.div
      className="bg-emerald-800 shadow-lg rounded-lg p-4 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      tabIndex={0}
    >
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
      </div>
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-full border-2 bg-emerald-900 border-emerald-700 text-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
          aria-label="Search products"
          autoComplete="off"
        />
      </div>
      <div className="grid gap-6 grid-cols-1">
        <AnimatePresence>
          {filteredSortedProducts.length === 0 ? (
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
            filteredSortedProducts.map((product, i) => {
              const id = getId(product);
              const isEditing = editing === id;
              const loading = optimisticLoading[id];
              const isModalOpen = confirmDelete?.id === id;
              const starToggling = togglingStar[id];
              return (
                <motion.div
                  key={id}
                  className={`relative bg-emerald-900 rounded-xl shadow p-0 overflow-hidden ${
                    loading ? "opacity-70 pointer-events-none" : ""
                  }`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  layout={!isEditing}
                  whileHover={
                    !isEditing
                      ? {
                          scale: 1.02,
                          boxShadow: "0 8px 32px 0 rgba(16,185,129,0.25)",
                        }
                      : undefined
                  }
                  whileTap={!isEditing ? { scale: 0.98 } : undefined}
                />
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProductsList;
