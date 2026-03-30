import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError } from './firebase';
import { useAuth } from './AuthContext';
import { OperationType } from './types';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setWishlist([]);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setWishlist(doc.data().wishlist || []);
      }
    }, (error) => {
      console.error("Wishlist sync error:", error);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  const toggleWishlist = async (productId: string) => {
    if (!isAuthenticated || !user) {
      // Could redirect to login or show a toast
      return;
    }

    const isAdded = wishlist.includes(productId);
    const userRef = doc(db, 'users', user.uid);

    try {
      await updateDoc(userRef, {
        wishlist: isAdded ? arrayRemove(productId) : arrayUnion(productId)
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
