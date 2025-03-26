import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Truck, Shield, Tool, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/seo/seo";
import { OrganizationSchema } from "@/components/seo/organization-schema";
import { api } from "@/services/api";
import { Product, Category } from "@/types";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const allProducts = await api.getProducts();
        const allCategories = await api.getCategories();
        
        // Get 3 random products as featured
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        setFeaturedProducts(shuffled.slice(0, 3));
        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <SEO 
        title="Premium Heavy Machinery for Construction & Mining"
        description="Amaris Co. Ltd provides high-quality heavy machinery for construction, mining, and industrial applications with global delivery and expert support."
        keywords="heavy machinery, construction equipment, excavators, wheel loaders, mining equipment, industrial machinery, dozers"
        canonicalUrl="https://amarisco.com/"
      />
      
      <OrganizationSchema />
      
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="hero-section py-20 md:py-32 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Premium Heavy Machinery for Your Business
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Amaris Co. Ltd provides high-quality heavy machinery for construction, mining, and industrial applications.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/products">
                <Button size="lg" className="text-lg px-8">
                  View Products
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white hover:text-gray-900">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Rest of the component remains unchanged */}
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Amaris Co. Ltd</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-none shadow-lg">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Truck className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Global Delivery</h3>
                  <p className="text-gray-600">
                    We deliver our machinery worldwide with professional logistics solutions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
                  <p className="text-gray-600">
                    All our products come with extensive warranties and quality assurance.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Tool className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
                  <p className="text-gray-600">
                    Our team of specialists provides ongoing technical support and maintenance.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Flexible Financing</h3>
                  <p className="text-gray-600">
                    We offer various financing options to suit your business needs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Link to="/products" className="text-primary flex items-center hover:underline">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{[1, 2, 3].map((i) => (
                  <Card key={i} className="border-none shadow-lg animate-pulse">
                    <div className="h-64 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="pt-6">
                      <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                      <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.map((product) => (
                  <Card key={product.id} className="border-none shadow-lg product-card">
                    <div className="h-64 overflow-hidden">
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
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.slug}`}
                  className="group block bg-gray-100 rounded-lg p-6 transition-all hover:bg-primary hover:text-white"
                >
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-white">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 group-hover:text-white/80">
                    {category.description}
                  </p>
                  <div className="mt-4 flex items-center text-primary group-hover:text-white">
                    <span>View Products</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Equip Your Business?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Contact our sales team for personalized quotes and expert advice on the best machinery for your needs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white hover:text-primary">
                  Contact Sales Team
                </Button>
              </Link>
              <Link to="/request-invoice">
                <Button size="lg" className="text-lg px-8 bg-white text-primary hover:bg-gray-100">
                  Request an Invoice
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}