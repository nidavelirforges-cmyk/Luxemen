import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Truck, RefreshCw, ChevronRight } from 'lucide-react';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { Product, OperationType, cn } from '../types';
import { ProductCard } from '../components/ProductCard';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const editorialRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: editorialRef,
    offset: ["start end", "end start"]
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const allProductsSnap = await getDocs(collection(db, 'products'));
        setTotalCount(allProductsSnap.size);

        const featuredQuery = query(collection(db, 'products'), limit(4));
        const newArrivalsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(4));
        const bestSellersQuery = query(collection(db, 'products'), orderBy('rating', 'desc'), limit(4));

        const [featuredSnap, newSnap, bestSnap] = await Promise.all([
          getDocs(featuredQuery),
          getDocs(newArrivalsQuery),
          getDocs(bestSellersQuery)
        ]);

        setFeaturedProducts(featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
        setNewArrivals(newSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
        setBestSellers(bestSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'home_data');
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section - Split Layout */}
      <section className="relative min-h-screen flex flex-col md:flex-row overflow-hidden bg-paper">
        <div className="flex-1 p-8 md:p-24 flex flex-col justify-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-gold mb-10 block">
              The 2026 Collection
            </span>
            <h1 className="text-7xl md:text-9xl font-serif font-light leading-[0.85] mb-12 text-ink tracking-tighter text-balance">
              Refined <br /> <span className="italic">Masculinity</span>
            </h1>
            <p className="text-xl text-ink/50 mb-16 leading-relaxed font-light max-w-md">
              A curated selection of premium apparel for the modern gentleman. 
              Crafted with precision, designed for longevity.
            </p>
            <div className="flex flex-col sm:flex-row gap-8">
              <Link 
                to="/shop" 
                className="group flex items-center space-x-6 text-[10px] font-bold uppercase tracking-[0.3em]"
              >
                <span className="bg-ink text-white w-14 h-14 rounded-full flex items-center justify-center group-hover:bg-gold transition-all duration-700 group-hover:scale-110">
                  <ArrowRight size={20} />
                </span>
                <span className="border-b border-ink/10 pb-2 group-hover:border-gold transition-all duration-700">Explore Collection</span>
              </Link>
            </div>
          </motion.div>
          
          {/* Vertical Rail Text */}
          <div className="absolute left-6 bottom-24 hidden md:block">
            <span className="writing-mode-vertical-rl rotate-180 text-[9px] font-bold uppercase tracking-[0.6em] text-ink/10">
              ESTABLISHED MMXXVI • LUXE APPAREL
            </span>
          </div>
        </div>
        
        <div className="flex-1 relative h-[70vh] md:h-auto overflow-hidden">
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1920&q=80" 
              alt="Premium Men's Fashion" 
              className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1594932224828-b4b059b6f6ee?auto=format&fit=crop&w=800&q=80";
              }}
            />
          </motion.div>
          <div className="absolute inset-0 bg-ink/5"></div>
        </div>
      </section>

      {/* Stats / Trust Rail */}
      <section className="border-y border-ink/5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-ink/5 py-16">
            {[
              { label: 'Curated Items', value: totalCount > 0 ? `${totalCount}+` : '100+' },
              { label: 'Global Shipping', value: 'Express' },
              { label: 'Quality Guarantee', value: 'Premium' },
              { label: 'Member Access', value: 'Exclusive' }
            ].map((stat, i) => (
              <div key={i} className="px-10 flex flex-col items-center md:items-start text-center md:text-left">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-ink/30 mb-3">{stat.label}</span>
                <span className="text-2xl font-serif italic text-ink">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection - Editorial Grid */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-6">The Curated Edit</h2>
              <p className="text-5xl md:text-6xl font-serif italic text-ink leading-[1.1] tracking-tighter">
                Essential pieces for the <br /> <span className="text-gold">modern silhouette</span>.
              </p>
            </div>
            <Link to="/shop" className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink border-b border-gold pb-2 hover:text-gold transition-colors">
              View All Collection
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
            {featuredProducts.slice(0, 3).map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "md:col-span-4",
                  index === 1 && "md:mt-32",
                  index === 2 && "md:mt-16"
                )}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Philosophy */}
      <section className="py-48 bg-paper overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute -top-32 -left-32 text-[25vw] font-serif italic text-ink/[0.02] whitespace-nowrap pointer-events-none"
          >
            Excellence in Craft
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-32 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="aspect-[4/5] relative">
                <img 
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1000" 
                  alt="Craftsmanship" 
                  className="w-full h-full object-cover grayscale"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-white p-10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] hidden md:block">
                  <p className="text-sm font-serif italic text-ink/50 leading-relaxed">
                    "Style is a way to say who you are without having to speak. We provide the vocabulary for the modern gentleman."
                  </p>
                  <div className="mt-8 w-16 h-px bg-gold"></div>
                </div>
              </div>
            </motion.div>
            
            <div className="space-y-16">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-gold">Our Philosophy</h2>
              <h3 className="text-6xl md:text-7xl font-serif text-ink leading-[1] tracking-tighter">
                The Art of <br /> <span className="italic">Refined Living</span>
              </h3>
              <p className="text-xl text-ink/40 font-light leading-relaxed max-w-md">
                LUXEMEN was founded on the principle that true luxury is found in the details. From the selection of premium fabrics to the precision of every stitch, we curate a collection that transcends trends.
              </p>
              <div className="grid grid-cols-2 gap-12 pt-12 border-t border-ink/10">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink mb-3">Sourcing</h4>
                  <p className="text-xs text-ink/40 leading-relaxed font-light">Only the finest natural fibers from sustainable, world-class mills.</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink mb-3">Tailoring</h4>
                  <p className="text-xs text-ink/40 leading-relaxed font-light">Master craftsmen ensuring the perfect silhouette for every piece.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Immersive Editorial Section */}
      <section ref={editorialRef} className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ scale }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=2000" 
            alt="Editorial" 
            className="w-full h-full object-cover grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-[1px]"></div>
        </motion.div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-[10px] font-bold uppercase tracking-[0.6em] text-gold mb-12">The Winter Lookbook</h2>
            <p className="text-6xl md:text-9xl font-serif italic text-white mb-16 leading-[0.9] tracking-tighter">
              Elegance in <br /> Every Layer
            </p>
            <Link 
              to="/shop" 
              className="inline-block px-16 py-6 bg-white text-ink text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold hover:text-white transition-all duration-700"
            >
              Explore the Lookbook
            </Link>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals - Minimalist Grid */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-32">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-8">New Arrivals</h2>
            <h3 className="text-5xl font-serif text-ink tracking-tight">The Latest Additions</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24">
            {newArrivals.slice(0, 8).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Oval Masks */}
      <section className="py-40 bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-24">
            <h2 className="text-5xl font-serif text-ink italic tracking-tight">Browse by <span className="text-gold">Category</span></h2>
            <Link to="/shop" className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/30 hover:text-gold transition-colors">
              All Departments
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
            {['Formal Shirts', 'Blazers', 'Trousers', 'Footwear', 'Accessories', "Men's Dresses"].map((cat, i) => (
              <Link 
                key={cat} 
                to={`/shop?category=${encodeURIComponent(cat)}`}
                className="group text-center"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="aspect-[2/3] mb-8 overflow-hidden mask-oval bg-white shadow-2xl transition-all duration-1000"
                >
                  <img 
                    src={`https://picsum.photos/seed/${cat}/400/600`} 
                    alt={cat} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/40 group-hover:text-gold transition-colors">{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter - Minimalist */}
      <section className="py-48 bg-ink relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(212,175,55,0.2)_0%,transparent_70%)]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-[10px] font-bold uppercase tracking-[0.6em] text-gold mb-12">The Inner Circle</h2>
            <p className="text-5xl md:text-7xl font-serif italic text-white mb-16 leading-[1.1] tracking-tighter">
              Stay informed on the <br /> latest collections.
            </p>
            <form className="flex flex-col md:flex-row gap-6 max-w-xl mx-auto">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="flex-1 bg-white/5 border border-white/10 px-8 py-5 text-white text-sm focus:outline-none focus:border-gold transition-all duration-500 font-light"
              />
              <button className="px-12 py-5 bg-gold text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-ink transition-all duration-700">
                Subscribe
              </button>
            </form>
            <p className="mt-12 text-[9px] text-white/10 uppercase tracking-[0.4em] font-bold">
              By subscribing, you agree to our privacy policy.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
