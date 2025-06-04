import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const skeletons = Array(3).fill(0);

const PeopleAlsoBought = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("popularity", { ascending: false })
          .limit(3);

        if (error) throw error;
        setRecommendations(data || []);
      } catch (error) {
        toast.error(
          error.message || "An error occurred while fetching recommendations"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold text-emerald-400">
        People also viewed
      </h3>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? skeletons.map((_, idx) => (
              <div
                key={idx}
                className="rounded-lg h-64 bg-gray-800 animate-pulse border border-gray-700"
              />
            ))
          : recommendations.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
      </div>
    </div>
  );
};
export default PeopleAlsoBought;
