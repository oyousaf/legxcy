import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import { supabase } from "../lib/supabase";
import { FiX, FiEdit2, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";

const fmt = (d) =>
  new Date(d).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ProfileModal({ open, onClose }) {
  const { user, profile, setProfile } = useUserStore();

  // Profile edit state
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);

  // Orders
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch profile info on open
  useEffect(() => {
    if (open && profile) {
      document.body.style.overflow = "hidden";
      setForm({ name: profile.name || "", email: profile.email || "" });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, profile]);

  // Fetch user orders when open
  useEffect(() => {
    if (!open || !user) return;
    const fetchOrders = async () => {
      setLoadingOrders(true);
      let { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("userId", user.id)
        .order("createdAt", { ascending: false });
      if (error) toast.error("Could not fetch orders");
      setOrders(data || []);
      setLoadingOrders(false);
    };
    fetchOrders();
  }, [open, user]);

  // Handlers
  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const { updateProfile } = useUserStore();

  const saveProfile = async () => {
    setSaving(true);
    if (form.email !== profile.email) {
      const { error: emailErr } = await supabase.auth.updateUser({
        email: form.email,
      });
      if (emailErr) {
        setSaving(false);
        return toast.error(emailErr.message || "Failed to update email");
      }
    }
    await updateProfile({ name: form.name, email: form.email });
    setSaving(false);
    setEdit(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="profile-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0.97, opacity: 0.7, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.97, opacity: 0.7, y: 40 }}
          transition={{ duration: 0.16 }}
          className="bg-[#003632] border border-emerald-700 rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 p-3 text-white bg-emerald-900 hover:bg-emerald-700 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Close profile modal"
            tabIndex={0}
          >
            <FiX size={28} />
          </button>

          <div className="mb-2 flex items-center gap-2">
            <div className="text-lg sm:text-xl font-bold text-emerald-200 flex-1">
              Your Profile
            </div>
          </div>

          {/* Profile Info and Edit */}
          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-emerald-300 text-sm font-semibold mb-1">
                Name
              </label>
              <div className="flex gap-2 items-center">
                <input
                  className="w-full rounded-lg bg-emerald-800 border border-emerald-700 p-2 text-white focus:ring-2 focus:ring-emerald-400"
                  disabled={!edit || saving}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
                {!edit ? (
                  <button
                    onClick={() => setEdit(true)}
                    className="p-2 rounded-full text-emerald-300 hover:text-white transition"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                ) : (
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="p-2 rounded-full text-emerald-300 hover:text-white transition"
                    title="Save"
                  >
                    <FiSave />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-emerald-300 text-sm font-semibold mb-1">
                Email
              </label>
              <input
                className="w-full rounded-lg bg-emerald-800 border border-emerald-700 p-2 text-white focus:ring-2 focus:ring-emerald-400"
                disabled={!edit || saving}
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* User's Orders */}
          <div className="mt-6">
            <div className="text-emerald-200 font-semibold mb-2">
              Your Orders
            </div>
            {loadingOrders ? (
              <div className="text-emerald-300">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-emerald-400">No past orders yet.</div>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-emerald-900 rounded-xl p-3 border border-emerald-800 text-white flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold text-emerald-300">
                        Order #{o.id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-emerald-200">
                        {fmt(o.createdAt)}
                      </div>
                    </div>
                    <div className="font-bold text-emerald-100">
                      £{Number(o.totalAmount).toFixed()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
