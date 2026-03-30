
export const initialCategories = [
  "T-Shirts", "Casual Shirts", "Formal Shirts", "Jeans", "Trousers", "Hoodies", 
  "Jackets", "Shorts", "Blazers", "Ethnic Wear", "Men's Dresses", "Footwear", "Accessories"
];

const colors = ["Black", "White", "Navy", "Grey", "Olive", "Beige", "Burgundy", "Royal Blue"];

const sizes: { [key: string]: string[] } = {
  "T-Shirts": ["S", "M", "L", "XL", "XXL"],
  "Casual Shirts": ["S", "M", "L", "XL", "XXL"],
  "Formal Shirts": ["S", "M", "L", "XL", "XXL"],
  "Jeans": ["30", "32", "34", "36", "38"],
  "Trousers": ["30", "32", "34", "36", "38"],
  "Hoodies": ["S", "M", "L", "XL"],
  "Jackets": ["M", "L", "XL", "XXL"],
  "Shorts": ["30", "32", "34", "36"],
  "Ethnic Wear": ["M", "L", "XL", "XXL"],
  "Men's Dresses": ["S", "M", "L", "XL"],
  "Blazers": ["38", "40", "42", "44", "46"],
  "Footwear": ["7", "8", "9", "10", "11", "12"],
  "Accessories": ["One Size"]
};

const images: { [key: string]: string[] } = {
  "T-Shirts": [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"
  ],
  "Casual Shirts": [
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1550246140-5119ae4790b8?auto=format&fit=crop&w=800&q=80"
  ],
  "Formal Shirts": [
    "https://images.unsplash.com/photo-1603252109303-2751441dd15e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1594932224828-b4b059b6f6ee?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1621072156002-e2fcced0b170?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80"
  ],
  "Jeans": [
    "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1604176354204-926873ff34b1?auto=format&fit=crop&w=800&q=80"
  ],
  "Trousers": [
    "https://images.unsplash.com/photo-1624371414361-e67094c24962?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80"
  ],
  "Hoodies": [
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80"
  ],
  "Jackets": [
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80"
  ],
  "Shorts": [
    "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1565041714845-a05952214d39?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1591258370814-01609b341790?auto=format&fit=crop&w=800&q=80"
  ],
  "Ethnic Wear": [
    "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1617114919297-3c8ddb01f599?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583313261122-995bc52830ec?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1610173826014-938887850550?auto=format&fit=crop&w=800&q=80"
  ],
  "Men's Dresses": [
    "https://images.unsplash.com/photo-1598532213005-52257b32b1c2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1621430259841-396590204732?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583313261122-995bc52830ec?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=800&q=80"
  ],
  "Blazers": [
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1594932224828-b4b059b6f6ee?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1598808503742-dd34bd039277?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1592844002373-a55299496660?auto=format&fit=crop&w=800&q=80"
  ],
  "Footwear": [
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80"
  ],
  "Accessories": [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1511499767390-903390e62bc0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1509100104048-73c894704bea?auto=format&fit=crop&w=800&q=80"
  ]
};

