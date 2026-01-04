import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchOrderDetail } from '../services/api';
import { toast } from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');

  const isAdmin = useMemo(() => location.pathname.startsWith('/admin'), [location.pathname]);

  const fallbackProductPath = useMemo(() => {
    let p = '/products';
    try {
      p = localStorage.getItem('ng_last_product_path') || p;
    } catch {
      // ignore
    }
    return p;
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!id) return;

    if (location.state?.order) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    fetchOrderDetail(id)
      .then((data) => {
        if (!mounted) return;
        setOrder(data);
      })
      .catch((e) => {
        console.error('Failed to load order:', e);
        if (!mounted) return;
        const msg = e?.response?.data?.message || 'Failed to load order';
        setError(msg);
        toast.error(msg);

        // For customer side: if we can't load the order, go back to last product page
        if (!isAdmin) {
          setTimeout(() => {
            navigate(fallbackProductPath);
          }, 800);
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
        <Link to={isAdmin ? '/admin/orders' : fallbackProductPath} className="btn btn-outline">Back</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="alert alert-warning mb-4">
          <span>Order not found</span>
        </div>
        <Link to="/" className="btn btn-outline">Back</Link>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString() : '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-sm opacity-70">Order ID: {order._id || order.id}</p>
          {order.invoiceNumber && (
            <p className="text-sm opacity-70">Invoice: {order.invoiceNumber}</p>
          )}
          {createdAt && <p className="text-sm opacity-70">Placed: {createdAt}</p>}
        </div>
        <div className="text-right">
          <div className="badge badge-outline">{order.status || 'Pending'}</div>
          <div className="mt-2 font-semibold">Total: ${Number(order.total || 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-base">Customer</h2>
            <p className="text-sm">{order.customerName || 'Unknown'}</p>
            {order.email && <p className="text-sm">{order.email}</p>}
            {order.channel && <p className="text-sm">Channel: {order.channel}</p>}
            {order.paymentMethod && <p className="text-sm">Payment: {order.paymentMethod}</p>}
            {order.paymentStatus && <p className="text-sm">Payment Status: {order.paymentStatus}</p>}
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-base">Shipping Address</h2>
            <pre className="text-sm whitespace-pre-wrap">
{JSON.stringify(order.shippingAddress || {}, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title text-base">Items</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Variant</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const name = it?.name || it?.product?.name || 'Item';
                  const variant = [it?.color, it?.size].filter(Boolean).join(' / ');
                  const qty = Number(it?.quantity || 0);
                  const price = Number(it?.price || 0);
                  return (
                    <tr key={`${order._id || order.id}-${idx}`}>
                      <td>{name}</td>
                      <td>{variant || '-'}</td>
                      <td className="text-right">{qty}</td>
                      <td className="text-right">${price.toFixed(2)}</td>
                      <td className="text-right">${(qty * price).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="text-right space-y-1">
              <div className="text-sm opacity-70">Subtotal: ${Number(order.subtotal || 0).toFixed(2)}</div>
              <div className="text-sm opacity-70">Tax: ${Number(order.tax || 0).toFixed(2)}</div>
              <div className="text-sm opacity-70">Discount: ${Number(order.discount || 0).toFixed(2)}</div>
              <div className="font-semibold">Total: ${Number(order.total || 0).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Link to={isAdmin ? '/admin/orders' : fallbackProductPath} className="btn btn-outline">
          Back
        </Link>
      </div>
    </div>
  );
}
