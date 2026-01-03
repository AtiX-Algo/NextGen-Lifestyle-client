import { Outlet, Link, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-base-200' : '';
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-base-100 shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <ul className="menu p-4 w-64 bg-base-100 text-base-content">
          <li className={isActive('/admin/orders')}>
            <Link to="/admin/orders">Orders</Link>
          </li>
          <li className={isActive('/admin/inventory')}>
            <Link to="/admin/inventory">Inventory</Link>
          </li>
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
