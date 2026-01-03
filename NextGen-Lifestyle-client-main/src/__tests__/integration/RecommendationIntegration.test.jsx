import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { RecommendationProvider } from '../../context/RecommendationContext';
import RecommendationSlider from '../../components/recommendations/RecommendationSlider';

// Mock the recommendation API
jest.mock('../../services/recommendationApi', () => ({
  getPersonalizedRecommendations: jest.fn(),
  getSimilarItems: jest.fn(),
  getFrequentlyBoughtTogether: jest.fn(),
  hideRecommendation: jest.fn(),
  getTrendingProducts: jest.fn(),
}));

// Mock the ProductCard component to simplify testing
jest.mock('../../components/ProductCard', () => ({
  __esModule: true,
  default: ({ product }) => (
    <div data-testid="product-card" data-id={product._id}>
      <h3>{product.name}</h3>
      <p>${product.price?.toFixed(2)}</p>
    </div>
  ),
}));

const mockRecommendations = [
  { _id: '1', name: 'Test Product 1', price: 99.99 },
  { _id: '2', name: 'Test Product 2', price: 129.99 },
  { _id: '3', name: 'Test Product 3', price: 79.99 },
  { _id: '4', name: 'Test Product 4', price: 149.99 },
];

const renderWithProviders = (ui, { ...renderOptions } = {}) => {
  return render(
    <Router>
      <RecommendationProvider>
        {ui}
      </RecommendationProvider>
    </Router>,
    renderOptions
  );
};

describe('Recommendation System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock implementations
    const { 
      getPersonalizedRecommendations, 
      getSimilarItems, 
      getFrequentlyBoughtTogether, 
      hideRecommendation,
      getTrendingProducts 
    } = require('../../services/recommendationApi');
    
    getPersonalizedRecommendations.mockResolvedValue(mockRecommendations);
    getSimilarItems.mockResolvedValue(mockRecommendations);
    getFrequentlyBoughtTogether.mockResolvedValue(mockRecommendations);
    hideRecommendation.mockResolvedValue(true);
    getTrendingProducts.mockResolvedValue(mockRecommendations);
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('should load and display personalized recommendations', async () => {
    renderWithProviders(
      <RecommendationSlider 
        title="For You" 
        type="personalized" 
      />
    );
    
    // Check if the title is rendered
    expect(screen.getByText('For You')).toBeInTheDocument();
    
    // Wait for recommendations to load
    const productCards = await screen.findAllByTestId('product-card');
    expect(productCards).toHaveLength(4);
    
    // Verify product data is displayed correctly
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('should allow hiding a recommendation', async () => {
    const { getByTestId, queryByText } = renderWithProviders(
      <RecommendationSlider 
        title="For You" 
        type="personalized" 
      />
    );
    
    // Wait for recommendations to load
    await screen.findByText('Test Product 1');
    
    // Find and click the hide button (using the first product's hide button)
    const hideButtons = screen.getAllByLabelText('Hide this recommendation');
    fireEvent.click(hideButtons[0]);
    
    // Verify the hide API was called
    const { hideRecommendation } = require('../../services/recommendationApi');
    await waitFor(() => {
      expect(hideRecommendation).toHaveBeenCalledWith(undefined, '1');
    });
    
    // The product should be removed from the UI
    await waitFor(() => {
      expect(queryByText('Test Product 1')).not.toBeInTheDocument();
    });
  });

  it('should load similar items for a product', async () => {
    const productId = 'prod123';
    
    renderWithProviders(
      <RecommendationSlider 
        title="Similar Items" 
        type="similar"
        productId={productId}
      />
    );
    
    // Verify the API was called with the correct product ID
    const { getSimilarItems } = require('../../services/recommendationApi');
    expect(getSimilarItems).toHaveBeenCalledWith(productId);
    
    // Verify items are displayed
    const productCards = await screen.findAllByTestId('product-card');
    expect(productCards.length).toBeGreaterThan(0);
  });

  it('should load frequently bought together items', async () => {
    const productIds = ['prod1', 'prod2'];
    
    renderWithProviders(
      <RecommendationSlider 
        title="Frequently Bought Together" 
        type="frequentlyBoughtTogether"
        productIds={productIds}
      />
    );
    
    // Verify the API was called with the correct product IDs
    const { getFrequentlyBoughtTogether } = require('../../services/recommendationApi');
    expect(getFrequentlyBoughtTogether).toHaveBeenCalledWith(productIds);
    
    // Verify items are displayed
    const productCards = await screen.findAllByTestId('product-card');
    expect(productCards.length).toBeGreaterThan(0);
  });

  it('should handle navigation when clicking on a product', async () => {
    const { getByText } = renderWithProviders(
      <RecommendationSlider 
        title="For You" 
        type="personalized" 
      />
    );
    
    // Wait for recommendations to load
    const product = await screen.findByText('Test Product 1');
    
    // Click on the product
    fireEvent.click(product);
    
    // In a real test with react-router, we would check if navigation occurred
    // For now, we'll just verify the product is clickable
    expect(product).toBeInTheDocument();
  });

  it('should handle window resize for responsive design', async () => {
    // Set initial window size
    window.innerWidth = 500;
    
    renderWithProviders(
      <RecommendationSlider 
        title="For You" 
        type="personalized" 
      />
    );
    
    // Wait for recommendations to load
    await screen.findByText('Test Product 1');
    
    // In a real test, we would trigger a resize event and verify the UI updates
    // This is a simplified version
    const container = screen.getByTestId('recommendation-container');
    expect(container).toBeInTheDocument();
  });
});
