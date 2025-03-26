import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Filter, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";
import { Product, Category } from "@/types";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const categoryParam = searchParams.get("category");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let fetchedProducts: Product[];
        
        if (categoryParam) {
          fetchedProducts = await api.getProductsByCategory(categoryParam);
        } else {
          fetchedProducts = await api.getProducts();
        }
        
        const allCategories = await api.getCategories();
        
        setProducts(fetchedProducts);
        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categoryParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter products by search term
    if (searchTerm.trim()) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProducts(filtered);
    } else {
      // If search is cleared, reset to all products or category filtered products
      const fetchData = async () => {
        if (categoryParam) {
          const fetchedProducts = await api.getProductsByCategory(categoryParam);
          setProducts(fetchedProducts);
        } else {
          const fetchedProducts = await api.getProducts();
          setProducts(fetchedProducts);
        }
      };
      fetchData();
    }
  };

  const handleCategoryFilter = (categorySlug: string) => {
    setSearchParams({ category: categorySlug });
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchTerm("");
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
            onClick={toggleFilters}
          >
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              <span>Filters</span>
            </div>
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Sidebar Filters */}
        <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <div className="space-y-2">
              <button
                onClick={clearFilters}
                className={`w-full text-left px-3 py-2 rounded-md ${!categoryParam ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.slug)}
                  className={`w-full text-left px-3 py-2 rounded-md ${categoryParam === category.slug ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {categoryParam && (
              <Button
                variant="ghost"
                className="mt-4 text-sm"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="lg:w-3/4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6 flex gap-2">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-none shadow-lg animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="pt-6">
                    <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                    <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="border-none shadow-lg product-card">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 line-clamp-2 mb-4">
                      {product.description}
                    </p>
                    <Link to={`/products/${product.id}`}>
                      <Button className="w-full">View Details</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any products matching your criteria.
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}