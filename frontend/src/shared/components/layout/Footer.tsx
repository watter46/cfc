import React from "react";
import { Github, Twitter, Instagram } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-space-900 border-t border-space-700 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-neon-blue">
              CFC<span className="text-neon-green">Rating</span>
            </h3>
            <p className="text-gray-400 max-w-md">
              The ultimate platform for soccer fans to rate player performances
              and share their insights on matches.
            </p>

            <div className="flex space-x-4 mt-4">
              <a
                href="#"
                className="text-gray-400 hover:text-neon-blue transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-neon-blue transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-neon-blue transition-colors"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-200">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-400 hover:text-neon-blue transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/matches"
                  className="text-gray-400 hover:text-neon-blue transition-colors"
                >
                  Matches
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="text-gray-400 hover:text-neon-blue transition-colors"
                >
                  Login
                </a>
              </li>
              <li>
                <a
                  href="/register"
                  className="text-gray-400 hover:text-neon-blue transition-colors"
                >
                  Register
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-200">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-neon-blue transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-neon-blue transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-neon-blue transition-colors"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-space-700 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} CFCRating. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
