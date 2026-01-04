import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, XCircle, MoreHorizontal } from 'lucide-react';
import ProductCard from '../ProductCard';
import { useRecommendations } from '../../context/RecommendationContext';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

// Reasons for hiding a recommendation
const HIDE_REASONS = [
  { id: 'not_relevant', label: 'Not relevant to me' },
  { id: 'already_own', label: 'I already own this' },
  { id: 'not_interested', label: 'Not interested' },
  { id: 'see_too_often', label: 'See this too often' },
];

export function RecommendationSlider({ 
  title = 'Recommended for You', 
  productIds = [], 
  type = 'personalized',
  productId,
  limit = 5,
  showHeader = true,
  className = ''
}) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(4);
  const [items, setItems] = useState([]);
  const [showFeedback, setShowFeedback] = useState(null);
  
  const { 
    fetchSimilarItems, 
    fetchFrequentlyBoughtTogether, 
    fetchPersonalizedRecommendations,
    getTrendingProducts,
    getNewArrivals,
    hideRecommendation,
    loading,
    error,
    userPreferences
  } = useRecommendations();

  // Update visible items based on screen size
  useEffect(() => {
    const updateVisibleItems = () => {
      const width = window.innerWidth;
      if (width < 640) setVisibleItems(1);
      else if (width < 768) setVisibleItems(2);
      else if (width < 1024) setVisibleItems(3);
      else setVisibleItems(4);
    };

    window.addEventListener('resize', updateVisibleItems);
    updateVisibleItems();
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, []);

  // Handle hiding a recommendation
  const handleHideItem = useCallback(async (itemId, reason) => {
    try {
      await hideRecommendation(itemId, reason);
      // Remove the item from local state
      setItems(prev => prev.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Failed to hide recommendation:', error);
    } finally {
      setShowFeedback(null);
    }
  }, [hideRecommendation]);

  // Get the appropriate recommendation fetcher based on type
  const getRecommendationFetcher = useCallback(() => {
    switch (type) {
      case 'similar':
        return () => fetchSimilarItems(productId);
      case 'frequentlyBoughtTogether':
        return () => fetchFrequentlyBoughtTogether(productIds);
      case 'trending':
        return getTrendingProducts;
      case 'newArrivals':
        return getNewArrivals;
      case 'personalized':
      default:
        return fetchPersonalizedRecommendations;
    }
  }, [type, productId, productIds, fetchSimilarItems, fetchFrequentlyBoughtTogether, fetchPersonalizedRecommendations, getTrendingProducts, getNewArrivals]);

  // Fetch recommendations based on type
  useEffect(() => {
    const fetchItems = async () => {
      let result = [];
      
      try {
        const fetcher = getRecommendationFetcher();
        result = await fetcher();
        
        // Apply limit
        if (limit && limit > 0) {
          result = result.slice(0, limit);
        }
        
        setItems(result);
      } catch (error) {
        console.error(`Error fetching ${type} recommendations:`, error);
      }
    };
    
    fetchItems();
  }, [type, productId, productIds.join(','), limit, getRecommendationFetcher]);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => 
      Math.min(prev + 1, Math.ceil(items.length / visibleItems) - 1)
    );
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Render feedback dropdown for hiding recommendations
  const renderFeedbackDropdown = (itemId) => (
    <div className="absolute top-2 right-2 z-10 bg-white rounded-md shadow-lg p-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Why hide this?</span>
        <button 
          onClick={() => setShowFeedback(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-1">
        {HIDE_REASONS.map(reason => (
          <button
            key={reason.id}
            onClick={() => handleHideItem(itemId, reason.id)}
            className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded text-gray-700"
          >
            {reason.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (loading && items.length === 0) {
    return (
      <div className={`recommendation-slider ${className}`}>
        {showHeader && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(visibleItems)].map((_, i) => (
            <div key={i} className="w-64 h-80 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`recommendation-slider ${className}`}>
        {showHeader && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        <div className="text-red-500 p-4 bg-red-50 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Don't render anything if no items
  }
  
  const maxIndex = Math.ceil(items.length / visibleItems) - 1;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  return (
    <div className={cn("relative w-full", className)}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="h-8 w-8 rounded-full"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex + visibleItems >= items.length}
              className="h-8 w-8 rounded-full"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="relative">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: visibleItems }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-80 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load recommendations. Please try again later.</p>
          </div>
        ) : items.length > 0 ? (
          <div className="relative">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
                width: `${Math.ceil((items.length / visibleItems) * 100)}%`
              }}
            >
              {items.map((item) => (
                <div 
                  key={item._id} 
                  className="relative w-full flex-shrink-0 px-2"
                  style={{
                    width: `${100 / visibleItems}%`
                  }}
                >
                  <div className="relative group h-full">
                    <ProductCard 
                      product={item}
                      onClick={() => handleProductClick(item._id)}
                      className="h-full"
                    />
                    
                    {/* Inventory status */}
                    <div className="relative overflow-hidden px-4 sm:px-6 lg:px-8">
                      {item.inventoryCount <= 0 ? (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Out of Stock
                        </div>
                      ) : item.inventoryCount <= 10 ? (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                          Only {item.inventoryCount} left
                        </div>
                      ) : null}
                      
                      {/* Hide button */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowFeedback(showFeedback === item._id ? null : item._id);
                            }}
                            aria-label="More options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <div className="px-2 py-1.5 text-sm font-medium text-gray-700">
                            Not interested?
                          </div>
                          {HIDE_REASONS.map((reason) => (
                            <DropdownMenuItem
                              key={reason.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHideItem(item._id, reason.id);
                              }}
                              className="text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                            >
                              {reason.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      {/* Feedback dropdown */}
                      {showFeedback === item._id && renderFeedbackDropdown(item._id)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No recommendations available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
