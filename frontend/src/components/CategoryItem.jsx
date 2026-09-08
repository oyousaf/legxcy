import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { LuArrowRight } from "react-icons/lu";

const CategoryItem = ({ category }) => {
  return (
    <div className="relative overflow-hidden h-96 w-full rounded-lg group">
      <Link to={"/category" + category.href}>
        <div className="w-full h-full cursor-pointer">
          <div className="absolute inset-0 z-10 bg-linear-to-t from-emerald-950 via-emerald-950/10 to-transparent" />
          <img
            src={category.imageUrl}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
            <h3 className="font-display mb-1 text-2xl font-bold text-white">
              {category.name}
            </h3>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Shop now
              <LuArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

CategoryItem.propTypes = {
  category: PropTypes.shape({
    href: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default CategoryItem;
