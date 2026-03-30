import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { useCart } from '../CartContext';
import { ShieldCheck, CheckCircle2, CreditCard, Smartphone, Landmark, Banknote } from 'lucide-react';
import { OperationType, cn } from '../types';
import { formatCurrency } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

export const Checkout: React.FC = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('card');
  const [paymentData, setPaymentData] = useState({
    upiId: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });

  useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      navigate('/cart');
    }
  }, [cart.length, navigate, orderSuccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const humanOrderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const orderData = {
      ...formData,
      paymentMethod,
      orderId: humanOrderId,
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        imageUrl: item.imageUrl
      })),
      totalAmount: cartTotal,
      orderStatus: 'Order Placed',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'orders'), orderData);
      setOrderSuccess(true);
      
      setTimeout(() => {
        clearCart();
        navigate(`/success?orderId=${humanOrderId}`);
      }, 1500);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
      setLoading(false);
    }
  };

  if (cart.length === 0 && !orderSuccess) {
    return null;
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-4xl font-serif italic text-ink">Order Placed</h2>
          <p className="text-ink/40 font-light uppercase tracking-widest text-xs">Finalizing your order...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-20">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-4">Secure Checkout</h2>
        <h1 className="text-5xl md:text-6xl font-serif italic text-ink tracking-tighter">Final <span className="text-gold">Details</span></h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-24">
        {/* Shipping Info */}
        <div className="lg:col-span-2 space-y-16">
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-10">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[9px] font-bold uppercase tracking-widest text-ink/30">Full Name</label>
                <input 
                  required name="customerName" value={formData.customerName} onChange={handleChange}
                  type="text" className="w-full px-8 py-5 bg-paper border-none rounded-sm focus:ring-1 focus:ring-gold outline-none text-sm font-light italic" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-bold uppercase tracking-widest text-ink/30">Email Address</label>
                <input 
                  required name="email" value={formData.email} onChange={handleChange}
                  type="email" className="w-full px-8 py-5 bg-paper border-none rounded-sm focus:ring-1 focus:ring-gold outline-none text-sm font-light italic" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-bold uppercase tracking-widest text-ink/30">Phone Number</label>
                <input 
                  required name="phone" value={formData.phone} onChange={handleChange}
                  type="tel" className="w-full px-8 py-5 bg-paper border-none rounded-sm focus:ring-1 focus:ring-gold outline-none text-sm font-light italic" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-bold uppercase tracking-widest text-ink/30">Pincode</label>
                <input 
                  required name="pincode" value={formData.pincode} onChange={handleChange}
                  type="text" className="w-full px-8 py-5 bg-paper border-none rounded-sm focus:ring-1 focus:ring-gold outline-none text-sm font-light italic" 
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[9px] font-bold uppercase tracking-widest text-ink/30">Street Address</label>
                <textarea 
                  required name="address" value={formData.address} onChange={handleChange}
                  rows={3} className="w-full px-8 py-5 bg-paper border-none rounded-sm focus:ring-1 focus:ring-gold outline-none resize-none text-sm font-light italic" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-bold uppercase tracking-widest text-ink/30">City</label>
                <input 
                  required name="city" value={formData.city} onChange={handleChange}
                  type="text" className="w-full px-8 py-5 bg-paper border-none rounded-sm focus:ring-1 focus:ring-gold outline-none text-sm font-light italic" 
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-10">Payment Method</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'upi', label: 'UPI', icon: Smartphone },
                { id: 'netbanking', label: 'Net Banking', icon: Landmark },
                { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-sm border transition-all duration-500 space-y-3",
                    paymentMethod === method.id 
                      ? "bg-ink text-white border-ink shadow-xl" 
                      : "bg-paper text-ink/40 border-ink/5 hover:border-gold/30 hover:bg-white"
                  )}
                >
                  <method.icon size={20} />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-center">{method.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {paymentMethod === 'upi' && (
                <motion.div
                  key="upi"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-paper p-8 rounded-sm space-y-6"
                >
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-ink/30">UPI ID</label>
                    <input 
                      required name="upiId" value={paymentData.upiId} onChange={handlePaymentChange}
                      type="text" placeholder="name@upi"
                      className="w-full px-8 py-5 bg-white border-none rounded-sm focus:ring-1 focus:ring-gold outline-none text-sm font-light italic" 
                    />
                  </div>
                  <p className="text-[8px] text-ink/30 uppercase tracking-widest">A payment request will be sent to your UPI app.</p>
                </motion.div>
              )}

              {paymentMethod === 'card' && (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-paper p-8 rounded-sm space-y-8"
                >
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-ink/30">Card Number</label>
                    <input 
                      required name="cardNumber" value={paymentData.cardNumber} onChange={handlePaymentChange}
                      type="text" placeholder="0000 0000 0000 0000"
                      className="w-full px-8 py-5 bg-white border-none rounded-sm focus:ring-1 focus:ring-gold outline-none text-sm font-light italic" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-ink/30">Expiry Date</label>
                      <input 
                        required name="expiryDate" value={paymentData.expiryDate} onChange={handlePaymentChange}
                        type="text" placeholder="MM/YY"
                        className="w-full px-8 py-5 bg-white border-none rounded-sm focus:ring-1 focus:ring-gold outline-none text-sm font-light italic" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-ink/30">CVV</label>
                      <input 
                        required name="cvv" value={paymentData.cvv} onChange={handlePaymentChange}
                        type="password" placeholder="***"
                        className="w-full px-8 py-5 bg-white border-none rounded-sm focus:ring-1 focus:ring-gold outline-none text-sm font-light italic" 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-ink/30">Card Holder Name</label>
                    <input 
                      required name="cardHolder" value={paymentData.cardHolder} onChange={handlePaymentChange}
                      type="text" placeholder="Full Name"
                      className="w-full px-8 py-5 bg-white border-none rounded-sm focus:ring-1 focus:ring-gold outline-none text-sm font-light italic" 
                    />
                  </div>
                </motion.div>
              )}

              {paymentMethod === 'netbanking' && (
                <motion.div
                  key="netbanking"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-paper p-8 rounded-sm"
                >
                  <select className="w-full px-8 py-5 bg-white border-none rounded-sm focus:ring-1 focus:ring-gold outline-none text-sm font-light italic appearance-none">
                    <option value="">Select your bank</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="axis">Axis Bank</option>
                  </select>
                </motion.div>
              )}

              {paymentMethod === 'cod' && (
                <motion.div
                  key="cod"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-paper p-8 rounded-sm"
                >
                  <p className="text-sm italic text-ink/60">Pay with cash upon delivery. A verification call might be placed for your order.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <div className="flex items-center space-x-4 p-6 bg-paper rounded-sm border border-ink/5">
            <ShieldCheck className="text-gold flex-shrink-0" size={20} />
            <p className="text-[9px] font-bold uppercase tracking-widest text-ink/40 leading-relaxed">
              Your transaction is secured by industry-standard encryption.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-paper p-10 sticky top-32">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-10">Order Summary</h3>
            <div className="space-y-6 mb-10 max-h-60 overflow-y-auto pr-4 custom-scrollbar">
              {cart.map(item => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-ink/40 font-serif italic normal-case tracking-normal text-xs">{item.name} <span className="text-[9px] font-bold uppercase tracking-widest ml-2">x {item.quantity}</span></span>
                  <span className="text-ink font-serif italic tracking-normal text-xs">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-6 mb-10 border-t border-ink/5 pt-10">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-ink/30">Subtotal</span>
                <span className="text-ink">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-ink/30">Shipping</span>
                <span className="text-gold">Complimentary</span>
              </div>
              <div className="flex justify-between pt-6 border-t border-ink/5 items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/30">Total</span>
                <span className="text-3xl font-serif italic text-ink">{formatCurrency(cartTotal)}</span>
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all duration-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
            <p className="text-[8px] text-center text-ink/20 mt-6 uppercase tracking-[0.2em]">By completing your order, you agree to our terms of service.</p>
          </div>
        </div>
      </form>
    </div>
  );
};
