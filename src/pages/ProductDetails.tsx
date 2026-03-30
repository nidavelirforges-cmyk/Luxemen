import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShoppingBag, ChevronRight, ChevronLeft, Heart, Share2, ArrowRight } from 'lucide-react';
import { doc, getDoc, collection, query, where, limit, getDocs, addDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { Product, cn, OperationType, Review } from '../types';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../utils';
import { ProductCard } from '../components/ProductCard';
import { useWishlist } from '../WishlistContext';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(data);
          setSelectedSize(data.sizes[0]);
          setSelectedColor(data.colors[0]);
          setActiveImage(data.imageUrl);

          // Fetch related products
          const relatedQuery = query(
            collection(db, 'products'),
            where('category', '==', data.category),
            limit(5)
          );
          const relatedSnap = await getDocs(relatedQuery);
          const related = relatedSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Product))
            .filter(p => p.id !== id)
            .slice(0, 4);
          setRelatedProducts(related);

          // Fetch reviews
          const reviewsQuery = query(
            collection(db, 'reviews'),
            where('productId', '==', id),
            orderBy('createdAt', 'desc')
          );
          const reviewsSnap = await getDocs(reviewsQuery);
          setReviews(reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `products/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user || !id) return;

    setSubmittingReview(true);
    try {
      const reviewData = {
        productId: id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating: reviewRating,
        comment: reviewComment,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'reviews'), reviewData);
      
      // Update local state
      setReviews([{ id: Date.now().toString(), ...reviewData }, ...reviews]);
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reviews');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((touch.pageX - left) / width) * 100;
    const y = ((touch.pageY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Product not found</div>;

  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-3 text-[9px] font-bold text-ink/30 uppercase tracking-[0.3em] mb-16">
        <Link to="/" className="hover:text-gold transition-colors">Home</Link>
        <ChevronRight size={10} />
        <Link to="/shop" className="hover:text-gold transition-colors">Shop</Link>
        <ChevronRight size={10} />
        <span className="text-ink">{product.category}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* Gallery */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "aspect-[3/4] overflow-hidden bg-paper relative cursor-zoom-in touch-none",
              isZooming && "z-50"
            )}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onTouchStart={() => setIsZooming(true)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsZooming(false)}
          >
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                src={activeImage || product.imageUrl} 
                alt={product.name} 
                className={cn(
                  "w-full h-full object-cover transition-transform duration-200 ease-out",
                  isZooming ? "scale-[2.5]" : "scale-100"
                )}
                style={isZooming ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1594932224828-b4b059b6f6ee?auto=format&fit=crop&w=800&q=80";
                }}
              />
            </AnimatePresence>
            
            {/* Zoom Indicator for Mobile */}
            <div className="absolute bottom-4 right-4 md:hidden bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest text-ink/40 pointer-events-none">
              {isZooming ? "Release to exit zoom" : "Touch to zoom"}
            </div>
          </motion.div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div 
                key={i} 
                onClick={() => setActiveImage(img)}
                className={cn(
                  "aspect-square overflow-hidden bg-paper cursor-pointer transition-all duration-500 relative group",
                  activeImage === img ? "opacity-100" : "opacity-40 hover:opacity-80"
                )}
              >
                <img 
                  src={img} 
                  alt={`${product.name} ${i}`} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1594932224828-b4b059b6f6ee?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                {activeImage === img && (
                  <motion.div 
                    layoutId="active-thumb"
                    className="absolute inset-0 border-2 border-gold z-10"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">{product.category}</span>
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={cn(
                    "transition-colors",
                    isInWishlist(product.id) ? "text-rose-500" : "text-ink/20 hover:text-gold"
                  )}
                >
                  <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </button>
                <button className="text-ink/20 hover:text-gold transition-colors"><Share2 size={18} /></button>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif italic text-ink tracking-tighter mb-6">{product.name}</h1>
            <div className="flex items-center space-x-6 mb-10">
              <div className="flex items-center text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                ))}
                <span className="ml-3 text-[10px] font-bold text-ink uppercase tracking-widest">{product.rating}</span>
              </div>
              <span className="text-ink/10">|</span>
              <span className="text-[10px] font-bold text-ink/30 uppercase tracking-widest">{product.reviewCount} Reviews</span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-4xl font-serif italic text-ink">{formatCurrency(product.price)}</span>
              {product.oldPrice && (
                <span className="text-2xl font-serif italic text-ink/20 line-through">{formatCurrency(product.oldPrice)}</span>
              )}
            </div>
          </div>

          <p className="text-ink/60 font-light leading-relaxed mb-12 text-lg italic">{product.description}</p>

          {/* Options */}
          <div className="space-y-12 mb-16">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-6">Select Size</h4>
              <div className="flex flex-wrap gap-4">
                {product.sizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "w-14 h-14 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest transition-all duration-500",
                      selectedSize === size ? "bg-ink text-white" : "bg-paper text-ink/40 hover:bg-ink hover:text-white"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-6">Select Color</h4>
              <div className="flex flex-wrap gap-4">
                {product.colors.map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-all duration-500",
                      selectedColor === color ? "bg-ink text-white" : "bg-paper text-ink/40 hover:bg-ink hover:text-white"
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-6">Quantity</h4>
              <div className="flex items-center space-x-8">
                <div className="flex items-center bg-paper overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-5 hover:text-gold transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-ink">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-5 hover:text-gold transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
                <span className="text-[9px] font-bold text-ink/30 uppercase tracking-widest">{product.stock} items in stock</span>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            <button 
              onClick={() => {
                addToCart(product, selectedSize, selectedColor, quantity);
                navigate('/cart');
              }}
              className="flex-1 bg-ink text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all duration-700 flex items-center justify-center group"
            >
              <ShoppingBag size={16} className="mr-3 group-hover:-translate-y-1 transition-transform duration-500" /> Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-48">
          <div className="flex justify-between items-end mb-20 border-b border-ink/5 pb-10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-4 block">You Might Also Like</span>
              <h2 className="text-5xl font-serif italic text-ink tracking-tighter">Related <span className="text-gold">Pieces</span></h2>
            </div>
            <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink hover:text-gold transition-all duration-500 flex items-center group">
              View Category <ArrowRight size={12} className="ml-3 group-hover:translate-x-2 transition-transform duration-500" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="mt-48 max-w-4xl">
        <div className="mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-4 block">Client Feedback</span>
          <h2 className="text-5xl font-serif italic text-ink tracking-tighter mb-8">Product <span className="text-gold">Reviews</span></h2>
          
          <div className="flex items-center space-x-12 p-12 bg-paper rounded-sm">
            <div className="text-center">
              <div className="text-6xl font-serif italic text-ink mb-2">{product.rating}</div>
              <div className="flex items-center justify-center text-gold mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                ))}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-ink/30">Based on {reviews.length} reviews</div>
            </div>
            
            <div className="flex-1 space-y-3">
              {[5, 4, 3, 2, 1].map(star => {
                const count = reviews.filter(r => Math.floor(r.rating) === star).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center space-x-4">
                    <span className="text-[9px] font-bold text-ink/40 w-4">{star}</span>
                    <div className="flex-1 h-1 bg-ink/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-gold"
                      />
                    </div>
                    <span className="text-[9px] font-bold text-ink/40 w-8">{Math.round(percentage)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          {/* Review List */}
          <div className="space-y-12">
            {reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review.id} className="border-b border-ink/5 pb-12">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-paper rounded-full flex items-center justify-center text-[10px] font-bold text-ink/40">
                        {review.userName[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-ink">{review.userName}</h4>
                        <p className="text-[9px] font-bold text-ink/30 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-ink/60 font-light italic leading-relaxed">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border border-dashed border-ink/10 rounded-sm">
                <p className="text-ink/30 text-sm italic">No reviews yet. Be the first to share your experience.</p>
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="bg-paper p-12 rounded-sm h-fit sticky top-32">
            <h3 className="text-xl font-serif italic text-ink mb-8">Write a Review</h3>
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-4">Rating</label>
                  <div className="flex items-center space-x-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={cn(
                          "transition-all duration-300",
                          reviewRating >= star ? "text-gold scale-110" : "text-ink/10 hover:text-gold/40"
                        )}
                      >
                        <Star size={24} fill={reviewRating >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-4">Your Experience</label>
                  <textarea
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about the fit, quality, and style..."
                    className="w-full bg-white border-none p-6 text-sm italic text-ink/60 focus:ring-1 focus:ring-gold outline-none min-h-[150px] resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-ink text-white py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all duration-700 disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            ) : (
              <div className="text-center py-10">
                <p className="text-ink/40 text-sm italic mb-8">Please sign in to leave a review.</p>
                <Link 
                  to="/login"
                  className="inline-block bg-ink text-white px-10 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
