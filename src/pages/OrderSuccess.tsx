import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';
import { formatCurrency } from '../utils';

export const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const q = query(collection(db, 'orders'), where('orderId', '==', orderId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setOrder({ id: snap.docs[0].id, ...snap.docs[0].data() } as Order);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-paper py-24 px-12 max-w-3xl mx-auto relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
        
        <div className="w-24 h-24 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-12">
          <CheckCircle size={48} strokeWidth={1} />
        </div>
        
        <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-6">Gratitude</h2>
        <h1 className="text-5xl md:text-6xl font-serif italic text-ink tracking-tighter mb-8">Order <span className="text-gold">Confirmed</span></h1>
        <p className="text-ink/60 font-light italic text-lg leading-relaxed mb-12 max-w-lg mx-auto">
          Thank you for choosing LuxeMen. Your selection has been received and is currently being prepared with the utmost care.
        </p>
        
        <div className="bg-white p-10 border border-ink/5 mb-16 inline-block w-full max-w-md">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-ink/5 pb-4">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-ink/30">Reference ID</span>
              <span className="text-sm font-serif italic text-gold tracking-widest">{orderId}</span>
            </div>
            
            {order && (
              <div className="flex justify-between items-center border-b border-ink/5 pb-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-ink/30">Total Amount</span>
                <span className="text-lg font-serif italic text-ink">{formatCurrency(order.totalAmount)}</span>
              </div>
            )}
            
            <div className="text-center pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2 flex items-center justify-center">
                <Truck size={14} className="mr-2" /> Estimated Delivery
              </p>
              <p className="text-[10px] font-light italic text-ink/40">Your order will be delivered within 3-5 business days.</p>
            </div>
          </div>
          <p className="text-[8px] text-ink/20 mt-8 uppercase tracking-[0.2em]">Please retain this reference for your records.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link to="/track" className="bg-ink text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-all duration-700 flex items-center justify-center group">
            Track Journey <ArrowRight size={14} className="ml-3 group-hover:translate-x-2 transition-transform duration-500" />
          </Link>
          <Link to="/shop" className="bg-white border border-ink/10 text-ink px-12 py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-paper transition-all duration-700 flex items-center justify-center group">
            <ShoppingBag size={14} className="mr-3 group-hover:-translate-y-1 transition-transform duration-500" /> Continue Exploring
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
