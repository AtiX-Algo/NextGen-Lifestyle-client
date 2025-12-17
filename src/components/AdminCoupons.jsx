import { useState, useEffect } from 'react';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountPercentage: '',
    minPurchaseAmount: '',
    expirationDate: ''
  });
  const [message, setMessage] = useState('');

  //  Fetch Coupons Function (MOVED UP)
  const fetchCoupons = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/coupons');
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    }
  };

  //  Fetch on Load
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/coupons");
        const data = await res.json();
        setCoupons(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadCoupons();
  }, []);


  //  Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //  Create Coupon (Protected)
  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // Admin Token

    try {
      const res = await fetch('http://localhost:5000/api/coupons/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('Coupon Created!');
        fetchCoupons(); // Refresh
        setFormData({
          code: '',
          description: '',
          discountPercentage: '',
          minPurchaseAmount: '',
          expirationDate: ''
        });
      } else {
        const data = await res.json();
        setMessage(`Error: ${data.message}`);
      }
    } catch {
      setMessage('Network Error');
    }
  };

  //  Delete Coupon (Protected)
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/coupons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchCoupons(); // Refresh list
      } else {
        alert('Failed to delete');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-10 bg-base-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Coupon Manager</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* FORM: Create New Coupon */}
        <div className="card bg-base-100 shadow-xl h-fit">
          <div className="card-body">
            <h2 className="card-title text-primary mb-4">Add New Coupon</h2>

            {message && <div className="alert alert-info text-xs py-2 mb-2">{message}</div>}

            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                name="code"
                placeholder="Code (e.g. SAVE10)"
                className="input input-bordered w-full"
                value={formData.code}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="description"
                placeholder="Description"
                className="input input-bordered w-full"
                value={formData.description}
                onChange={handleChange}
                required
              />

              <div className="flex gap-2">
                <input
                  type="number"
                  name="discountPercentage"
                  placeholder="Discount %"
                  className="input input-bordered w-1/2"
                  value={formData.discountPercentage}
                  onChange={handleChange}
                  required
                />

                <input
                  type="number"
                  name="minPurchaseAmount"
                  placeholder="Min Spend ($)"
                  className="input input-bordered w-1/2"
                  value={formData.minPurchaseAmount}
                  onChange={handleChange}
                  required
                />
              </div>

              <label className="label text-xs">Expiration Date</label>
              <input
                type="date"
                name="expirationDate"
                className="input input-bordered w-full"
                value={formData.expirationDate}
                onChange={handleChange}
                required
              />

              <button type="submit" className="btn btn-primary w-full mt-4">
                Create Coupon
              </button>
            </form>
          </div>
        </div>

        {/* LIST: Existing Coupons */}
        <div className="col-span-1 lg:col-span-2">
          <div className="overflow-x-auto bg-base-100 rounded-xl shadow-xl">
            <table className="table w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Spend</th>
                  <th>Expiry</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-4">
                      No coupons found.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover">
                      <td className="font-bold">{coupon.code}</td>
                      <td>{coupon.discountPercentage}%</td>
                      <td>${coupon.minPurchaseAmount}</td>
                      <td>{new Date(coupon.expirationDate).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="btn btn-error btn-xs text-white"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminCoupons;
