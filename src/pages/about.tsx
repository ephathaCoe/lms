import { Building, Users, Award, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About Amaris Co. Ltd</h1>
        
        <div className="prose max-w-none">
          <p className="text-lg mb-6">
            Amaris Co. Ltd is a leading provider of heavy machinery and equipment for construction, mining, and industrial applications. With over 20 years of experience in the industry, we have established ourselves as a trusted partner for businesses worldwide.
          </p>
          
          <div className="my-12 relative">
            <img
              src="/images/about-banner.jpg"
              alt="Amaris Co. Ltd Headquarters"
              className="w-full h-80 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end">
              <div className="p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
                <p className="text-white/90">
                  To provide high-quality, reliable machinery that empowers businesses to achieve their goals efficiently and safely.
                </p>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="mb-6">
            Founded in 2003, Amaris Co. Ltd began as a small equipment rental company serving local construction businesses. Over the years, we expanded our operations to include sales, maintenance, and global distribution of heavy machinery from the world's leading manufacturers.
          </p>
          <p className="mb-6">
            Today, we operate in over 30 countries, with a team of 500+ professionals dedicated to providing exceptional service and support to our clients. Our extensive inventory includes excavators, loaders, dozers, trucks, crushers, and various specialized equipment for different industries.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Building className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Our Headquarters</h3>
              <p>
                Located in the heart of the industrial district, our headquarters houses our main showroom, administrative offices, and technical support center. The facility spans over 50,000 square feet and showcases our latest machinery offerings.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Our Team</h3>
              <p>
                Our diverse team includes industry experts, engineers, sales professionals, and customer support specialists. With decades of combined experience, they provide knowledgeable guidance and solutions tailored to each client's unique needs.
              </p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Our Values</h2>
          <ul className="space-y-4 mb-8">
            <li className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-4 mt-1">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Quality</h3>
                <p>We partner only with reputable manufacturers and conduct rigorous quality checks on all our machinery.</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-4 mt-1">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Customer Focus</h3>
                <p>We prioritize understanding our clients' needs and providing solutions that help them succeed.</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-4 mt-1">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Global Perspective</h3>
                <p>We embrace diversity and adapt our offerings to meet the unique requirements of different markets worldwide.</p>
              </div>
            </li>
          </ul>
          
          <h2 className="text-2xl font-bold mb-4">Our Commitment</h2>
          <p className="mb-6">
            At Amaris Co. Ltd, we are committed to:
          </p>
          <ul className="list-disc pl-6 mb-8">
            <li className="mb-2">Providing machinery that meets the highest standards of quality and reliability</li>
            <li className="mb-2">Offering comprehensive after-sales support and maintenance services</li>
            <li className="mb-2">Continuously updating our inventory with the latest technological advancements</li>
            <li className="mb-2">Building long-term relationships with our clients based on trust and mutual success</li>
            <li>Promoting sustainable practices in the heavy machinery industry</li>
          </ul>
          
          <div className="bg-gray-50 p-6 rounded-lg my-8">
            <h2 className="text-2xl font-bold mb-4">Join Our Network</h2>
            <p className="mb-4">
              Whether you're a construction company looking for reliable equipment, a mining operation seeking specialized machinery, or an industrial facility in need of material handling solutions, Amaris Co. Ltd is your trusted partner.
            </p>
            <p>
              Contact our team today to discuss how we can support your business goals with our extensive range of heavy machinery and expert services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}