// src/pages/ProductListPage.jsx
import { useEffect, useState } from 'react';
import { fetchProducts, fetchProductFilterMeta } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function ProductListPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('relevance');
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [filtersMeta, setFiltersMeta] = useState({
    categories: [],
    minPrice: 0,
    maxPrice: 0
  });
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load filter meta once
  useEffect(() => {
    fetchProductFilterMeta()
      .then((data) => setFiltersMeta(data))
      .catch(() => {
        // silent fail for meta
      });
  }, []);

  // Load products when filters change
  useEffect(() => {
    setLoading(true);
    setError('');
    setSuggestions(null);

    fetchProducts({
      q: query || undefined,
      category: category || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sort,
      page,
      limit: 12
    })
      .then((data) => {
        setProducts(data.products || []);
        setMeta({ total: data.total, pages: data.pages, page: data.page });
        setSuggestions(data.suggestions || null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load products');
      })
      .finally(() => setLoading(false));
  }, [query, category, minPrice, maxPrice, sort, page]);

  const resetFilters = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('relevance');
    setPage(1);
  };

  const hasFilters =
    category || minPrice || maxPrice || sort !== 'relevance' || query;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 w-full md:w-1/2">
          <label className="form-control">
            <div className="label">
              <span className="label-text font-semibold">
                Search products (name / brand / category)
              </span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g. T-shirt, Nike, Sneakers..."
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
            />
          </label>
        </div>

        <div className="flex gap-2 justify-end">
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="form-control">
            <div className="label">
              <span className="label-text">Category</span>
            </div>
            <select
              className="select select-bordered"
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
            >
              <option value="">All</option>
              {filtersMeta.categories?.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text">Min price</span>
            </div>
            <input
              type="number"
              className="input input-bordered"
              value={minPrice}
              placeholder={filtersMeta.minPrice || ''}
              onChange={(e) => {
                setPage(1);
                setMinPrice(e.target.value);
              }}
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text">Max price</span>
            </div>
            <input
              type="number"
              className="input input-bordered"
              value={maxPrice}
              placeholder={filtersMeta.maxPrice || ''}
              onChange={(e) => {
                setPage(1);
                setMaxPrice(e.target.value);
              }}
            />
          </label>
        </div>

        <label className="form-control md:col-span-2">
          <div className="label">
            <span className="label-text">Sort by</span>
          </div>
          <select
            className="select select-bordered"
            value={sort}
            onChange={(e) => {
              setPage(1);
              setSort(e.target.value);
            }}
          >
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating-desc">Rating: High → Low</option>
            <option value="newest">Newest</option>
          </select>
        </label>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg" />
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && products.length === 0 && (
        <div className="space-y-3">
          <p className="text-lg font-semibold">No products found</p>
          {suggestions && (
            <div className="space-y-2 text-sm">
              <p>{suggestions.message}</p>
              {suggestions.possibleCategories?.length > 0 && (
                <p>
                  <span className="font-semibold">Popular categories:</span>{' '}
                  {suggestions.possibleCategories.join(', ')}
                </p>
              )}
              {suggestions.possibleBrands?.length > 0 && (
                <p>
                  <span className="font-semibold">Popular brands:</span>{' '}
                  {suggestions.possibleBrands.join(', ')}
                </p>
              )}
              {suggestions.clearFilters && hasFilters && (
                <button className="btn btn-outline btn-sm" onClick={resetFilters}>
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <p className="text-sm text-gray-500">
            Showing {products.length} of {meta.total} products
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {meta.pages > 1 && (
            <div className="join mt-6 flex justify-center">
              <button
                className="btn join-item"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                «
              </button>
              <button className="btn join-item pointer-events-none">
                Page {meta.page} / {meta.pages}
              </button>
              <button
                className="btn join-item"
                disabled={page >= meta.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                »
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
