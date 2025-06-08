import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaCartShopping } from "react-icons/fa6";
import { FaUsers, FaPoundSign } from "react-icons/fa";
import { FiPackage } from "react-icons/fi";
import {
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../lib/supabase";
import LoadingSpinner from "./LoadingSpinner";
import { useUserStore } from "../stores/useUserStore";

const AnalyticsTab = () => {
  const { user, profile } = useUserStore();
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [error, setError] = useState("");

  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [dailySalesData, setDailySalesData] = useState([]);

  // Only admins can see analytics
  if (!user || profile?.role !== "admin") {
    return (
      <div className="text-center p-4 text-emerald-500 font-bold bg-emerald-900 rounded-xl shadow-lg mt-10">
        Admin access only.
      </div>
    );
  }

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setError("");
      try {
        // Total users
        const { count: users, error: userErr } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
        if (userErr) throw userErr;

        // Total products
        const { count: products, error: prodErr } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });
        if (prodErr) throw prodErr;

        // Orders for total sales and revenue
        const { data: orders, error: ordersErr } = await supabase
          .from("orders")
          .select("totalAmount");
        if (ordersErr) throw ordersErr;

        const totalSales = orders ? orders.length : 0;
        const totalRevenue = orders
          ? orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
          : 0;

        setAnalyticsData({
          users: users ?? 0,
          products: products ?? 0,
          totalSales,
          totalRevenue,
        });
      } catch (error) {
        setError("Failed to load stats. Please check your database and API keys.");
        setAnalyticsData({
          users: 0,
          products: 0,
          totalSales: 0,
          totalRevenue: 0,
        });
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchChart = async () => {
      setLoadingChart(true);
      setError("");
      try {
        const { data: orders, error: ordersErr } = await supabase
          .from("orders")
          .select("totalAmount,createdAt");
        if (ordersErr) throw ordersErr;

        const dailyMap = {};
        if (orders) {
          orders.forEach((o) => {
            const day = o.createdAt?.split("T")[0];
            if (!day) return;
            if (!dailyMap[day]) {
              dailyMap[day] = { name: day, sales: 0, revenue: 0 };
            }
            dailyMap[day].sales += 1;
            dailyMap[day].revenue += o.totalAmount || 0;
          });
        }
        const dailySalesData = Object.values(dailyMap).sort(
          (a, b) => new Date(a.name) - new Date(b.name)
        );
        setDailySalesData(dailySalesData);
      } catch (error) {
        setError("Failed to load chart. Please check your database and API keys.");
        setDailySalesData([]);
      } finally {
        setLoadingChart(false);
      }
    };

    fetchStats();
    fetchChart();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-300 rounded-lg text-center font-bold">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Users"
          value={loadingStats ? "..." : analyticsData.users.toLocaleString()}
          icon={FaUsers}
          color="from-emerald-600 to-emerald-800"
        />
        <AnalyticsCard
          title="Total Products"
          value={loadingStats ? "..." : analyticsData.products.toLocaleString()}
          icon={FiPackage}
          color="from-emerald-500 to-emerald-700"
        />
        <AnalyticsCard
          title="Total Sales"
          value={loadingStats ? "..." : analyticsData.totalSales.toLocaleString()}
          icon={FaCartShopping}
          color="from-emerald-500 to-teal-700"
        />
        <AnalyticsCard
          title="Total Revenue"
          value={loadingStats ? "..." : `£${analyticsData.totalRevenue.toLocaleString()}`}
          icon={FaPoundSign}
          color="from-emerald-500 to-lime-600"
        />
      </div>

      {/* Chart */}
      <motion.div
        className="bg-emerald-900/80 rounded-xl p-6 shadow-xl min-h-[420px] border border-emerald-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        {loadingChart ? (
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner />
          </div>
        ) : dailySalesData.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-emerald-200 text-lg">
            No sales data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" />
              {/* X/Y axes removed per your request */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "#064e3b",
                  borderRadius: "0.75rem",
                  border: "none",
                  color: "#d1fae5",
                  fontWeight: 600,
                }}
                labelStyle={{ color: "#6ee7b7" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#34d399"
                strokeWidth={3}
                activeDot={{ r: 8 }}
                name="Sales"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#a3e635"
                strokeWidth={3}
                activeDot={{ r: 8 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
};
export default AnalyticsTab;

// Emerald Card Component
const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    className={`relative bg-gradient-to-br ${color} rounded-xl p-6 shadow-xl overflow-hidden border border-emerald-800`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex justify-between items-center z-10 relative">
      <div>
        <p className="text-emerald-100 text-sm mb-1 font-semibold">{title}</p>
        <h3 className="text-white text-3xl font-bold">{value}</h3>
      </div>
    </div>
    <div className="absolute inset-0 bg-emerald-900 opacity-10 pointer-events-none" />
    <div className="absolute -bottom-4 -right-4 text-emerald-200 opacity-30">
      <Icon className="h-32 w-32" />
    </div>
  </motion.div>
);
