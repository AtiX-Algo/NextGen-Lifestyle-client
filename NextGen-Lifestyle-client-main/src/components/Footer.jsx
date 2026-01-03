import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-base-200 mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-xl font-bold">
              NextGen Lifestyle
            </Link>
            <p className="text-sm text-gray-600 mt-1">© {new Date().getFullYear()} All rights reserved</p>
          </div>
          <div className="flex space-x-4">
            <Link to="/about" className="hover:text-primary">About</Link>
            <Link to="/contact" className="hover:text-primary">Contact</Link>
            <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
