
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 min-w-0">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-2xl font-bold text-white">Skecho</span>
            </div>
            <p className="text-gray-400 max-w-xs">
              Connecting art lovers with independent artists worldwide. Discover unique pieces and commission custom artwork.
            </p>
          </div>

          {/* For Buyers */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Buyers</h3>
            <ul className="space-y-2">
              <li><Link to="/browse" className="hover:text-purple-400 transition-colors">Browse Artworks</Link></li>
              <li><Link to="/artists" className="hover:text-purple-400 transition-colors">Discover Artists</Link></li>
              <li><Link to="/custom" className="hover:text-purple-400 transition-colors">Commission Custom Art</Link></li>
              <li><Link to="/how-it-works" className="hover:text-purple-400 transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* For Artists */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Artists</h3>
            <ul className="space-y-2">
              <li><Link to="/sell" className="hover:text-purple-400 transition-colors">Start Selling</Link></li>
              <li><Link to="/seller-guide" className="hover:text-purple-400 transition-colors">Seller Guide</Link></li>
              <li><Link to="/pricing" className="hover:text-purple-400 transition-colors">Pricing</Link></li>
              <li><Link to="/success-stories" className="hover:text-purple-400 transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="hover:text-purple-400 transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-purple-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/safety" className="hover:text-purple-400 transition-colors">Trust & Safety</Link></li>
              <li><Link to="/terms" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center min-w-0">
          <p className="text-gray-400">&copy; 2024 Skecho. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors">Privacy Policy</Link>
            <Link to="/cookies" className="text-gray-400 hover:text-purple-400 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
