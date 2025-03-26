import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThankYouPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
        
        <p className="text-xl text-gray-700 mb-8">
          Your invoice request has been submitted successfully. Our sales team will review your request and get back to you shortly.
        </p>
        
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-4">What happens next?</h2>
          <ol className="text-left space-y-3">
            <li className="flex items-start">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
              <span>Our sales team will review your request within 1-2 business days.</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
              <span>You'll receive an email with your personalized invoice and product details.</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
              <span>A sales representative will contact you to discuss your requirements and answer any questions.</span>
            </li>
          </ol>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
          <Link to="/products">
            <Button variant="outline">Browse More Products</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}