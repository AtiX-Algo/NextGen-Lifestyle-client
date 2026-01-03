import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { cartCount } = useCart();

  return (
    <div className="navbar bg-base-100 shadow">
      <div className="container mx-auto flex justify-between px-4">
        <Link to="/" className="btn btn-ghost text-xl font-bold">
          NextGen Lifestyle
        </Link>
        <div className="flex gap-2 items-center">
          <Link className="btn btn-ghost btn-sm" to="/products">
            Products
          </Link>
          <Link className="btn btn-ghost btn-sm" to="/cart">
            Cart
            {cartCount > 0 && (
              <span className="badge badge-primary ml-1">{cartCount}</span>
            )}
          </Link>
          <Link className="btn btn-ghost btn-sm" to="/admin/orders">
            Admin
          </Link>
          <Link className="btn btn-ghost btn-sm" to="/preferences/notifications">
            Notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
