import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, cn, OperationType, FirestoreErrorInfo } from '../types';
import { formatCurrency } from '../utils';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const OrderTracking: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const q = query(collection(db, 'orders'), where('orderId', '==', orderId.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setOrder({ id: doc.id, ...doc.data() } as Order);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'orders');
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
  const currentStatusIndex = order ? statuses.indexOf(order.orderStatus) : -1;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold mb-4">Track Your Order</h1>
        <p className="text-black/40">Enter your order ID to see the current status of your delivery.</p>
      </div>

      <form onSubmit={handleTrack} className="mb-16">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" size={20} />
            <input 
              type="text" 
              placeholder="Enter Order ID (e.g. ORD-ABC123XYZ)" 
              className="w-full pl-12 pr-6 py-5 bg-stone-50 border-none rounded-2xl font-bold focus:ring-1 focus:ring-emerald-500 outline-none uppercase"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-black text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-4 text-center font-medium">{error}</p>}
      </form>

      {order && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Status Timeline */}
          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-100 -translate-y-1/2"></div>
            <div className="relative flex justify-between items-center">
              {statuses.map((status, index) => (
                <div key={status} className="flex flex-col items-center relative z-10">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                    index <= currentStatusIndex ? "bg-emerald-600 text-white" : "bg-stone-100 text-black/20"
                  )}>
                    {index === 0 && <Clock size={18} />}
                    {index === 1 && <Package size={18} />}
                    {index === 2 && <Truck size={18} />}
                    {index === 3 && <MapPin size={18} />}
                    {index === 4 && <CheckCircle size={18} />}
                  </div>
                  <span className={cn(
                    "absolute top-12 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-center",
                    index <= currentStatusIndex ? "text-black" : "text-black/20"
                  )}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details Card */}
          <div className="bg-stone-50 rounded-3xl p-8 mt-20">
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-black/5">
              <div>
                <h3 className="text-lg font-bold mb-1">Order Details</h3>
                <p className="text-xs text-black/40 uppercase tracking-widest font-bold">{order.orderId}</p>
              </div>
              <div className="text-right">
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  {order.orderStatus}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-white">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{item.name}</h4>
                      <p className="text-xs text-black/40">Size: {item.size} | Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-black/5 flex justify-between items-center">
              <span className="text-sm font-bold text-black/40 uppercase tracking-widest">Total Amount</span>
              <span className="text-xl font-bold">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
