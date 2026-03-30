import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Product, cn } from '../types';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { motion } from 'motion/react';
import { formatCurrency } from '../utils';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[0], product.colors[0], 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <Link to={`/product/${product.id}`} className="block">
      <motion.div 
        whileHover={{ y: -8 }}
        className="group relative bg-white overflow-hidden transition-all duration-700"
      >
        <div className="aspect-[3/4] overflow-hidden relative bg-paper">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className={cn(
              "w-full h-full object-cover transition-all duration-1000 grayscale-[0.2] group-hover:grayscale-0",
              product.images && product.images.length > 1 ? "opacity-100 group-hover:opacity-0 scale-100 group-hover:scale-110" : "group-hover:scale-105"
            )}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1594932224828-b4b059b6f6ee?auto=format&fit=crop&w=800&q=80";
            }}
          />
          {product.images && product.images.length > 1 && (
            <img 
              src={product.images[1]} 
              alt={`${product.name} alternate`}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 opacity-0 group-hover:opacity-100 scale-110 group-hover:scale-100"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1594932224828-b4b059b6f6ee?auto=format&fit=crop&w=800&q=80";
              }}
            />
          )}
          {product.badge && (
            <span className="absolute top-6 left-6 bg-ink text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 z-10">
              {product.badge}
            </span>
          )}
          <button 
            onClick={handleWishlist}
            className={cn(
              "absolute top-6 right-6 w-10 h-10 rounded-full shadow-lg flex items-center justify-center z-20 transition-all duration-500",
              isInWishlist(product.id) 
                ? "bg-rose-500 text-white opacity-100" 
                : "bg-white/80 backdrop-blur-sm text-ink/40 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-rose-500"
            )}
          >
            <Heart size={16} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={handleAddToCart}
            className="absolute bottom-6 right-6 bg-white text-ink w-12 h-12 rounded-full shadow-2xl opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-gold hover:text-white flex items-center justify-center z-20"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
        <div className="py-6 px-2">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-serif italic text-ink/80 line-clamp-1 group-hover:text-gold transition-colors duration-500">{product.name}</h3>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink/30 mb-4">{product.category}</p>
          <div className="flex items-center justify-between border-t border-ink/5 pt-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-ink">{formatCurrency(product.price)}</span>
              {product.oldPrice && (
                <span className="text-xs text-ink/20 line-through font-light">{formatCurrency(product.oldPrice)}</span>
              )}
            </div>
            <div className="flex items-center text-gold/60">
              <Star size={10} fill="currentColor" />
              <span className="text-[10px] font-bold ml-1.5 text-ink/40 tracking-tighter">{product.rating}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
