import { Link } from "react-router-dom";

const year = new Date().getFullYear();

const shopLinks = [
  { label: "Hub-Drive Motor", to: "/category/hub" },
  { label: "Mid-Drive Motor", to: "/category/mid" },
];

const accountLinks = [
  { label: "Login", to: "/login" },
  { label: "Sign Up", to: "/signup" },
  { label: "Cart", to: "/cart" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-emerald-800 bg-[#003632]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* BRAND */}
          <div>
            <Link to="/" className="inline-flex items-center">
              <img
                src="/logo.png"
                alt="Legxcy"
                width={100}
                height={40}
                loading="lazy"
                className="select-none"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-emerald-200">
              High-performance electric bikes engineered for adventure
              riding and everyday urban commuting.
            </p>
          </div>

          {/* SHOP */}
          <nav aria-label="Shop">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-400">
              Shop
            </h2>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-emerald-200 transition hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ACCOUNT */}
          <nav aria-label="Account">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-400">
              Account
            </h2>
            <ul className="space-y-2">
              {accountLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-emerald-200 transition hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-emerald-800 pt-6 text-center text-xs text-emerald-400">
          &copy; {year} Legxcy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
