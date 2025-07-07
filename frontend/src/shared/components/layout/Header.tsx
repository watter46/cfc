import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { Menu, X } from "lucide-react";

const Header: React.FC = () => {
  const { isAuthenticated, signout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 32) {
        setIsHeaderVisible(true);
        lastScrollY.current = currentY;
        return;
      }
      if (currentY > lastScrollY.current) {
        // Down: 隠す
        setIsHeaderVisible(false);
      } else if (currentY < lastScrollY.current) {
        // Up: 表示
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignout = async () => {
    try {
      await signout();
      navigate("/");
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Signout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`bg-space-900/95 backdrop-blur-sm border-b border-space-700/50 sticky top-0 z-50 transition-transform duration-300 ${
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left side */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0" aria-label="ホームへ戻る">
              <span className="text-neon-blue font-bold text-2xl sm:text-3xl tracking-wider hover:text-neon-purple transition-colors">
                CFC<span className="text-neon-green">Rating</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Right side */}
          <nav
            className="hidden md:flex items-center space-x-4"
            aria-label="メインナビゲーション"
            role="navigation"
          >
            {isAuthenticated ? (
              <div className="flex space-x-4">
                <Link
                  to="/matches"
                  className="text-neon-blue hover:text-neon-purple"
                >
                  Matches
                </Link>
                <Link
                  to="/profile"
                  className="text-neon-green hover:text-neon-purple"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignout}
                  className="text-neon-red hover:text-neon-purple"
                >
                  Signout
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/signin"
                  className="text-neon-blue hover:text-neon-purple"
                >
                  Signin
                </Link>
                <Link
                  to="/signup"
                  className="text-neon-green hover:text-neon-purple"
                >
                  Signup
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-300 hover:text-neon-blue hover:bg-space-800/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue"
              aria-label={
                isMobileMenuOpen ? "メニューを閉じる" : "メニューを開く"
              }
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <nav
            id="mobile-menu"
            className="md:hidden border-t border-space-700/50 bg-space-900/95 backdrop-blur-sm"
            aria-label="モバイルナビゲーション"
            role="navigation"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link
                    to="/matches"
                    onClick={handleMobileItemClick}
                    className="block text-neon-blue hover:text-neon-purple"
                  >
                    Matches
                  </Link>
                  <Link
                    to="/profile"
                    onClick={handleMobileItemClick}
                    className="block text-neon-green hover:text-neon-purple"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignout}
                    className="block text-neon-red hover:text-neon-purple"
                  >
                    Signout
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/signin"
                    onClick={handleMobileItemClick}
                    className="block text-neon-blue hover:text-neon-purple"
                  >
                    Signin
                  </Link>
                  <Link
                    to="/signup"
                    onClick={handleMobileItemClick}
                    className="block text-neon-green hover:text-neon-purple"
                  >
                    Signup
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
