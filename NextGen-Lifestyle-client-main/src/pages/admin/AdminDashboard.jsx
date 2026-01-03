import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm breadcrumbs">
          <ul>
            <li><Link to="/admin">Admin</Link></li>
            <li>Dashboard</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stats bg-primary text-primary-content">
          <div className="stat">
            <div className="stat-title text-primary-content">Total Products</div>
            <div className="stat-value">0</div>
            <div className="stat-actions">
              <Link to="/admin/products" className="btn btn-sm btn-ghost">View All</Link>
            </div>
          </div>
        </div>

        <div className="stats bg-secondary text-secondary-content">
          <div className="stat">
            <div className="stat-title text-secondary-content">Total Orders</div>
            <div className="stat-value">0</div>
            <div className="stat-actions">
              <Link to="/admin/orders" className="btn btn-sm btn-ghost">View All</Link>
            </div>
          </div>
        </div>

        <div className="stats bg-accent text-accent-content">
          <div className="stat">
            <div className="stat-title text-accent-content">Low Stock Items</div>
            <div className="stat-value">0</div>
            <div className="stat-actions">
              <Link to="/admin/inventory" className="btn btn-sm btn-ghost">Manage</Link>
            </div>
          </div>
        </div>

        <div className="stats bg-neutral text-neutral-content">
          <div className="stat">
            <div className="stat-title text-neutral-content">Total Revenue</div>
            <div className="stat-value">$0</div>
            <div className="stat-desc">This month</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Recent Orders</h2>
            <div className="text-center py-8">
              <p className="text-gray-500">No recent orders</p>
              <Link to="/admin/orders" className="btn btn-link">View all orders</Link>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Low Stock Items</h2>
            <div className="text-center py-8">
              <p className="text-gray-500">All items are in stock</p>
              <Link to="/admin/inventory" className="btn btn-link">Manage inventory</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
