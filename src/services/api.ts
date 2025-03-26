import { Product, InvoiceRequest, User, Category } from "@/types";

// Mock data for products
const products: Product[] = [
  {
    id: "1",
    name: "Heavy Duty Excavator XL2000",
    category: "excavators",
    description: "The XL2000 is a powerful excavator designed for the most demanding construction and mining projects. With its robust build and advanced hydraulic system, it offers exceptional digging power and precision control.",
    features: [
      "Powerful 200 HP diesel engine",
      "Advanced hydraulic system for precise control",
      "Spacious, climate-controlled cabin with ergonomic controls",
      "Heavy-duty undercarriage for stability on rough terrain",
      "Integrated telematics system for remote monitoring"
    ],
    specifications: {
      "Engine": "Cummins QSB6.7, 200 HP",
      "Operating Weight": "22,000 kg",
      "Max Digging Depth": "6.5 meters",
      "Bucket Capacity": "1.2 cubic meters",
      "Fuel Tank Capacity": "400 liters",
      "Max Reach": "9.8 meters"
    },
    images: [
      "/images/products/excavator-1.jpg",
      "/images/products/excavator-2.jpg",
      "/images/products/excavator-3.jpg"
    ],
    mainImage: "/images/products/excavator-1.jpg",
    inStock: true,
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-05-20T14:15:00Z"
  },
  {
    id: "2",
    name: "Wheel Loader Pro 500",
    category: "loaders",
    description: "The Pro 500 wheel loader combines power and efficiency for optimal material handling. Its articulated steering and powerful engine make it perfect for construction sites, quarries, and industrial applications.",
    features: [
      "Fuel-efficient 180 HP engine with eco mode",
      "Articulated steering for tight turning radius",
      "Quick-attach system for easy implement changes",
      "Advanced weighing system for load management",
      "Reinforced Z-bar linkage for high breakout force"
    ],
    specifications: {
      "Engine": "Volvo D8J, 180 HP",
      "Operating Weight": "18,500 kg",
      "Bucket Capacity": "3.1 cubic meters",
      "Breakout Force": "162 kN",
      "Tipping Load": "12,400 kg",
      "Max Speed": "38 km/h"
    },
    images: [
      "/images/products/loader-1.jpg",
      "/images/products/loader-2.jpg",
      "/images/products/loader-3.jpg"
    ],
    mainImage: "/images/products/loader-1.jpg",
    inStock: true,
    createdAt: "2023-02-10T09:45:00Z",
    updatedAt: "2023-06-05T11:20:00Z"
  },
  {
    id: "3",
    name: "Articulated Dump Truck ADT-40",
    category: "trucks",
    description: "The ADT-40 articulated dump truck is designed for heavy-duty hauling in challenging off-road conditions. With its all-wheel drive and articulated steering, it can navigate difficult terrain while carrying substantial loads.",
    features: [
      "All-wheel drive for superior traction",
      "Articulated steering for maneuverability",
      "High-capacity dump body with heated floor",
      "Automatic traction control system",
      "Advanced suspension for operator comfort"
    ],
    specifications: {
      "Engine": "CAT C15, 450 HP",
      "Payload Capacity": "40 tonnes",
      "Body Volume": "24 cubic meters",
      "Max Speed": "55 km/h",
      "Fuel Tank": "600 liters",
      "Turning Radius": "8.5 meters"
    },
    images: [
      "/images/products/dump-truck-1.jpg",
      "/images/products/dump-truck-2.jpg",
      "/images/products/dump-truck-3.jpg"
    ],
    mainImage: "/images/products/dump-truck-1.jpg",
    inStock: false,
    createdAt: "2023-03-05T13:20:00Z",
    updatedAt: "2023-07-12T10:10:00Z"
  },
  {
    id: "4",
    name: "Mobile Crusher MC800",
    category: "crushers",
    description: "The MC800 mobile crusher is a versatile and powerful solution for on-site crushing operations. Its track-mounted design allows for easy relocation, while its robust crushing chamber handles a wide range of materials.",
    features: [
      "Track-mounted for site mobility",
      "High-capacity crushing chamber",
      "Diesel-electric power system for efficiency",
      "Automated control system with remote monitoring",
      "Integrated dust suppression system"
    ],
    specifications: {
      "Engine": "Scania DC13, 450 HP",
      "Crusher Type": "Jaw Crusher",
      "Feed Size": "Up to 800mm",
      "Output Size": "0-200mm adjustable",
      "Processing Capacity": "Up to 650 tonnes/hour",
      "Weight": "45,000 kg"
    },
    images: [
      "/images/products/crusher-1.jpg",
      "/images/products/crusher-2.jpg",
      "/images/products/crusher-3.jpg"
    ],
    mainImage: "/images/products/crusher-1.jpg",
    inStock: true,
    createdAt: "2023-04-20T08:15:00Z",
    updatedAt: "2023-08-03T16:40:00Z"
  },
  {
    id: "5",
    name: "Crawler Dozer D9T",
    category: "dozers",
    description: "The D9T crawler dozer delivers superior pushing power and ripping performance in the toughest applications. Its elevated sprocket design and robust undercarriage provide excellent durability and component life.",
    features: [
      "Powerful engine with high torque rise",
      "Elevated sprocket design for better balance",
      "Electro-hydraulic controls for precise operation",
      "Integrated GPS system for grade control",
      "Heavy-duty undercarriage with long track life"
    ],
    specifications: {
      "Engine": "CAT C18 ACERT, 410 HP",
      "Operating Weight": "49,000 kg",
      "Blade Capacity": "13.5 cubic meters",
      "Max Forward Speed": "11.6 km/h",
      "Ground Pressure": "99 kPa",
      "Drawbar Pull": "640 kN"
    },
    images: [
      "/images/products/dozer-1.jpg",
      "/images/products/dozer-2.jpg",
      "/images/products/dozer-3.jpg"
    ],
    mainImage: "/images/products/dozer-1.jpg",
    inStock: true,
    createdAt: "2023-05-12T11:30:00Z",
    updatedAt: "2023-09-08T09:25:00Z"
  },
  {
    id: "6",
    name: "Hydraulic Breaker HB2000",
    category: "attachments",
    description: "The HB2000 hydraulic breaker is designed for efficient demolition and rock breaking. Compatible with a wide range of excavators, it delivers high impact energy with low noise and vibration levels.",
    features: [
      "High impact energy with variable strike rate",
      "Noise and vibration dampening system",
      "Auto-lubrication system for reduced maintenance",
      "Blank firing protection to prevent damage",
      "Underwater operation capability"
    ],
    specifications: {
      "Impact Energy": "6,000 joules",
      "Weight": "2,000 kg",
      "Carrier Weight Range": "20-30 tonnes",
      "Oil Flow Requirement": "150-190 l/min",
      "Operating Pressure": "160-180 bar",
      "Strike Rate": "300-600 bpm"
    },
    images: [
      "/images/products/breaker-1.jpg",
      "/images/products/breaker-2.jpg",
      "/images/products/breaker-3.jpg"
    ],
    mainImage: "/images/products/breaker-1.jpg",
    inStock: true,
    createdAt: "2023-06-25T14:50:00Z",
    updatedAt: "2023-10-15T13:35:00Z"
  }
];

