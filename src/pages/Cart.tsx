import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../CartContext';
import { formatCurrency } from '../utils';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="bg-stone-50 rounded-[3rem] py-20 px-8">
          <ShoppingBag size={64} className="mx-auto text-black/10 mb-6" />
          <h2 className="text-3xl font-serif font-bold mb-4">Your cart is empty</h2>
          <p className="text-black/40 mb-10 max-w-md mx-auto">Looks like you haven't added any apparel to your cart yet. Explore our collection to find your perfect fit.</p>
          <Link to="/shop" className="bg-black text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors inline-block">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-20">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-4">Your Selection</h2>
        <h1 className="text-5xl md:text-6xl font-serif italic text-ink tracking-tighter">Shopping <span className="text-gold">Bag</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-12">
          {cart.map((item) => (
            <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-10 pb-12 border-b border-ink/5 group">
              <div className="w-32 h-44 sm:w-40 sm:h-56 overflow-hidden bg-paper flex-shrink-0">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  referrerPolicy="no-referrer" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1594932224828-b4b059b6f6ee?auto=format&fit=crop&w=800&q=80";
                  }}
                />
              </div>
              <div className="flex-1 flex flex-col justify-between py-2">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-serif italic text-ink">{item.name}</h3>
                    <button 
                      onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                      className="text-ink/10 hover:text-gold transition-colors p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-[9px] font-bold text-ink/30 uppercase tracking-[0.2em]">
                    <span>Size: {item.selectedSize}</span>
                    <span>Color: {item.selectedColor}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="flex items-center bg-paper overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                      className="p-3 hover:text-gold transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-10 text-center text-[10px] font-bold text-ink">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                      className="p-3 hover:text-gold transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-xl font-serif italic text-ink">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
          
          <Link to="/shop" className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.3em] text-ink/30 hover:text-gold transition-all duration-500 group">
            <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-2 transition-transform duration-500" /> Continue Exploring
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-paper p-10 sticky top-32">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-10">Order Summary</h3>
            <div className="space-y-6 mb-10">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-ink/30">Subtotal</span>
                <span className="text-ink">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-ink/30">Shipping</span>
                <span className="text-gold">Complimentary</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-ink/30">Tax</span>
                <span className="text-ink">{formatCurrency(0)}</span>
              </div>
              <div className="border-t border-ink/5 pt-6 flex justify-between items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/30">Total</span>
                <span className="text-3xl font-serif italic text-ink">{formatCurrency(cartTotal)}</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-ink text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all duration-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
