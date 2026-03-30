import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, ChevronDown, Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit, writeBatch, doc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { Product, cn, OperationType } from '../types';
import { ProductCard } from '../components/ProductCard';
import { getInitialProducts } from '../data/initialProducts';


export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<{type: 'product' | 'category', text: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productsData);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const queryLower = searchQuery.toLowerCase();
      const matches: {type: 'product' | 'category', text: string}[] = [];
      const seen = new Set<string>();
      
      // Categories
      const categoriesList = Array.from(new Set(products.map(p => p.category as string)));
      categoriesList.forEach((cat: string) => {
        if (cat.toLowerCase().includes(queryLower) && !seen.has(cat)) {
          matches.push({ type: 'category', text: cat });
          seen.add(cat);
        }
      });

      // Products
      products.forEach((p: Product) => {
        if (p.name.toLowerCase().includes(queryLower) && !seen.has(p.name)) {
          matches.push({ type: 'product', text: p.name });
          seen.add(p.name);
        }
      });
      
      setSuggestions(matches.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
    const cat = searchParams.get('category');
    if (cat !== null && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  useEffect(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Search Filter
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(queryLower) ||
        p.description.toLowerCase().includes(queryLower) ||
        p.category.toLowerCase().includes(queryLower)
      ).sort((a, b) => {
        // Boost exact matches and name matches
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aExact = aName === queryLower;
        const bExact = bName === queryLower;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        const aStarts = aName.startsWith(queryLower);
        const bStarts = bName.startsWith(queryLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        return 0;
      });
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popularity') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, searchQuery, sortBy]);

  const categories = [
    'All',
    'T-Shirts',
    'Casual Shirts',
    'Formal Shirts',
    'Jeans',
    'Trousers',
    'Hoodies',
    'Jackets',
    'Shorts',
    'Blazers',
    'Ethnic Wear',
    "Men's Dresses",
    'Footwear',
    'Accessories'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-4">The Collection</h2>
          <h1 className="text-5xl md:text-6xl font-serif italic text-ink tracking-tighter">
            Men's <span className="text-gold">Apparel</span>
          </h1>
          <p className="text-ink/30 text-[10px] font-bold uppercase tracking-widest mt-6">Showing {filteredProducts.length} curated pieces</p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (searchQuery) next.set('q', searchQuery);
                else next.delete('q');
                return next;
              });
              setShowSuggestions(false);
            }}
            className="relative flex-1 min-w-[300px]"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={16} />
            <input 
              type="text" 
              placeholder="Search the collection..." 
              className="w-full pl-12 pr-6 py-4 bg-paper border-none rounded-sm text-sm focus:ring-1 focus:ring-gold outline-none placeholder:text-ink/20 font-light"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-sm shadow-2xl border border-ink/5 z-50 overflow-hidden">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSearchQuery(suggestion.text);
                      setShowSuggestions(false);
                      setSearchParams(prev => {
                        const next = new URLSearchParams(prev);
                        next.set('q', suggestion.text);
                        return next;
                      });
                    }}
                    className="w-full text-left px-8 py-4 text-sm hover:bg-paper transition-colors flex items-center justify-between group"
                  >
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gold mb-1">{suggestion.type}</span>
                      <span className="text-ink/60 group-hover:text-ink font-serif italic">{suggestion.text}</span>
                    </div>
                    <ArrowRight size={14} className="text-ink/10 group-hover:text-gold group-hover:translate-x-2 transition-all duration-500" />
                  </button>
                ))}
              </div>
            )}
          </form>
          
          <div className="flex items-center space-x-3 bg-paper px-6 py-4 rounded-sm">
            <span className="text-[9px] font-bold text-ink/30 uppercase tracking-[0.2em]">Sort By</span>
            <select 
              className="bg-transparent border-none text-xs font-bold uppercase tracking-widest outline-none cursor-pointer text-ink"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center space-x-3 bg-ink text-white px-6 py-4 rounded-sm text-[10px] font-bold uppercase tracking-widest"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-20">
        {/* Sidebar Filters */}
        <aside className={cn(
          "md:w-72 space-y-12 transition-all duration-300",
          showFilters ? "block" : "hidden md:block"
        )}>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-8 flex items-center">
              Categories
            </h3>
            <div className="space-y-4">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSearchParams(cat === 'All' ? {} : { category: cat });
                  }}
                  className={cn(
                    "block w-full text-left text-xs uppercase tracking-widest transition-all duration-500",
                    selectedCategory === cat ? "text-ink font-bold translate-x-2" : "text-ink/40 hover:text-ink hover:translate-x-1"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-12 border-t border-ink/5">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-8">Price Range</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between text-[10px] font-bold text-ink/30 uppercase tracking-widest">
                <span>₹0</span>
                <span>₹5000+</span>
              </div>
              <input type="range" min="0" max="5000" step="100" className="w-full h-px bg-ink/10 appearance-none cursor-pointer accent-gold" />
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-paper aspect-[3/4] mb-6"></div>
                  <div className="h-4 bg-paper rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-paper rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-paper rounded-sm">
              <p className="text-ink/40 text-sm font-light italic mb-8">No pieces found matching your selection.</p>
              <button 
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setSearchParams({});
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-gold border-b border-gold pb-2"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
