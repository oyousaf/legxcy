import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaCartShopping } from "react-icons/fa6";
import { FaUsers, FaPoundSign } from "react-icons/fa";
import { FiPackage } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
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
  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dailySalesData, setDailySalesData] = useState([]);

  // Only admins can see analytics
  if (!user || profile?.role !== "admin") {
    return (
      <div className="text-center p-4 text-red-600 font-bold">
        Admin access only.
      </div>
    );
  }

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Total users
        const { count: users } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Total products
        const { count: products } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });

        // Orders table must have total amount and created_at
        const { data: orders, error } = await supabase
          .from("orders")
          .select("totalAmount,created_at");

        // Total sales (number of orders)
        const totalSales = orders ? orders.length : 0;
        // Total revenue (sum)
        const totalRevenue = orders
          ? orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
          : 0;

        // Generate daily sales/revenue for chart
        const dailyMap = {};
        if (orders) {
          orders.forEach((o) => {
            const day = o.created_at?.split("T")[0];
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

        setAnalyticsData({
          users: users ?? 0,
          products: products ?? 0,
          totalSales,
          totalRevenue,
        });
        setDailySalesData(dailySalesData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Users"
          value={analyticsData.users.toLocaleString()}
          icon={FaUsers}
          color="from-emerald-500 to-teal-700"
        />
        <AnalyticsCard
          title="Total Products"
          value={analyticsData.products.toLocaleString()}
          icon={FiPackage}
          color="from-emerald-500 to-green-700"
        />
        <AnalyticsCard
          title="Total Sales"
          value={analyticsData.totalSales.toLocaleString()}
          icon={FaCartShopping}
          color="from-emerald-500 to-cyan-700"
        />
        <AnalyticsCard
          title="Total Revenue"
          value={`£${analyticsData.totalRevenue.toLocaleString()}`}
          icon={FaPoundSign}
          color="from-emerald-500 to-lime-700"
        />
      </div>
      <motion.div
        className="bg-gray-800/60 rounded-lg p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dailySalesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#D1D5DB" />
            <YAxis yAxisId="left" stroke="#D1D5DB" />
            <YAxis yAxisId="right" orientation="right" stroke="#D1D5DB" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              stroke="#10B981"
              activeDot={{ r: 8 }}
              name="Sales"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              activeDot={{ r: 8 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};
export default AnalyticsTab;

// Card component unchanged
const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative ${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex justify-between items-center">
      <div className="z-10">
        <p className="text-emerald-300 text-sm mb-1 font-semibold">{title}</p>
        <h3 className="text-white text-3xl font-bold">{value}</h3>
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-30" />
    <div className="absolute -bottom-4 -right-4 text-emerald-800 opacity-50">
      <Icon className="h-32 w-32" />
    </div>
  </motion.div>
);
