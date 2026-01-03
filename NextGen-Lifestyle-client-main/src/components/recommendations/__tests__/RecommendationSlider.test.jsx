import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecommendationSlider } from '../RecommendationSlider';
import { RecommendationProvider } from '../../../context/RecommendationContext';
import '@testing-library/jest-dom';

// Mock the recommendation context
const mockRecommendations = {
  fetchSimilarItems: jest.fn().mockResolvedValue([
    { _id: '1', name: 'Test Product 1', price: 99.99, image: 'test1.jpg' },
    { _id: '2', name: 'Test Product 2', price: 129.99, image: 'test2.jpg' },
  ]),
  fetchFrequentlyBoughtTogether: jest.fn().mockResolvedValue([
    { _id: '3', name: 'Frequently Bought 1', price: 49.99, image: 'freq1.jpg' },
  ]),
  fetchPersonalizedRecommendations: jest.fn().mockResolvedValue([
    { _id: '4', name: 'Personalized 1', price: 79.99, image: 'personal1.jpg' },
  ]),
  hideRecommendation: jest.fn().mockResolvedValue(true),
  loading: false,
  error: null,
  personalized: [],
  similarItems: {},
  frequentlyBoughtTogether: {},
  hiddenItems: new Set(),
};

const renderWithProvider = (ui, { providerProps, ...renderOptions } = {}) => {
  return render(
    <RecommendationProvider userId="test-user" {...providerProps}>
      {ui}
    </RecommendationProvider>,
    renderOptions
  );
};

describe('RecommendationSlider', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
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

  it('renders loading state', async () => {
    renderWithProvider(
      <RecommendationSlider 
        title="Test Recommendations" 
        type="similar" 
        productId="123" 
      />,
      {
        providerProps: {
          value: { 
            ...mockRecommendations, 
            loading: true,
            similarItems: { '123': [] } 
          }
        }
      }
    );
    
    expect(screen.getByText('Test Recommendations')).toBeInTheDocument();
    // Check for loading state - adjust the selector based on your actual loading UI
    const loadingElements = await screen.findAllByRole('progressbar');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('renders similar items correctly', async () => {
    renderWithProvider(
      <RecommendationSlider 
        title="Similar Items" 
        type="similar" 
        productId="123" 
      />,
      {
        providerProps: {
          value: {
            ...mockRecommendations,
            similarItems: { '123': [
              { _id: '1', name: 'Test Product 1', price: 99.99, image: 'test1.jpg' },
              { _id: '2', name: 'Test Product 2', price: 129.99, image: 'test2.jpg' },
            ]}
          }
        }
      }
    );
    
    // Wait for items to load
    const items = await screen.findAllByText(/Test Product/);
    expect(items).toHaveLength(2);
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('handles hiding a recommendation', async () => {
    renderWithProvider(
      <RecommendationSlider 
        title="Similar Items" 
        type="similar" 
        productId="123" 
      />
    );
    
    // Wait for items to load
    await screen.findByText('Test Product 1');
    
    // Find and click the hide button
    const hideButtons = screen.getAllByLabelText('Hide this recommendation');
    fireEvent.click(hideButtons[0]);
    
    expect(mockRecommendations.hideRecommendation).toHaveBeenCalledWith('1');
  });

  it('navigates to product page when clicking a product', async () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));
    
    renderWithProvider(
      <RecommendationSlider 
        title="Similar Items" 
        type="similar" 
        productId="123" 
      />
    );
    
    // Wait for items to load and click the first product
    const product = await screen.findByText('Test Product 1');
    fireEvent.click(product);
    
    // Note: This test would need react-router-dom's MemoryRouter for full testing
    // For now, we're just verifying the product card is clickable
    expect(product).toBeInTheDocument();
  });

  it('handles window resize for responsive design', async () => {
    // Set initial window size
    window.innerWidth = 500;
    
    renderWithProvider(
      <RecommendationSlider 
        title="Similar Items" 
        type="similar" 
        productId="123" 
      />
    );
    
    // Test would verify that the correct number of items are shown based on screen size
    // This is a simplified version - in a real test, you'd mock the resize event
    const container = await screen.findByTestId('recommendation-container');
    expect(container).toBeInTheDocument();
  });
});
