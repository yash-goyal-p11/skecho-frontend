import { Button } from "@/components/ui/button";
import { User, ShoppingCart, Search, LogOut, Palette, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/lib/CartContext";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { Menu } from "lucide-react";
import React from "react";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-skecho-coral/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-w-0">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-skecho-coral rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold text-skecho-charcoal">
              Skecho
            </span>
          </Link>

          {/* Hamburger menu for mobile */}
          <button
            className="md:hidden p-2 rounded focus:outline-none"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            {/* Drawer content: logo, nav links, actions, etc. */}
            <div className="flex flex-col gap-6 mt-4 px-4">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-skecho-coral rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-2xl font-bold text-skecho-coral">Skecho</span>
              </Link>
              {/* Nav links */}
              <Link to="/browse" className="text-gray-700 hover:text-skecho-coral-dark text-lg" onClick={() => setDrawerOpen(false)}>
                Browse
              </Link>
              <Link to="/artists" className="text-gray-700 hover:text-skecho-coral-dark text-lg" onClick={() => setDrawerOpen(false)}>
                Artists
              </Link>
              {/* Seller Dashboard and Profile (if logged in) */}
              {user && (
                <>
                  <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-skecho-coral-dark text-lg" onClick={() => setDrawerOpen(false)}>
                    Seller Dashboard
                  </Link>
                  <Link to="/edit-profile" className="flex items-center gap-2 text-gray-700 hover:text-skecho-coral-dark text-lg" onClick={() => setDrawerOpen(false)}>
                    Profile
                  </Link>
                </>
              )}
              {/* Actions */}
              <Link to="/cart" className="flex items-center gap-2 text-gray-700 hover:text-skecho-coral-dark text-lg" onClick={() => setDrawerOpen(false)}>
                Cart
              </Link>
              <Link to="/my-orders" className="flex items-center gap-2 text-gray-700 hover:text-skecho-coral-dark text-lg" onClick={() => setDrawerOpen(false)}>
                My Orders
              </Link>
              {/* Show 'Join as Artist' only if not already a seller */}
              {user && (
                <Link to="/complete-seller-profile" onClick={() => setDrawerOpen(false)}>
                  <Button className="bg-skecho-coral hover:bg-skecho-coral-dark text-white w-full max-w-xs mx-auto">
                    Join as Artist
                  </Button>
                </Link>
              )}
              {/* Logout button if logged in */}
              {user && (
                <Button
                  variant="outline"
                  className="w-full max-w-xs mx-auto mt-4 flex items-center gap-2 justify-center"
                  onClick={async () => {
                    await signOut();
                    setDrawerOpen(false);
                    navigate("/");
                  }}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </SideDrawer>

          {/* Search (desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg min-w-0">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search artworks, artists..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-skecho-coral focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation Links (desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/browse" className="text-gray-700 hover:text-skecho-coral-dark transition-colors">
              Browse Art
            </Link>
            <Link to="/artists" className="text-gray-700 hover:text-skecho-coral-dark transition-colors">
              Artists
            </Link>
          </div>

          {/* Action Buttons (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-skecho-coral text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-skecho-coral-light/50">
                      <span className="text-gray-700 mr-2">
                        {user.displayName || user.email}
                      </span>
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {location.pathname != "/dashboard" && <DropdownMenuItem>
                      <Link to="/dashboard" className="flex items-center w-full">
                        <Palette className="w-4 h-4 mr-2" />
                        Switch to Seller
                      </Link>
                    </DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link to="/edit-profile" className="flex items-center w-full">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to="/my-orders" className="flex items-center w-full">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>

                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="ghost" size="sm" className="hover:bg-skecho-coral-light/50">
                    <User className="w-5 h-5 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/signin">
                  <Button className="bg-skecho-coral hover:bg-skecho-coral-dark text-white max-w-xs truncate md:w-auto md:max-w-none">
                    Join as Artist
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
