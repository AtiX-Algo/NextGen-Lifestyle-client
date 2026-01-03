import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function HomePage() {
  const { colors } = useTheme();
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${colors.text.primary}`}>
          Welcome to NextGen Lifestyle
        </h1>
        <p className={`text-xl mb-8 max-w-2xl mx-auto ${colors.text.secondary}`}>
          Discover our premium collection of lifestyle products designed for modern living.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            to="/products" 
            className={`px-8 py-3 rounded-lg font-medium ${colors.bg.primary} ${colors.text.primary} hover:opacity-90 transition-opacity`}
          >
            Shop Now
          </Link>
          <Link 
            to="/about" 
            className={`px-8 py-3 rounded-lg font-medium border ${colors.border.light} ${colors.text.primary} hover:bg-opacity-10 hover:bg-gray-500 transition-colors`}
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mb-16">
        <h2 className={`text-2xl font-bold mb-6 ${colors.text.primary}`}>Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Electronics', count: 42 },
            { name: 'Fashion', count: 38 },
            { name: 'Home & Living', count: 29 },
            { name: 'Accessories', count: 15 },
          ].map((category, index) => (
            <div 
              key={index}
              className={`p-6 rounded-xl border ${colors.border.light} ${colors.bg.card} hover:shadow-md transition-shadow`}
            >
              <h3 className={`text-lg font-semibold mb-2 ${colors.text.primary}`}>
                {category.name}
              </h3>
              <p className={`text-sm ${colors.text.secondary}`}>
                {category.count} products
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${colors.text.primary}`}>Featured Products</h2>
          <Link 
            to="/products" 
            className={`text-sm font-medium ${colors.text.primary} hover:underline`}
          >
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div 
              key={item}
              className={`rounded-xl overflow-hidden border ${colors.border.light} ${colors.bg.card} hover:shadow-md transition-shadow`}
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 animate-pulse"></div>
              <div className="p-4">
                <h3 className={`font-medium mb-1 ${colors.text.primary}`}>
                  Loading Product {item}
                </h3>
                <p className={`text-sm ${colors.text.secondary} mb-2`}>
                  Loading category
                </p>
                <div className="flex justify-between items-center">
                  <span className={`font-bold ${colors.text.primary}`}>$---</span>
                  <button 
                    className={`px-3 py-1 text-sm rounded-full ${colors.bg.primary} ${colors.text.primary} hover:opacity-90`}
                    disabled
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
