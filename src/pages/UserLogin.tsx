import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db, handleFirestoreError } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { OperationType } from '../types';
import { useAuth } from '../AuthContext';
import { LogIn, ArrowRight, User as UserIcon } from 'lucide-react';

export const UserLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Default role for new users
        const role = user.email === 'nidavelir.forges@gmail.com' ? 'admin' : 'customer';
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: role,
          displayName: user.displayName
        });
      }

      navigate('/');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-stone-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <UserIcon size={32} />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-4 tracking-tight">Welcome Back</h1>
          <p className="text-black/40 text-sm font-light italic">Sign in to access your orders and curated selection.</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-black/5">
          <div className="space-y-6">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-black text-white py-6 rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center group disabled:opacity-50 text-[10px]"
            >
              <LogIn size={18} className="mr-3" />
              {loading ? 'Authenticating...' : 'Sign in with Google'}
              {!loading && <ArrowRight size={18} className="ml-3 group-hover:translate-x-2 transition-transform" />}
            </button>

            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
          </div>
          
          <div className="mt-12 pt-8 border-t border-black/5 text-center">
            <p className="text-[10px] text-black/30 uppercase tracking-widest mb-4">New to LUXEMEN?</p>
            <p className="text-[10px] text-black/60 font-bold uppercase tracking-widest leading-relaxed">
              Your account will be created automatically <br /> upon your first sign-in.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/admin" className="text-[10px] text-black/20 font-bold uppercase tracking-widest hover:text-emerald-600 transition-colors">
            Administrator Access
          </Link>
        </div>
      </div>
    </div>
  );
};