// Mock data for categories
const categories: Category[] = [
  {
    id: "1",
    name: "Excavators",
    slug: "excavators",
    description: "Powerful digging machines for construction and mining",
    productCount: 1
  },
  {
    id: "2",
    name: "Wheel Loaders",
    slug: "loaders",
    description: "Versatile machines for material handling and loading",
    productCount: 1
  },
  {
    id: "3",
    name: "Dump Trucks",
    slug: "trucks",
    description: "Heavy-duty hauling vehicles for construction and mining",
    productCount: 1
  },
  {
    id: "4",
    name: "Crushers",
    slug: "crushers",
    description: "Machines for reducing large rocks into smaller rocks or gravel",
    productCount: 1
  },
  {
    id: "5",
    name: "Dozers",
    slug: "dozers",
    description: "Powerful machines for earth moving and grading",
    productCount: 1
  },
  {
    id: "6",
    name: "Attachments",
    slug: "attachments",
    description: "Various tools and implements for heavy machinery",
    productCount: 1
  }
];

// Mock data for invoice requests
const invoiceRequests: InvoiceRequest[] = [
  {
    id: "1",
    productId: "1",
    productName: "Heavy Duty Excavator XL2000",
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    customerPhone: "+1 234-567-8901",
    companyName: "Smith Construction Ltd",
    message: "I'm interested in purchasing two units for our new construction project. Please provide a detailed quote including delivery options to our site in Chicago.",
    status: "pending",
    createdAt: "2023-10-15T09:23:00Z"
  },
  {
    id: "2",
    productId: "3",
    productName: "Articulated Dump Truck ADT-40",
    customerName: "Maria Rodriguez",
    customerEmail: "m.rodriguez@example.com",
    customerPhone: "+1 345-678-9012",
    companyName: "Rodriguez Mining Corp",
    message: "We need pricing for a fleet of 5 trucks. Also interested in service contracts and parts availability.",
    status: "processed",
    createdAt: "2023-10-10T14:15:00Z"
  },
  {
    id: "3",
    productId: "5",
    productName: "Crawler Dozer D9T",
    customerName: "David Chen",
    customerEmail: "d.chen@example.com",
    customerPhone: "+1 456-789-0123",
    companyName: "Chen Earthworks",
    message: "Looking for leasing options for this dozer. Can you provide details on warranty and maintenance packages?",
    status: "rejected",
    createdAt: "2023-10-05T11:30:00Z"
  }
];

