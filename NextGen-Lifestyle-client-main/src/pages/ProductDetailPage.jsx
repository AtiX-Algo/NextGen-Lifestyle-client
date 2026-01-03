import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductDetail } from "../services/api";
import { toImageUrl } from "../utils/imageUrl";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { RecommendationSlider } from "../components/recommendations/RecommendationSlider";

function getAvailableStockForVariant(product, size, color) {
  if (!product?.variants) return 0;
  return product.variants.reduce((sum, v) => {
    const sizeMatch = size ? v.size === size : true;
    const colorMatch = color ? v.color === color : true;
    if (!sizeMatch || !colorMatch) return sum;
    return sum + ((v.stock || 0) - (v.reserved || 0));
  }, 0);
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchProductDetail(id)
      .then((data) => {
        setProduct(data);
        if (data?.variants?.length) {
          const first = data.variants[0];
          setSelectedSize(first.size || "");
          setSelectedColor(first.color || "");
        }
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  const sizes = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)));
  }, [product]);

  const colors = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean)));
  }, [product]);

  const totalAvailable = useMemo(() => {
    if (!product?.variants) return 0;
    return product.variants.reduce((sum, v) => sum + ((v.stock || 0) - (v.reserved || 0)), 0);
  }, [product]);

  const variantAvailable = useMemo(() => {
    if (!product) return 0;
    return getAvailableStockForVariant(product, selectedSize, selectedColor);
  }, [product, selectedSize, selectedColor]);

  const outOfStock = totalAvailable <= 0;
  const selectedVariantOutOfStock = variantAvailable <= 0;

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return product.variants.find(
      (v) => (selectedSize ? v.size === selectedSize : true) && 
              (selectedColor ? v.color === selectedColor : true)
    ) || null;
  }, [product, selectedSize, selectedColor]);

  const priceNum = useMemo(() => {
    if (selectedVariant && typeof selectedVariant.price === "number") return selectedVariant.price;
    if (typeof product?.price === "number") return product.price;
    if (typeof product?.basePrice === "number") return product.basePrice;
    return 0;
  }, [product, selectedVariant]);

  const rating = useMemo(() => {
    if (!product) return 0;
    if (typeof product.ratingAverage === "number" && product.ratingAverage > 0) return product.ratingAverage;
    return Number(product.rating || 0);
  }, [product]);

  const mainImage = (Array.isArray(product?.images) && product.images[0]) ||
                   product?.image || product?.imageUrl || "";

  const handleAddToCart = () => {
    if (selectedVariantOutOfStock || outOfStock) {
      toast.error("This item is out of stock");
      return;
    }
    
    addToCart(product, {
      size: selectedSize,
      color: selectedColor,
      quantity: qty,
    });
    
    toast.success(`${qty} ${qty > 1 ? 'items' : 'item'} added to cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error || !product) {
    return <div className="alert alert-error">{error || "Product not found"}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        {mainImage ? (
          <figure className="border rounded-lg overflow-hidden">
            <img
              src={toImageUrl(mainImage)}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </figure>
        ) : (
          <div className="w-full h-96 bg-base-300 rounded-lg flex items-center justify-center">
            <span>No image</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        {product.brand && <p className="text-sm text-gray-500">{product.brand}</p>}

        <p className="text-xl font-bold">${priceNum.toFixed(2)}</p>

        <p className="text-sm text-gray-600 whitespace-pre-line">{product.description}</p>

        <p className="text-sm text-gray-500">
          {rating.toFixed(1)} ★ ({product.ratingCount || 0} reviews)
        </p>

        <div className="space-y-2">
          <p className="font-semibold">Stock status</p>
          {outOfStock ? (
            <span className="badge badge-error badge-lg">Out of stock</span>
          ) : (
            <span className="badge badge-success badge-lg">In stock ({totalAvailable} pcs)</span>
          )}
        </div>

        {sizes.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`btn btn-sm ${selectedSize === size ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`btn btn-sm ${selectedColor === color ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="font-semibold">Quantity</p>
          <div className="join">
            <button 
              className="btn btn-outline join-item" 
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={qty <= 1}
            >
              -
            </button>
            <input
              type="number"
              className="input input-bordered join-item w-16 text-center"
              value={qty}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setQty(Math.max(1, val));
              }}
              min="1"
            />
            <button 
              className="btn btn-outline join-item" 
              onClick={() => setQty(qty + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            className={`btn btn-primary flex-1 ${outOfStock ? 'btn-disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={outOfStock}
          >
            Add to Cart
          </button>
          <button
            className={`btn btn-secondary flex-1 ${outOfStock ? 'btn-disabled' : ''}`}
            onClick={handleBuyNow}
            disabled={outOfStock}
          >
            Buy Now
          </button>
        </div>
      </div>
      
      {/* Similar Items Section */}
      <div className="mt-16">
        <RecommendationSlider 
          title="Similar Items" 
          type="similar"
          productId={id}
        />
      </div>
    </div>
  );
}