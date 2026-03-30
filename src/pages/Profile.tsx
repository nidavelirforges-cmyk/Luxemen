import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { useAuth } from '../AuthContext';
import { Order, OperationType } from '../types';
import { formatCurrency } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ChevronRight, Clock, CheckCircle, Truck, AlertCircle, LogOut, User as UserIcon, ShoppingBag, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'details'>('orders');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        setOrders(ordersData);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'processing': return <Package className="w-4 h-4 text-blue-500" />;
      case 'shipped': return <Truck className="w-4 h-4 text-indigo-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default: return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white text-xl font-bold">
                  {user.displayName?.[0] || user.email?.[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 truncate max-w-[140px]">
                    {user.displayName || 'User'}
                  </h2>
                  <p className="text-xs text-gray-500 truncate max-w-[140px]">
                    {user.email}
                  </p>
                </div>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === 'orders' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-medium">My Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === 'details' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium">Account Details</span>
                </button>
                <Link
                  to="/wishlist"
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">Wishlist</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' ? (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
                    <span className="text-sm text-gray-500">{orders.length} orders total</span>
                  </div>

                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-2xl" />
                      ))}
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <Link
                          key={order.id}
                          to={`/order-tracking?id=${order.id}`}
                          className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-black transition-all group"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
                                  <span className="text-gray-300">|</span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  {getStatusIcon(order.status)}
                                  <span className="text-sm font-medium capitalize text-gray-700">
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-6">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
                            </div>
                          </div>

                          <div className="mt-4 flex -space-x-2 overflow-hidden">
                            {order.items.slice(0, 5).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.image}
                                alt={item.name}
                                className="inline-block h-10 w-10 rounded-lg ring-2 ring-white object-cover"
                              />
                            ))}
                            {order.items.length > 5 && (
                              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-600 ring-2 ring-white">
                                +{order.items.length - 5}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
                      <p className="text-gray-500 mt-2 mb-6">Looks like you haven't made any purchases yet.</p>
                      <Link
                        to="/shop"
                        className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
                >
                  <h1 className="text-2xl font-bold text-gray-900 mb-8">Account Details</h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                        <div className="p-4 bg-gray-50 rounded-xl font-medium text-gray-900">
                          {user.displayName || 'Not provided'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                        <div className="p-4 bg-gray-50 rounded-xl font-medium text-gray-900">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Account Created</label>
                        <div className="p-4 bg-gray-50 rounded-xl font-medium text-gray-900">
                          {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Last Login</label>
                        <div className="p-4 bg-gray-50 rounded-xl font-medium text-gray-900">
                          {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Security</h3>
                    <p className="text-gray-500 mb-6">You are signed in with Google. Your password management is handled by your Google account.</p>
                    <a
                      href="https://myaccount.google.com/security"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-colors"
                    >
                      Manage Google Account
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
