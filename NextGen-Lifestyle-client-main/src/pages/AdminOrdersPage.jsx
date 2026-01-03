import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'newest',
  });
  const { colors } = useTheme();

  // Simulated data fetch
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // In a real app, you would fetch orders from your API
        // const response = await api.get('/api/admin/orders');
        // setOrders(response.data);
        
        // Mock data for demonstration
        const mockOrders = [
          {
            id: 'ORD-2023-001',
            customer: { name: 'John Doe', email: 'john@example.com' },
            date: '2023-05-15T10:30:00',
            status: 'completed',
            total: 199.98,
            items: [
              { id: 1, name: 'Product 1', price: 99.99, quantity: 1, image: '/placeholder-product.jpg' },
              { id: 2, name: 'Product 2', price: 99.99, quantity: 1, image: '/placeholder-product.jpg' },
            ],
            shipping: {
              address: '123 Main St, Anytown, USA',
              method: 'Standard Shipping',
              tracking: '1Z999AA1234567890'
            },
            payment: {
              method: 'Credit Card',
              status: 'paid',
              transactionId: 'TXN-123456789'
            }
          },
          {
            id: 'ORD-2023-002',
            customer: { name: 'Jane Smith', email: 'jane@example.com' },
            date: '2023-05-16T14:45:00',
            status: 'processing',
            total: 149.99,
            items: [
              { id: 3, name: 'Product 3', price: 149.99, quantity: 1, image: '/placeholder-product.jpg' },
            ],
            shipping: {
              address: '456 Oak Ave, Somewhere, USA',
              method: 'Express Shipping',
              tracking: ''
            },
            payment: {
              method: 'PayPal',
              status: 'paid',
              transactionId: 'PAY-123456789'
            }
          },
          {
            id: 'ORD-2023-003',
            customer: { name: 'Bob Johnson', email: 'bob@example.com' },
            date: '2023-05-17T09:15:00',
            status: 'pending',
            total: 299.97,
            items: [
              { id: 4, name: 'Product 4', price: 99.99, quantity: 3, image: '/placeholder-product.jpg' },
            ],
            shipping: {
              address: '789 Pine Rd, Nowhere, USA',
              method: 'Standard Shipping',
              tracking: ''
            },
            payment: {
              method: 'Credit Card',
              status: 'pending',
              transactionId: ''
            }
          },
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

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || order.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (filters.sortBy === 'newest') {
      return new Date(b.date) - new Date(a.date);
    } else if (filters.sortBy === 'oldest') {
      return new Date(a.date) - new Date(b.date);
    } else if (filters.sortBy === 'total-asc') {
      return a.total - b.total;
    } else if (filters.sortBy === 'total-desc') {
      return b.total - a.total;
    }
    return 0;
  });

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className={`text-2xl font-bold ${colors.text.primary}`}>Order Management</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <select
              className={`select select-bordered w-full ${colors.bg.input} ${colors.text.primary}`}
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="relative">
            <select
              className={`select select-bordered w-full ${colors.bg.input} ${colors.text.primary}`}
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="total-asc">Total: Low to High</option>
              <option value="total-desc">Total: High to Low</option>
            </select>
          </div>
          <div className="relative flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                className={`input input-bordered w-full ${colors.bg.input} ${colors.text.primary} pl-10`}
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
              <svg
                className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={colors.bg.secondary}>
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{order.id}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{order.items.length} items</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{order.customer.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(order.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="text-gray-900 dark:text-white">${order.total.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        View
                      </Link>
                      <select
                        className={`ml-2 p-1 text-sm rounded border ${colors.border.light} ${colors.bg.input} ${colors.text.primary}`}
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No orders found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{sortedOrders.length}</span> of{' '}
          <span className="font-medium">{sortedOrders.length}</span> results
        </div>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md border ${colors.border.light} ${colors.bg.input} ${colors.text.primary} disabled:opacity-50`}
            disabled={true}
          >
            Previous
          </button>
          <button
            className={`px-3 py-1 rounded-md border ${colors.border.light} ${colors.bg.input} ${colors.text.primary} disabled:opacity-50`}
            disabled={true}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
