import { useEffect, useState } from 'react';

const Recommendations = () => {
  const [data, setData] = useState({ trending: [], newArrivals: [] });

  useEffect(() => {
    fetch('http://localhost:5000/api/products/recommendations')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="my-10 p-5 bg-base-100 rounded-xl">
      
      {/* SECTION 1: TRENDING */}
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        🔥 Trending Now
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {data.trending.map((product) => (
          <div key={product._id} className="card bg-base-200 shadow-sm hover:shadow-md transition-all">
            <figure className="h-32 bg-gray-300">
                {/* Placeholder Image since we used placehold.co */}
                <img src={product.image} alt={product.name} className="object-cover h-full w-full opacity-50"/>
            </figure>
            <div className="card-body p-4">
              <h3 className="font-bold">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.category}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-primary font-bold">${product.price}</span>
                <div className="badge badge-outline text-xs">{product.salesCount} sold</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 2: NEW ARRIVALS */}
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        🆕 New Arrivals
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.newArrivals.map((product) => (
          <div key={product._id} className="card bg-base-200 shadow-sm">
             <div className="card-body p-4">
              <h3 className="font-bold">{product.name}</h3>
              <p className="text-sm">Just added to our collection.</p>
              <button className="btn btn-sm btn-ghost mt-2">View Details</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Recommendations;