import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db, handleFirestoreError } from '../firebase';
import { doc, getDoc, setDoc, collection, writeBatch, getDocs } from 'firebase/firestore';
import { OperationType } from '../types';
import { useAuth } from '../AuthContext';
import { LogIn, ArrowRight } from 'lucide-react';
import { getInitialProducts } from '../data/initialProducts';

export const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  if (isAdmin) {
    return null;
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user is admin in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let role = 'customer';
      
      if (userDoc.exists()) {
        role = userDoc.data().role;
      } else {
        // Default admin for the specific email
        role = user.email === 'nidavelir.forges@gmail.com' ? 'admin' : 'customer';
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: role,
          displayName: user.displayName
        });
      }

      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. You do not have administrator privileges.');
      }
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    setLoading(true);
    try {
      const products = getInitialProducts();
      const batch = writeBatch(db);
      
      // Clear existing products for a clean seed
      const existingProducts = await getDocs(collection(db, 'products'));
      existingProducts.forEach(doc => {
        batch.delete(doc.ref);
      });

      products.forEach(p => {
        const docRef = doc(collection(db, 'products'));
        batch.set(docRef, p);
      });
      await batch.commit();
      alert('Database seeded successfully with 100 men\'s products!');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'products_seed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-emerald-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <LogIn size={32} />
          </div>
          <span className="text-2xl font-serif font-bold tracking-tighter text-black mb-4 block">LUXE<span className="text-emerald-600">ADMIN</span></span>
          <h1 className="text-3xl font-serif font-bold mb-2">Admin Portal</h1>
          <p className="text-black/40 text-sm font-light italic">Sign in with your Google account to access the dashboard.</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-emerald-100">
          <div className="space-y-6">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all flex items-center justify-center group disabled:opacity-50 text-[10px]"
            >
              <LogIn size={18} className="mr-3" />
              {loading ? 'Authenticating...' : 'Sign in with Google'}
              {!loading && <ArrowRight size={18} className="ml-3 group-hover:translate-x-2 transition-transform" />}
            </button>

            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
          </div>
          
          <div className="mt-12 pt-8 border-t border-black/5 text-center">
            <button 
              onClick={seedDatabase}
              disabled={loading}
              className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest hover:underline mb-4 block mx-auto disabled:opacity-50"
            >
              Seed Database with Sample Data
            </button>
            <p className="text-[10px] text-black/30 uppercase tracking-widest">Administrator Access Only</p>
            <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-widest">Authorized: nidavelir.forges@gmail.com</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/login" className="text-[10px] text-black/20 font-bold uppercase tracking-widest hover:text-emerald-600 transition-colors">
            Back to User Login
          </Link>
        </div>
      </div>
    </div>
  );
};
