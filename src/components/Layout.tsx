import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search, ArrowRight, Heart } from 'lucide-react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { useWishlist } from '../WishlistContext';
import { cn } from '../types';

export const Navbar: React.FC = () => {
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{type: 'product' | 'category', text: string, image?: string, id?: string}[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), limit(100));
      const snap = await getDocs(q);
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const queryLower = searchQuery.toLowerCase();
      const matches: {type: 'product' | 'category', text: string, image?: string, id?: string}[] = [];
      const seen = new Set<string>();

      // Check categories first
      const categories = Array.from(new Set(products.map(p => p.category as string)));
      categories.forEach((cat: string) => {
        if (cat.toLowerCase().includes(queryLower) && !seen.has(cat)) {
          matches.push({ type: 'category', text: cat });
          seen.add(cat);
        }
      });

      // Check products
      products.forEach((p: Product) => {
        if (p.name.toLowerCase().includes(queryLower) && !seen.has(p.name)) {
          matches.push({ type: 'product', text: p.name, image: p.imageUrl, id: p.id });
          seen.add(p.name);
        }
      });

      setSuggestions(matches.slice(0, 6));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-ink/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-serif font-bold tracking-tighter text-ink">LUXE<span className="italic font-light">MEN</span></span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-10">
              <Link to="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60 hover:text-gold transition-colors">Home</Link>
              <Link to="/shop" className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60 hover:text-gold transition-colors flex items-center">
                Shop
                {products.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-paper text-[9px] font-bold text-ink/40 rounded-full">
                    {products.length}
                  </span>
                )}
              </Link>
              <Link to="/track" className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60 hover:text-gold transition-colors">Track Order</Link>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-ink/60 hover:text-gold transition-colors"
              >
                <Search size={18} />
              </button>
              
              <Link to="/wishlist" className="p-2 text-ink/60 hover:text-gold transition-colors relative">
                <Heart size={18} />
                {wishlist.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-rose-500 rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="p-2 text-ink/60 hover:text-gold transition-colors">
                    <User size={18} />
                  </Link>
                  {isAdmin && (
                    <Link to="/admin/dashboard" className="p-2 text-emerald-600 hover:text-emerald-700 transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Admin</span>
                    </Link>
                  )}
                </div>
              ) : (
                <Link to="/login" className="p-2 text-ink/60 hover:text-gold transition-colors">
                  <User size={18} />
                </Link>
              )}

              <Link to="/cart" className="p-2 text-ink/60 hover:text-gold transition-colors relative">
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-gold rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button 
                className="md:hidden p-2 text-ink/60 hover:text-gold transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-ink/5 animate-in slide-in-from-top duration-300">
            <div className="px-4 pt-4 pb-8 space-y-4">
              <Link to="/" className="block text-xs font-bold uppercase tracking-widest text-ink/60 hover:text-gold" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/shop" className="block text-xs font-bold uppercase tracking-widest text-ink/60 hover:text-gold" onClick={() => setIsMenuOpen(false)}>Shop</Link>
              <Link to="/track" className="block text-xs font-bold uppercase tracking-widest text-ink/60 hover:text-gold" onClick={() => setIsMenuOpen(false)}>Track Order</Link>
              <Link to="/wishlist" className="block text-xs font-bold uppercase tracking-widest text-ink/60 hover:text-gold" onClick={() => setIsMenuOpen(false)}>Wishlist</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="block text-xs font-bold uppercase tracking-widest text-ink/60 hover:text-gold" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                  {isAdmin && (
                    <Link to="/admin/dashboard" className="block text-xs font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
                  )}
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="block text-xs font-bold uppercase tracking-widest text-ink/60 hover:text-gold" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-paper animate-in fade-in duration-500">
          <div className="max-w-5xl mx-auto px-4 pt-24">
            <div className="flex justify-between items-center mb-20">
              <span className="text-2xl font-serif font-bold tracking-tighter">LUXE<span className="italic font-light">MEN</span></span>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-3 hover:bg-white rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSearch} className="relative mb-20">
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search the collection..." 
                className="w-full text-5xl md:text-7xl font-serif font-light border-none outline-none bg-transparent placeholder:text-ink/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-gold">
                <ArrowRight size={48} />
              </button>
            </form>

            {suggestions.length > 0 && (
              <div className="space-y-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-ink/30">Refine Search</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        if (s.type === 'category') {
                          navigate(`/shop?category=${encodeURIComponent(s.text)}`);
                        } else if (s.id) {
                          navigate(`/product/${s.id}`);
                        } else {
                          navigate(`/shop?q=${encodeURIComponent(s.text)}`);
                        }
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center justify-between p-6 bg-white rounded-sm hover:bg-gold hover:text-white transition-all duration-500 group text-left"
                    >
                      <div className="flex items-center space-x-6">
                        {s.image && (
                          <div className="w-16 h-20 bg-paper overflow-hidden rounded-sm flex-shrink-0">
                            <img src={s.image} alt={s.text} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                          </div>
                        )}
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gold group-hover:text-white/80 mb-1 block">{s.type}</span>
                          <span className="text-lg font-serif italic">{s.text}</span>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-ink/10 group-hover:text-white group-hover:translate-x-3 transition-all duration-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ink text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-1">
            <span className="text-2xl font-serif font-bold tracking-tighter mb-8 block text-white">LUXE<span className="italic font-light">MEN</span></span>
            <p className="text-white/40 text-sm leading-relaxed font-light">
              Curating the finest apparel for the modern gentleman. We believe in the intersection of tradition and contemporary design.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-gold">Collections</h4>
            <ul className="space-y-4 text-xs font-medium text-white/40">
              <li><Link to="/shop?category=Formal Shirts" className="hover:text-white transition-colors">Formal Attire</Link></li>
              <li><Link to="/shop?category=Blazers" className="hover:text-white transition-colors">Tailored Blazers</Link></li>
              <li><Link to="/shop?category=Men's Dresses" className="hover:text-white transition-colors">Modern Tunics</Link></li>
              <li><Link to="/shop?category=Footwear" className="hover:text-white transition-colors">Premium Footwear</Link></li>
              <li><Link to="/shop?category=Accessories" className="hover:text-white transition-colors">Essentials</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-gold">The House</h4>
            <ul className="space-y-4 text-xs font-medium text-white/40">
              <li><Link to="/" className="hover:text-white transition-colors">Our Philosophy</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Craftsmanship</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Sustainability</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-gold">Newsletter</h4>
            <p className="text-white/40 text-xs mb-8 font-light leading-relaxed">Join our inner circle for exclusive updates and early access.</p>
            <div className="flex border-b border-white/20 pb-2">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-transparent border-none px-0 py-2 text-xs w-full focus:ring-0 outline-none placeholder:text-white/20 font-light"
              />
              <button className="text-gold text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Join</button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <p>© 2026 LUXEMEN</p>
            <p>Crafted for Excellence</p>
          </div>
          <div className="flex space-x-8 mt-8 md:mt-0">
            <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
            <span className="hover:text-white cursor-pointer transition-colors">Facebook</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