const productNames: { [key: string]: string[] } = {
  "T-Shirts": ["Essential Crew Neck", "V-Neck Cotton Tee", "Graphic Print Tee", "Oversized Streetwear Tee", "Premium Pima Cotton Tee", "Striped Summer Tee", "Pocket Detail Tee", "Vintage Wash Tee"],
  "Casual Shirts": ["Linen Blend Shirt", "Oxford Button-Down", "Denim Western Shirt", "Flannel Plaid Shirt", "Mandarin Collar Shirt", "Printed Resort Shirt", "Utility Overshirt", "Chambray Work Shirt"],
  "Formal Shirts": ["Classic Dress Shirt", "Slim Fit Poplin Shirt", "Textured Twill Shirt", "Non-Iron Formal Shirt", "Herringbone Weave Shirt", "Double Cuff Shirt", "Spread Collar Shirt", "Dobby Pattern Shirt"],
  "Jeans": ["Slim Fit Selvedge", "Straight Leg Classic", "Relaxed Tapered Jeans", "Skinny Stretch Denim", "Vintage Distressed Jeans", "Dark Indigo Rinse", "Grey Wash Denim", "Black Slim Jeans"],
  "Trousers": ["Chino Slim Fit", "Tailored Wool Trousers", "Pleated Smart Pants", "Cargo Utility Trousers", "Linen Summer Pants", "Corduroy Trousers", "Check Pattern Slacks", "Stretch Cotton Khakis"],
  "Hoodies": ["Heavyweight Fleece Hoodie", "Zip-Up Performance Hoodie", "Overhead Minimalist Hoodie", "Colorblock Urban Hoodie", "French Terry Hoodie", "Logo Embroidered Hoodie", "Washed Effect Hoodie", "Thermal Lined Hoodie"],
  "Jackets": ["Classic Bomber Jacket", "Trucker Denim Jacket", "Harrington Light Jacket", "Quilted Puffer Jacket", "Leather Biker Jacket", "Field Utility Jacket", "Parka with Hood", "Coach Windbreaker"],
  "Shorts": ["Chino Walk Shorts", "Sweat Fabric Shorts", "Cargo Adventure Shorts", "Linen Blend Shorts", "Denim Cut-Offs", "Swim Trunks", "Tailored Smart Shorts", "Athletic Mesh Shorts"],
  "Blazers": ["Structured Navy Blazer", "Unstructured Linen Blazer", "Tweed Heritage Blazer", "Slim Fit Velvet Blazer", "Check Pattern Sport Coat", "Double Breasted Blazer", "Casual Knit Blazer", "Classic Charcoal Blazer"],
  "Ethnic Wear": ["Cotton Kurta Pajama", "Embroidered Sherwani", "Nehru Jacket Set", "Pathani Suit", "Silk Blend Kurta", "Lucknowi Chikan Kurta", "Bandhgala Suit", "Printed Short Kurta"],
  "Men's Dresses": ["Linen Kaftan Robe", "Modern Tunic Dress", "Traditional Thobe", "Avant-Garde Maxi Shirt", "Embroidered Long Robe", "Minimalist Tunic", "Silk Blend Caftan", "Contemporary Men's Gown"],
  "Footwear": ["Leather Chelsea Boots", "Classic White Sneakers", "Suede Penny Loafers", "Oxford Formal Shoes", "Canvas High-Tops", "Desert Boots", "Minimalist Trainers", "Leather Sandals"],
  "Accessories": ["Leather Bifold Wallet", "Automatic Chronograph Watch", "Polarized Sunglasses", "Classic Leather Belt", "Silk Patterned Tie", "Wool Blend Scarf", "Canvas Backpack", "Stainless Steel Cufflinks"]
};

export const getInitialProducts = () => {
  const products: any[] = [];
  
  initialCategories.forEach(category => {
    const names = productNames[category];
    const count = 8; // User asked for 5-8 products per category
    
    for (let i = 0; i < count; i++) {
      const price = (4 + Math.floor(Math.random() * 45)) * 100 + 99;
      const hasOldPrice = Math.random() > 0.6;
      const badge = Math.random() > 0.7 ? ["New", "Sale", "Best Seller", "Trending"][Math.floor(Math.random() * 4)] : "";
      
      const categoryImages = images[category];
      const product: any = {
        name: names[i % names.length],
        description: `A premium ${category.toLowerCase()} designed for the modern man. Crafted from high-quality materials to ensure durability, comfort, and a perfect fit for any occasion.`,
        category: category,
        price: price,
        imageUrl: categoryImages[i % categoryImages.length],
        images: [
          categoryImages[i % categoryImages.length],
          categoryImages[(i + 1) % categoryImages.length],
          categoryImages[(i + 2) % categoryImages.length],
        ],
        sizes: sizes[category],
        colors: colors.slice(0, 3 + Math.floor(Math.random() * 5)),
        rating: 4 + (Math.random() * 1),
        reviewCount: 15 + Math.floor(Math.random() * 250),
        stock: 10 + Math.floor(Math.random() * 60),
        badge: badge,
        createdAt: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 45)).toISOString()
      };

      if (hasOldPrice) {
        product.oldPrice = Math.floor((price * (1.2 + Math.random() * 0.3)) / 100) * 100 + 99;
      }
      
      products.push(product);
    }
  });
  
  return products;
};
