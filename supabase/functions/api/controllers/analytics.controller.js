import { supabase } from "../lib/supabase.js";

export const getAnalyticsData = async (req, res) => {
  try {
    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    if (usersError) throw usersError;

    const { count: totalProducts, error: prodError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });
    if (prodError) throw prodError;

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("totalAmount");
    if (ordersError) throw ordersError;

    const totalSales = orders.length;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0
    );

    res.json({
      users: totalUsers,
      products: totalProducts,
      totalSales,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getDailySalesData = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    const startISO =
      typeof startDate === "string"
        ? startDate
        : new Date(startDate).toISOString();
    const endISO =
      typeof endDate === "string" ? endDate : new Date(endDate).toISOString();

    const { data: orders, error } = await supabase
      .from("orders")
      .select("createdAt, totalAmount")
      .gte("createdAt", startISO)
      .lte("createdAt", endISO);

    if (error) throw error;

    const map = {};
    orders.forEach((order) => {
      const date = order.createdAt.split("T")[0];
      if (!map[date]) map[date] = { sales: 0, revenue: 0 };
      map[date].sales += 1;
      map[date].revenue += order.totalAmount || 0;
    });

    const dateArray = getDatesInRange(new Date(startISO), new Date(endISO));
    const result = dateArray.map((date) => ({
      date,
      sales: map[date]?.sales || 0,
      revenue: map[date]?.revenue || 0,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  endDate = new Date(endDate);
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}
