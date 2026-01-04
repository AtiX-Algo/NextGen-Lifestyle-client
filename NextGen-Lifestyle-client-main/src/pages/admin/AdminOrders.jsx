import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { deleteOrder, fetchOrders as fetchOrdersApi, updateOrder } from '../../services/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { colors } = useTheme();

  const statusOptions = [
    'Pending',
    'Processing',
    'Packed',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrdersFromApi = async () => {
      try {
        const data = await fetchOrdersApi();
        const rawOrders = Array.isArray(data) ? data : (data?.orders || []);

        const mappedOrders = rawOrders.map((o) => {
          const id = o._id || o.id;
          const displayId = o.invoiceNumber || `ORD-${String(id).slice(-6).toUpperCase()}`;
          const customer = o.customerName || o.customer?.name || o.customer || 'Unknown';
          const date = o.createdAt
            ? new Date(o.createdAt).toLocaleDateString()
            : (o.date || '');
          const status = o.status || 'Pending';
          const total = Number(o.total ?? o.totalAmount ?? 0);

          return {
            id,
            displayId,
            customer,
            date,
            status,
            total: Number.isFinite(total) ? total : 0,
          };
        });

        setOrders(mappedOrders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrdersFromApi();
  }, []);

  const handleStatusChange = async (orderId, nextStatus) => {
    const prevOrders = orders;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );

    try {
      const updated = await updateOrder(orderId, { status: nextStatus });
      const actualStatus = updated?.status || nextStatus;
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: actualStatus } : o))
      );
      toast.success('Order status updated');
    } catch (e) {
      console.error('Failed to update order status:', e);
      setOrders(prevOrders);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (orderId) => {
    const ok = window.confirm('Delete this order permanently?');
    if (!ok) return;

    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success('Order deleted');
    } catch (e) {
      console.error('Failed to delete order:', e);
      toast.error(e?.response?.data?.message || 'Failed to delete order');
    }
  };

  const filteredOrders = orders.filter(order => 
    String(order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(order.customer || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                    {order.displayId || order.id}
                  </Link>
                </td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <select
                      className={`select select-bordered select-sm ${colors.bg.input} ${colors.text.primary}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="text-right">${order.total.toFixed(2)}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/orders/${order.id}`} className="btn btn-sm btn-outline">
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(order.id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