// Mock data for users
const users: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@amarisco.com",
    role: "admin",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Sales Staff",
    email: "sales@amarisco.com",
    role: "staff",
    createdAt: "2023-01-02T00:00:00Z",
    updatedAt: "2023-01-02T00:00:00Z"
  }
];

// API functions
export const api = {
  // Product functions
  getProducts: async (): Promise<Product[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...products];
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return products.find(product => product.id === id);
  },

  getProductsByCategory: async (categorySlug: string): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return products.filter(product => product.category === categorySlug);
  },

  createProduct: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newProduct: Product = {
      ...product,
      id: `${products.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    products.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return products[index];
    }
    return undefined;
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) {
      products.splice(index, 1);
      return true;
    }
    return false;
  },

  // Category functions
  getCategories: async (): Promise<Category[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...categories];
  },

  getCategoryBySlug: async (slug: string): Promise<Category | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return categories.find(category => category.slug === slug);
  },

  // Invoice request functions
  getInvoiceRequests: async (): Promise<InvoiceRequest[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...invoiceRequests];
  },

  getInvoiceRequestById: async (id: string): Promise<InvoiceRequest | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return invoiceRequests.find(request => request.id === id);
  },

  createInvoiceRequest: async (request: Omit<InvoiceRequest, 'id' | 'status' | 'createdAt'>): Promise<InvoiceRequest> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newRequest: InvoiceRequest = {
      ...request,
      id: `${invoiceRequests.length + 1}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    invoiceRequests.push(newRequest);
    return newRequest;
  },

  updateInvoiceRequestStatus: async (id: string, status: 'pending' | 'processed' | 'rejected'): Promise<InvoiceRequest | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = invoiceRequests.findIndex(request => request.id === id);
    if (index !== -1) {
      invoiceRequests[index] = {
        ...invoiceRequests[index],
        status
      };
      return invoiceRequests[index];
    }
    return undefined;
  },

  // User functions
  getUsers: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...users];
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return users.find(user => user.id === id);
  },

  createUser: async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newUser: User = {
      ...user,
      id: `${users.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users[index] = {
        ...users[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return users[index];
    }
    return undefined;
  },

  deleteUser: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users.splice(index, 1);
      return true;
    }
    return false;
  }
};