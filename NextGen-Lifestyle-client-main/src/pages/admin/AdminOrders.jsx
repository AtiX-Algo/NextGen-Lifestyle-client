import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { colors } = useTheme();

  // Simulated data fetch
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // In a real app, you would fetch orders from your API
        // const response = await api.get('/api/orders');
        // setOrders(response.data);
        
        // Mock data for demonstration
        const mockOrders = [
          { id: 'ORD-001', customer: 'John Doe', date: '2023-05-15', status: 'Delivered', total: 99.99 },
          { id: 'ORD-002', customer: 'Jane Smith', date: '2023-05-16', status: 'Shipped', total: 149.99 },
          { id: 'ORD-003', customer: 'Bob Johnson', date: '2023-05-17', status: 'Processing', total: 199.99 },
        ];
        
        setOrders(mockOrders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'badge-success';
      case 'shipped':
        return 'badge-info';
      case 'processing':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${colors.text.primary}`}>Orders</h1>
        <div className="form-control">
          <div className="input-group">
            <input
              type="text"
              placeholder="Search orders..."
              className={`input input-bordered ${colors.bg.input} ${colors.text.primary}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className={`btn ${colors.bg.primary} ${colors.text.primary}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className={colors.bg.secondary}>
              <th className={colors.text.primary}>Order ID</th>
              <th className={colors.text.primary}>Customer</th>
              <th className={colors.text.primary}>Date</th>
              <th className={colors.text.primary}>Status</th>
              <th className={`text-right ${colors.text.primary}`}>Total</th>
              <th className={colors.text.primary}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className={colors.bg.card}>
                <td className="font-medium">
                  <Link to={`/admin/orders/${order.id}`} className={`hover:underline ${colors.text.primary}`}>
                    {order.id}
                  </Link>
                </td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td>
                  <span className={`badge ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="text-right">${order.total.toFixed(2)}</td>
                <td>
                  <Link 
                    to={`/admin/orders/${order.id}`}
                    className={`btn btn-sm ${colors.bg.primary} ${colors.text.primary} mr-2`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
