import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoTrash } from "react-icons/go";
import { FaStar } from "react-icons/fa6";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";
import { useUIStore } from "../stores/useUIStore";
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
  const isAdmin = profile?.role === "admin";

  // GLOBAL PERSISTENT UI STATE
  const { filter, sort, search, setFilter, setSort, setSearch } = useUIStore();

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editing, setEditing] = useState(null);
  const [optimisticLoading, setOptimisticLoading] = useState({});
  const [togglingStar, setTogglingStar] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [editValues, setEditValues] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
  });

  const safeProducts = Array.isArray(products) ? products : [];

  // GLOBAL SORT + FILTER + SEARCH APPLIED HERE
  const filteredSortedProducts = useMemo(() => {
    let arr = safeProducts;

    if (filter === "featured") {
      arr = arr
        .filter((p) => p.isFeatured)
        .sort((a, b) => (b.featuredAt ?? 0) - (a.featuredAt ?? 0));
    } else if (filter) {
      arr = arr.filter((p) => p.category === filter);
    }

    if (search.trim()) {
      arr = arr.filter((p) =>
        p.name.toLowerCase().includes(search.trim().toLowerCase())
      );
    }

    return [...arr].sort((a, b) => {
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
  }, [safeProducts, filter, sort, search]);

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
    const id = getId(product);

    setOptimisticLoading((prev) => ({ ...prev, [id]: true }));
    const prevState = [...safeProducts];

    const idx = prevState.findIndex((p) => getId(p) === id);

    const updated = {
      ...product,
      name: editValues.name,
      category: editValues.category,
      price: Number(editValues.price),
      description: editValues.description,
    };

    const optimistic = [...prevState];
    optimistic[idx] = updated;
    setProducts(optimistic);

    try {
      await updateProduct(id, updated);
      setEditing(null);
      setTimeout(fetchAllProducts, 1400);
      toast.success("Product updated!");
    } catch {
      setProducts(prevState);
      toast.error("Could not update product.");
    } finally {
      setSavingEdit(false);
      setOptimisticLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleToggleFeatured = async (product) => {
    if (!isAdmin) return toast.error("Admin access required.");

    const id = getId(product);
    const newVal = !product.isFeatured;

    setTogglingStar((prev) => ({ ...prev, [id]: true }));

    // optimistic + featuredAt timestamp
    setProducts((prev) =>
      prev.map((p) =>
        getId(p) === id
          ? {
              ...p,
              isFeatured: newVal,
              featuredAt: newVal ? Date.now() : p.featuredAt,
            }
          : p
      )
    );

    try {
      const ok = await toggleFeaturedProduct(id, newVal);
      if (!ok) throw new Error();
      await fetchAllProducts();
    } catch {
      // roll back
      setProducts((prev) =>
        prev.map((p) =>
          getId(p) === id
            ? { ...p, isFeatured: product.isFeatured }
            : p
        )
      );
    } finally {
      setTogglingStar((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete.id;

    setOptimisticLoading((prev) => ({ ...prev, [id]: true }));
    const prev = [...safeProducts];

    setProducts(prev.filter((p) => getId(p) !== id));

    try {
      await deleteProduct(id);
      setTimeout(fetchAllProducts, 1400);
    } catch {
      setProducts(prev);
      toast.error("Could not delete product.");
    }

    setOptimisticLoading((prev) => ({ ...prev, [id]: false }));
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
      {/* FILTERS / SORT / SEARCH */}
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
          >
            {label}
          </button>
        ))}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="ml-2 px-4 py-2 rounded-full border-2 bg-emerald-900 border-emerald-700 text-emerald-300 text-sm"
        >
          {SORTS.map(({ label, value }) => (
            <option
              value={value}
              key={value}
              className="bg-emerald-900 text-emerald-300"
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
          className="w-full max-w-md px-4 py-2 rounded-full border-2 bg-emerald-900 border-emerald-700 text-emerald-200 text-sm"
        />
      </div>

      {/* PRODUCT GRID */}
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
              const loading = optimisticLoading[id];
              const isEditing = editing === id;
              const starToggling = togglingStar[id];
              const isModalOpen = confirmDelete?.id === id;

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
                >
                  {/* TOP BUTTONS */}
                  <div
                    className="absolute flex justify-between items-center left-0 right-0 top-0 px-3 pt-3 z-10 pointer-events-none"
                    style={{ minHeight: "48px" }}
                  >
                    <div className="pointer-events-auto">
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        className={`p-2 rounded-full transition-colors duration-200 ${
                          product.isFeatured
                            ? "bg-yellow-400 text-emerald-900"
                            : "bg-emerald-700 text-emerald-300"
                        } hover:bg-yellow-500`}
                        disabled={!isAdmin || loading || starToggling}
                      >
                        {starToggling ? (
                          <span className="w-5 h-5 block animate-spin rounded-full border-t-2 border-b-2 border-emerald-800" />
                        ) : (
                          <FaStar className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div className="pointer-events-auto flex gap-1">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(product)}
                            className="p-2 text-emerald-400 hover:text-white"
                          >
                            <FiSave className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditing(null);
                              setEditValues({
                                name: "",
                                category: "",
                                price: "",
                                description: "",
                              });
                            }}
                            className="p-2 text-gray-400 hover:text-white"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              if (!isAdmin)
                                return toast.error("Admin access required.");
                              startEdit(product);
                            }}
                            className="p-2 text-blue-400 hover:text-white"
                            disabled={!isAdmin}
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => {
                              if (!isAdmin)
                                return toast.error("Admin access required.");
                              setConfirmDelete({
                                id,
                                name: product.name,
                              });
                            }}
                            className="p-2 text-red-400 hover:text-red-300"
                            disabled={!isAdmin}
                          >
                            <GoTrash className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* MAIN CONTENT */}
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
                            name="name"
                            className="w-full bg-emerald-800 rounded p-2 text-white border border-emerald-700"
                            value={editValues.name}
                            onChange={(e) =>
                              setEditValues((ev) => ({
                                ...ev,
                                name: e.target.value,
                              }))
                            }
                          />

                          <select
                            className="w-full bg-emerald-800 rounded p-2 text-white border border-emerald-700"
                            value={editValues.category}
                            onChange={(e) =>
                              setEditValues((ev) => ({
                                ...ev,
                                category: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select category</option>
                            <option value="hub">Hub-Drive</option>
                            <option value="mid">Mid-Drive</option>
                          </select>

                          <input
                            type="number"
                            className="w-full bg-emerald-800 rounded p-2 text-white border border-emerald-700"
                            value={editValues.price}
                            onChange={(e) =>
                              setEditValues((ev) => ({
                                ...ev,
                                price: e.target.value,
                              }))
                            }
                          />

                          <textarea
                            className="w-full bg-emerald-800 rounded p-2 text-white border border-emerald-700 min-h-[60px]"
                            value={editValues.description}
                            onChange={(e) =>
                              setEditValues((ev) => ({
                                ...ev,
                                description: e.target.value,
                              }))
                            }
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
                            £{Number(product.price).toFixed()}
                          </div>

                          <div className="text-white text-sm whitespace-pre-line">
                            {product.description}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {loading && (
                    <div className="absolute inset-0 bg-emerald-950/80 flex items-center justify-center z-20">
                      <div className="loader animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-400"></div>
                    </div>
                  )}

                  <AnimatePresence>
                    {isModalOpen && (
                      <ConfirmModal
                        open={true}
                        onCancel={() => setConfirmDelete(null)}
                        onConfirm={handleConfirmDelete}
                        productName={confirmDelete?.name}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProductsList;
