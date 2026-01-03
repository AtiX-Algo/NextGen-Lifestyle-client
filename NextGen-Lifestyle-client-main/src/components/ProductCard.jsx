// src/components/ProductCard.jsx
import { Link } from "react-router-dom";
import { toImageUrl } from "../utils/imageUrl"; // ✅ added

function getAvailableStock(product) {
  if (!product?.variants || product.variants.length === 0) return 0;
  return product.variants.reduce(
    (sum, v) => sum + (v.stock - (v.reserved || 0)),
    0
  );
}

export default function ProductCard({ product }) {
  const available = getAvailableStock(product);
  const outOfStock = available <= 0;

  // Debug log the product data for troubleshooting
  console.log('Product data:', {
    id: product._id,
    name: product.name,
    images: product.images,
    image: product.image,
    imageUrl: product.imageUrl
  });

  // Get the first available image from various possible fields
  const rawImg = 
    (Array.isArray(product.images) && product.images.length > 0) ? product.images[0] :
    (product.image) ? product.image :
    (product.imageUrl) ? product.imageUrl :
    null;

  // Convert to URL and log the result
  const mainImage = toImageUrl(rawImg);
  console.log('Image URL:', { rawImg, processed: mainImage });

  // Fallback to a placeholder if no image is found
  const displayImage = mainImage || 'https://via.placeholder.com/600x400?text=No+Image';

  const price =
    typeof product.price === "number"
      ? product.price
      : Number(product.price || 0);

  return (
    <div className="card bg-base-100 shadow hover:shadow-lg transition">
      <figure className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
        <img
          src={displayImage}
          alt={product.name}
          className="max-w-full max-h-full object-contain p-2"
          onError={(e) => {
            console.error('Failed to load image:', e.target.src);
            e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
            e.target.className = 'w-full h-full object-cover';
          }}
        />
      </figure>

      <div className="card-body">
        <h2 className="card-title text-lg">
          {product.name}
          {product.brand && (
            <span className="badge badge-outline ml-2">{product.brand}</span>
          )}
        </h2>

        {product.category && (
          <p className="text-sm text-gray-500">{product.category}</p>
        )}

        <p className="font-bold mt-2">
          ${isNaN(price) ? "0.00" : price.toFixed(2)}
        </p>

        <p className="text-xs text-gray-500">
          {(product.ratingAverage ?? 0).toFixed(1)} ★ (
          {product.ratingCount || 0})
        </p>

        <div className="mt-2">
          {outOfStock ? (
            <span className="badge badge-error">Out of stock</span>
          ) : (
            <span className="badge badge-success">
              In stock ({available} pcs)
            </span>
          )}
        </div>

        <div className="card-actions justify-end mt-4">
          <Link
            to={`/products/${product._id}`}
            className="btn btn-primary btn-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
