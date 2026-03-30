import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { 
  collection, getDocs, query, orderBy, addDoc, deleteDoc, doc, updateDoc, writeBatch 
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { 
  LayoutDashboard, Package, ShoppingBag, LogOut, Plus, Edit2, Trash2, 
  TrendingUp, Clock, Menu, X, Database, Trash 
} from 'lucide-react';
import { Product, Order, cn, OperationType } from '../types';
import { getInitialProducts } from '../data/initialProducts';
import { formatCurrency } from '../utils';

export const AdminDashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for new product
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', category: 'T-Shirts', price: 0, oldPrice: 0,
    sizes: 'S, M, L, XL, XXL', colors: 'Black, White, Navy', stock: 10, imageUrl: '', badge: ''
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      return;
    }
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const oQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      
      const [pSnap, oSnap] = await Promise.all([
        getDocs(pQuery),
        getDocs(oQuery)
      ]);

      const pData = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      const oData = oSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      setProducts(pData);
      setOrders(oData);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'admin_data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...newProduct,
      sizes: newProduct.sizes.split(',').map(s => s.trim()),
      colors: newProduct.colors.split(',').map(c => c.trim()),
      rating: 4.5,
      reviewCount: 0,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'products'), productData);
      setIsAddingProduct(false);
      fetchData();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'products');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      fetchData();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleDeleteAllProducts = async () => {
    if (!confirm('CRITICAL: This will delete ALL products from the database. Are you sure?')) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'products'));
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      fetchData();
      alert('All products deleted successfully.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'all_products');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (!confirm('This will seed the database with initial products. Continue?')) return;
    setLoading(true);
    try {
      const initialProducts = getInitialProducts();
      const batch = writeBatch(db);
      initialProducts.forEach(p => {
        const docRef = doc(collection(db, 'products'));
        batch.set(docRef, p);
      });
      await batch.commit();
      fetchData();
      alert('Database seeded successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'seed_database');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { orderStatus: status });
      fetchData();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-stone-50 flex relative overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-black text-white flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex justify-between items-center">
          <span className="text-xl font-serif font-bold tracking-tighter">LUXE<span className="text-emerald-500">ADMIN</span></span>
          <button 
            className="md:hidden text-white/60 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'overview' ? "bg-emerald-600 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <LayoutDashboard size={18} /> <span>Overview</span>
          </button>
          <button 
            onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'products' ? "bg-emerald-600 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <Package size={18} /> <span>Products</span>
          </button>
          <button 
            onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'orders' ? "bg-emerald-600 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <ShoppingBag size={18} /> <span>Orders</span>
          </button>
          
          <div className="pt-4 mt-4 border-t border-white/10">
            <button 
              onClick={() => navigate('/')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <ShoppingBag size={18} /> <span>Back to Shop</span>
            </button>
          </div>
        </nav>
        <div className="p-8 border-t border-white/10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-xs">
              {user?.displayName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user?.displayName || user?.email}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Administrator</p>
            </div>
          </div>
          <button 
            onClick={async () => { await logout(); navigate('/admin'); }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-12 overflow-y-auto w-full">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-black/5">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-black/60 hover:text-black hover:bg-stone-100 rounded-lg transition-all"
          >
            <Menu size={24} />
          </button>
          <span className="text-lg font-serif font-bold tracking-tighter">LUXE<span className="text-emerald-600">ADMIN</span></span>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
        {activeTab === 'overview' && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2">Dashboard Overview</h1>
                <p className="text-black/40 text-sm">Welcome back, here's what's happening today.</p>
              </div>
              <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-black/5 flex items-center space-x-3 w-full md:w-auto">
                <TrendingUp size={18} className="text-emerald-600" />
                <span className="text-sm font-bold">Sales up 12% this week</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
                { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Pending Orders', value: orders.filter(o => o.orderStatus === 'Order Placed').length, icon: Clock, color: 'bg-amber-50 text-amber-600' },
                { label: 'Revenue', value: formatCurrency(orders.reduce((acc, o) => acc + o.totalAmount, 0)), icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.color)}>
                    <stat.icon size={24} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
              <div className="p-8 border-b border-black/5 flex justify-between items-center">
                <h3 className="font-bold">Recent Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs font-bold uppercase tracking-widest text-emerald-600">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-widest text-black/40">
                    <tr>
                      <th className="px-8 py-4">Order ID</th>
                      <th className="px-8 py-4">Customer</th>
                      <th className="px-8 py-4">Amount</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="text-sm hover:bg-stone-50 transition-colors">
                        <td className="px-8 py-4 font-mono font-bold text-emerald-600">{order.orderId}</td>
                        <td className="px-8 py-4 font-medium">{order.customerName}</td>
                        <td className="px-8 py-4 font-bold">{formatCurrency(order.totalAmount)}</td>
                        <td className="px-8 py-4">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                            order.orderStatus === 'Delivered' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-black/40">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold">Product Management</h1>
                <p className="text-black/40 text-sm">Manage your inventory and product listings.</p>
              </div>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <button 
                  onClick={handleDeleteAllProducts}
                  className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-all"
                >
                  <Trash size={16} /> <span>Delete All</span>
                </button>
                <button 
                  onClick={async () => {
                    if (!confirm('CRITICAL: This will delete ALL existing products and repopulate with the new Men\'s Collection. Continue?')) return;
                    setLoading(true);
                    try {
                      const snap = await getDocs(collection(db, 'products'));
                      const batch = writeBatch(db);
                      snap.docs.forEach(d => batch.delete(d.ref));
                      
                      const initialProducts = getInitialProducts();
                      initialProducts.forEach(p => {
                        const docRef = doc(collection(db, 'products'));
                        batch.set(docRef, p);
                      });
                      
                      await batch.commit();
                      fetchData();
                      alert('Database reset to Men\'s Collection successfully!');
                    } catch (err) {
                      handleFirestoreError(err, OperationType.DELETE, 'reset_database');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Database size={16} /> <span>Reset to Men's Only</span>
                </button>
                <button 
                  onClick={() => setIsAddingProduct(true)}
                  className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-black text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-black/10"
                >
                  <Plus size={16} /> <span>Add Product</span>
                </button>
              </div>
            </div>

            {isAddingProduct && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-black/5 animate-in zoom-in-95 duration-300">
                <h3 className="text-xl font-bold mb-6">Add New Product</h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-black/40">Product Name</label>
                    <input required type="text" className="w-full px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-black/40">Category</label>
                    <select className="w-full px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                      <option>T-Shirts</option>
                      <option>Casual Shirts</option>
                      <option>Formal Shirts</option>
                      <option>Jeans</option>
                      <option>Trousers</option>
                      <option>Hoodies</option>
                      <option>Jackets</option>
                      <option>Shorts</option>
                      <option>Blazers</option>
                      <option>Ethnic Wear</option>
                      <option>Men's Dresses</option>
                      <option>Footwear</option>
                      <option>Accessories</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-black/40">Price (₹)</label>
                    <input required type="number" className="w-full px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-black/40">Stock Quantity</label>
                    <input required type="number" className="w-full px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-black/40">Description</label>
                    <textarea required rows={3} className="w-full px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 resize-none" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-black/40">Image URL</label>
                    <input required type="text" className="w-full px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-black/40">Badge (Optional)</label>
                    <input type="text" className="w-full px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500" value={newProduct.badge} onChange={e => setNewProduct({...newProduct, badge: e.target.value})} placeholder="New, Sale, Best Seller" />
                  </div>
                  <div className="flex gap-4 md:col-span-2">
                    <button type="submit" className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all">Save Product</button>
                    <button type="button" onClick={() => setIsAddingProduct(false)} className="flex-1 bg-stone-100 text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-stone-200 transition-all">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden flex flex-col">
                  <div className="h-48 overflow-hidden relative">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-black hover:bg-black hover:text-white transition-all shadow-lg"><Edit2 size={14} /></button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="font-bold mb-1">{product.name}</h4>
                    <p className="text-[10px] text-black/40 uppercase tracking-widest font-bold mb-4">{product.category}</p>
                    <div className="mt-auto flex justify-between items-center">
                      <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                        product.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-serif font-bold">Order Management</h1>
            <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-widest text-black/40">
                    <tr>
                      <th className="px-8 py-4">Order ID</th>
                      <th className="px-8 py-4">Customer</th>
                      <th className="px-8 py-4">Items</th>
                      <th className="px-8 py-4">Total</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {orders.map(order => (
                      <tr key={order.id} className="text-sm hover:bg-stone-50 transition-colors">
                        <td className="px-8 py-4 font-mono font-bold text-emerald-600">{order.orderId}</td>
                        <td className="px-8 py-4">
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-[10px] text-black/40">{order.email}</p>
                        </td>
                        <td className="px-8 py-4 text-black/60">{order.items.length} items</td>
                        <td className="px-8 py-4 font-bold">{formatCurrency(order.totalAmount)}</td>
                        <td className="px-8 py-4">
                          <select 
                            className="bg-stone-100 border-none text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full outline-none cursor-pointer"
                            value={order.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          >
                            <option>Order Placed</option>
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>Out for Delivery</option>
                            <option>Delivered</option>
                          </select>
                        </td>
                        <td className="px-8 py-4">
                          <button className="text-emerald-600 font-bold text-xs uppercase tracking-widest">Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
