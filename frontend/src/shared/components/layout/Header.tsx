import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { LogOut, User, Menu, X } from "lucide-react";

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-space-900/95 backdrop-blur-sm border-b border-space-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left side */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-neon-blue font-bold text-2xl sm:text-3xl tracking-wider hover:text-neon-purple transition-colors">
                CFC<span className="text-neon-green">Rating</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Matches link */}
                <Link
                  to="/matches"
                  className="px-3 py-2 text-gray-300 hover:text-neon-blue transition-colors font-medium"
                >
                  試合一覧
                </Link>

                {/* User info */}
                <div className="flex items-center space-x-3">
                  <span className="text-gray-300 text-sm">
                    こんにちは、
                    <span className="text-neon-blue font-medium">
                      {user?.name}
                    </span>
                    さん
                  </span>
                </div>

                {/* Profile button */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-300 hover:text-neon-blue hover:bg-space-800/50 transition-all duration-200"
                >
                  <User size={18} />
                  <span>プロフィール</span>
                </Link>

                {/* Auth Test button */}
                <Link
                  to="/auth-test"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-300 hover:text-neon-purple hover:bg-space-800/50 transition-all duration-200"
                >
                  <span>🔧</span>
                  <span>認証テスト</span>
                </Link>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-300 hover:text-neon-red hover:bg-space-800/50 transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span>ログアウト</span>
                </button>
              </>
            ) : (
              <>
                {/* Login button */}
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-300 hover:text-neon-blue transition-colors font-medium"
                >
                  ログイン
                </Link>

                {/* Sign up button */}
                <Link
                  to="/register"
                  className="btn btn-primary px-4 py-2 text-sm font-medium bg-neon-blue hover:bg-neon-purple text-white rounded-md transition-all duration-200 shadow-lg hover:shadow-neon-blue"
                >
                  サインアップ
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-300 hover:text-neon-blue hover:bg-space-800/50 transition-all duration-200"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-space-700/50 bg-space-900/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated ? (
                <>
                  {/* User info mobile */}
                  <div className="px-3 py-2 text-gray-300 text-sm border-b border-space-700/50 mb-2">
                    こんにちは、
                    <span className="text-neon-blue font-medium">
                      {user?.name}
                    </span>
                    さん
                  </div>

                  {/* Matches link mobile */}
                  <Link
                    to="/matches"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-gray-300 hover:text-neon-blue hover:bg-space-800/50 transition-all duration-200"
                  >
                    試合一覧
                  </Link>

                  {/* Profile link mobile */}
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-300 hover:text-neon-blue hover:bg-space-800/50 transition-all duration-200"
                  >
                    <User size={18} />
                    <span>プロフィール</span>
                  </Link>

                  {/* Logout button mobile */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-gray-300 hover:text-neon-red hover:bg-space-800/50 transition-all duration-200"
                  >
                    <LogOut size={18} />
                    <span>ログアウト</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Login link mobile */}
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-gray-300 hover:text-neon-blue hover:bg-space-800/50 transition-all duration-200"
                  >
                    ログイン
                  </Link>

                  {/* Sign up link mobile */}
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 bg-neon-blue hover:bg-neon-purple text-white rounded-md transition-all duration-200 text-center font-medium"
                  >
                    サインアップ
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
