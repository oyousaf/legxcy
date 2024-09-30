import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";

const categories = [
  { href: "/hub", name: "Hub-Drive Motor", imageUrl: "/hub.webp" },
  { href: "/mid", name: "Mid-Drive Motor", imageUrl: "/mid.webp" },
];

const HomePage = () => {
  const { fetchFeaturedProducts, products, isLoading } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts;
  }, [fetchFeaturedProducts]);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">
          Legxcy
        </h1>
        <p className="text-center text-xl text-gray-300">
          Ride smarter with Legxcy
        </p>
        <div className="text-center p-4 md:p-8 mb-5">
          <p className="text-md md:text-lg leading-relaxed">
            Our cutting-edge e-bikes are designed for those who seek adventure,
            efficiency, and sustainability. Whether you're commuting through the
            city, exploring scenic trails, or just enjoying a leisurely ride,
            our high-performance e-bikes offer the perfect blend of power,
            style, and comfort. With advanced features, eco-friendly technology,
            and sleek designs, our bikes enhance your riding experience and help
            you conquer any terrain with ease. Discover the future of mobility
            and ride the revolution with Legxcy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((category) => (
            <CategoryItem category={category} key={category.name} />
          ))}
        </div>
        {!isLoading && products.length > 0 && (
          <FeaturedProducts featuredProducts={products} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
