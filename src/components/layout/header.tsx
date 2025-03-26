import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/images/logo.png" alt="Amaris Co. Ltd" className="h-10" />
          <span className="text-xl font-bold text-primary">Amaris Co. Ltd</span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-primary font-medium">
            Home
          </Link>
          <Link to="/products" className="text-gray-700 hover:text-primary font-medium">
            Products
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-primary font-medium">
            About Us
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-primary font-medium">
            Contact
          </Link>
          <Link to="/admin/login">
            <Button variant="outline" size="sm">
              Admin Login
            </Button>
          </Link>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-2 flex flex-col space-y-3">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary font-medium py-2"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-700 hover:text-primary font-medium py-2"
              onClick={toggleMenu}
            >
              Products
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-primary font-medium py-2"
              onClick={toggleMenu}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-primary font-medium py-2"
              onClick={toggleMenu}
            >
              Contact
            </Link>
            <Link to="/admin/login" onClick={toggleMenu}>
              <Button variant="outline" size="sm" className="w-full">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}