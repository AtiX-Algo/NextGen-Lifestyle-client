import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { inventoryAPI } from '../../services/api';
import colors from '../../theme/colors';

// Stock Status Badge Component with Progress Bar and Tooltips
function StockStatusBadge({ stock, maxStock = 50 }) {
  const stockValue = stock || 0;
  const percentage = Math.min(100, Math.round((stockValue / maxStock) * 100));
  
    // Get status colors based on stock level
  const { light, dark, icon, name: status, progress: progressColor } = colors.getStatus(stockValue, maxStock);
  const [bgClass, textClass] = light.split(' ');
  const [darkBgClass, darkTextClass] = dark.split(' ');
  
  return (
    <div className="w-48">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${textClass} ${bgClass} ${darkTextClass} ${darkBgClass} bg-opacity-30`}>
            {icon}
          </span>
          <span className={`text-sm font-medium ${textClass} ${darkTextClass}`}>
            {status}
          </span>
          <span className={`text-xs ${textClass} ${darkTextClass} font-medium bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded`}>
            {stockValue} pcs
          </span>
        </div>
        <div className="tooltip" data-tip={`${stockValue} of ${maxStock} (${percentage}%)`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
      </div>
      <div className={`h-2 w-full rounded-full ${bgClass} ${darkBgClass} overflow-hidden border ${colors.border.light}`}>
        <div 
          className={`h-full ${progressColor} transition-all duration-500 ease-out`}
          style={{
            width: `${percentage}%`,
            backgroundImage: `linear-gradient(45deg, ${progressColor} 25%, 
              ${progressColor.replace('500', '400')} 25%, 
              ${progressColor.replace('500', '400')} 50%, 
              ${progressColor} 50%, 
              ${progressColor} 75%, 
              ${progressColor.replace('500', '400')} 75%, 
              ${progressColor.replace('500', '400')} 100%)`,
            backgroundSize: '1rem 1rem',
            animation: 'stripes 2s linear infinite',
          }}
        ></div>
      </div>
      <style jsx>{`
        @keyframes stripes {
          0% { background-position: 1rem 0; }
          100% { background-position: 0 0; }
        }
      `}</style>
    </div>
  );
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState(null);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Fetch products from API
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await inventoryAPI.getProducts();
      setProducts(Array.isArray(data) ? data : data.products || []);
      setError('');
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle stock updates
  const handleStockUpdate = async (productId, variantRef, newStock) => {
    const variantKey =
      variantRef && typeof variantRef === 'object'
        ? `${variantRef.color || ''}__${variantRef.size || ''}`
        : (variantRef || 'main');
    const updateId = `${productId}-${variantKey}`;
    const stockValue = parseInt(newStock, 10) || 0;
    
    try {
      setUpdating(updateId);
      
      // Update the server first
      const updatedProduct = await inventoryAPI.updateStock(productId, {
        variantId: undefined,
        size: variantRef && typeof variantRef === 'object' ? variantRef.size : undefined,
        color: variantRef && typeof variantRef === 'object' ? variantRef.color : undefined,
        stock: stockValue
      });

      // Replace product with server response (single source of truth)
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? updatedProduct : p))
      );
      
      // Show success message that will auto-close after 2 seconds
      toast.success('Stock updated successfully', { duration: 2000 });
      
    } catch (err) {
      console.error('Error updating stock:', err);
      toast.error(err.response?.data?.message || 'Failed to update stock');
    } finally {
      // Reset updating state after a small delay to prevent UI flicker
      setTimeout(() => setUpdating(null), 500);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error max-w-2xl mx-auto">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
        <button className="btn btn-sm" onClick={loadProducts}>Retry</button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="form-control">
          <div className="input-group">
            <input
              type="text"
              placeholder="Search products..."
              className="input input-bordered"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-square">
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
            <tr>
              <th>Product</th>
              <th>Variant</th>
              <th>SKU</th>
              <th>Current Stock</th>
              <th>Update Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8">
                  <div className="text-gray-500">No products found</div>
                </td>
              </tr>
            ) : (
              filteredProducts.flatMap(product => [
                // Main product if no variants
                ...(product.variants && product.variants.length > 0 ? [] : [
                  <ProductRow 
                    key={`product-${product._id}`}
                    product={product}
                    onUpdateStock={handleStockUpdate}
                    updating={updating}
                  />
                ]),
                // Variants if they exist
                ...(product.variants?.map(variant => (
                  <VariantRow
                    key={`variant-${variant._id}`}
                    product={product}
                    variant={variant}
                    onUpdateStock={handleStockUpdate}
                    updating={updating}
                  />
                )) || [])
              ])
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Component for main product row (when no variants exist)
function ProductRow({ product, onUpdateStock, updating }) {
  const [newStock, setNewStock] = useState((product.stock || 0).toString());
  const updateId = `${product._id}-main`;
  const isUpdating = updating === updateId;

  // Update local state when product prop changes
  useEffect(() => {
    setNewStock((product.stock || 0).toString());
  }, [product.stock]);

  // Handle stock update
  const handleUpdate = () => {
    const stockValue = parseInt(newStock, 10);
    if (!isNaN(stockValue) && stockValue >= 0) {
      onUpdateStock(product._id, null, stockValue);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUpdate();
    }
  };

  return (
    <tr key={`product-${product._id}`} className={isUpdating ? 'opacity-75' : ''}>
      <td>
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="mask mask-squircle w-12 h-12">
              <img 
                src={product.images?.[0] || '/placeholder-image.svg'} 
                alt={product.name}
                className="object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.svg';
                }}
              />
            </div>
          </div>
          <div>
            <div className="font-bold">{product.name}</div>
            <div className="text-sm opacity-50">{product.brand}</div>
          </div>
        </div>
      </td>
      <td className="text-gray-500">Default</td>
      <td className="font-mono text-sm">{product.sku || 'N/A'}</td>
      <td className="font-medium">{product.stock || 0}</td>
      <td>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            className="input input-bordered input-sm w-24"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isUpdating}
            aria-label="Update stock quantity"
          />
          <button
            className="btn btn-primary btn-sm min-w-[80px]"
            onClick={handleUpdate}
            disabled={isUpdating || !newStock}
          >
            {isUpdating ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                <span className="ml-1">Saving</span>
              </>
            ) : 'Update'}
          </button>
        </div>
      </td>
      <td>
        <StockStatusBadge 
          stock={product.stock} 
          maxStock={product.maxStock || 50} 
        />
      </td>
    </tr>
  );
}

// Component for variant row
function VariantRow({ product, variant, onUpdateStock, updating }) {
  const [newStock, setNewStock] = useState((variant.stock || 0).toString());
  const variantKey = `${variant.color || ''}__${variant.size || ''}`;
  const updateId = `${product._id}-${variantKey}`;
  const isUpdating = updating === updateId;

  // Update local state when variant prop changes
  useEffect(() => {
    setNewStock((variant.stock || 0).toString());
  }, [variant.stock]);

  // Handle stock update
  const handleUpdate = () => {
    const stockValue = parseInt(newStock, 10);
    if (!isNaN(stockValue) && stockValue >= 0) {
      onUpdateStock(
        product._id,
        { size: variant.size, color: variant.color },
        stockValue
      );
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUpdate();
    }
  };

  return (
    <tr key={`variant-${product._id}-${variantKey}`} className={isUpdating ? 'opacity-75' : ''}>
      <td>
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="mask mask-squircle w-12 h-12">
              <img 
                src={variant.image || product.images?.[0] || '/placeholder-image.svg'} 
                alt={`${product.name} - ${variant.color} ${variant.size}`}
                className="object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.svg';
                }}
              />
            </div>
          </div>
          <div>
            <div className="font-bold">{product.name}</div>
            <div className="text-sm opacity-50">{product.brand}</div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap">
        {`${variant.color || ''} ${variant.size || ''}`.trim() || 'N/A'}
      </td>
      <td className="font-mono text-sm">{variant.sku || 'N/A'}</td>
      <td className="font-medium">{variant.stock || 0}</td>
      <td>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            className="input input-bordered input-sm w-24"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isUpdating}
            aria-label="Update stock quantity"
          />
          <button
            className="btn btn-primary btn-sm min-w-[80px]"
            onClick={handleUpdate}
            disabled={isUpdating || !newStock}
          >
            {isUpdating ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                <span className="ml-1">Saving</span>
              </>
            ) : 'Update'}
          </button>
        </div>
      </td>
      <td>
        <StockStatusBadge 
          stock={variant.stock} 
          maxStock={variant.maxStock || product.maxStock || 50} 
        />
      </td>
    </tr>
  );
}
