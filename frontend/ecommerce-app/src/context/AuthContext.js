import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { authAPI } from '../services/authAPI';
import { cartAPI } from '../services/cartAPI';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  const clearCartFrontend = useCallback(() => {
        setCart([]); 
    }, []);

  const logout = useCallback(() => {
    sessionStorage.setItem(
      'logoutMessage',
      JSON.stringify({
        message: 'You have successfully logged out.',
        type: 'success',
      }),
    );
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setWishlist([]);
    setCart([]);
    window.location.reload();
  }, []);

  useEffect(() => {
    if (!user) return;
    let inactivityTimer;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(logout, 3600 * 1000);
    };
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user, logout]);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const [userData, wishlistData, cartData] = await Promise.all([
            authAPI.getProfile(),
            authAPI.getWishlist(),
            cartAPI.getCart(),
          ]);

          setUser(userData);
          setWishlist(wishlistData || []);

          const validCart = (cartData || []).filter(
            (item) => item && item.product,
          );
          setCart(validCart);
        } catch (error) {
          console.error('Session expired or invalid:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setWishlist([]);
          setCart([]);
        }
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setCart(guestCart);
      }
      setAuthLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  const cleanupCorruptedCartItems = useCallback(async () => {
    if (!user) return;

    try {
      const currentCart = await cartAPI.getCart();
      const corruptedItems = (currentCart || []).filter(
        (item) => !item?.product,
      );

      if (corruptedItems.length > 0) {
        console.log(
          `Cleaning up ${corruptedItems.length} corrupted cart items`,
        );

        for (const item of corruptedItems) {
          try {
            await cartAPI.removeCartItem(item._id);
            console.log('Removed corrupted cart item:', item._id);
          } catch (error) {
            console.error('Failed to remove corrupted item:', error);
          }
        }

        const cleanCart = await cartAPI.getCart();
        const validCart = (cleanCart || []).filter((item) => item?.product);
        setCart(validCart);
      }
    } catch (error) {
      console.error('Failed to cleanup cart:', error);
    }
  }, [user]);

  const fetchCart = useCallback(async () => {
    if (user) {
      try {
        const updatedCart = await cartAPI.getCart();

        const validCart = (updatedCart || []).filter((item) => {
          const isValid = item && item.product;
          if (!isValid) {
            console.warn('Removing invalid cart item:', item?._id);
          }
          return isValid;
        });

        setCart(validCart);

        if (validCart.length < (updatedCart || []).length) {
          console.log('Cleaning corrupted cart items from backend...');
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      }
    }
  }, [user]);

  const addToCart = useCallback(
    async (itemData) => {
      if (!user) {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');

        const newItem = { ...itemData, _id: `guest_${Date.now()}` };
        guestCart.push(newItem);
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        setCart(guestCart);
        return { success: true, message: 'Item added to guest cart.' };
      }

      try {
        const updatedCart = await cartAPI.addToCart(itemData);

        setCart(updatedCart);
        return { success: true, message: 'Item added to cart!' };
      } catch (error) {
        console.error('Error adding to cart:', error);
        return {
          success: false,
          message: error.message || 'Failed to add to cart.',
        };
      }
    },
    [user],
  );

  const removeCartItem = useCallback(
    async (itemId) => {
      if (!user) {
        let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        guestCart = guestCart.filter((item) => item._id !== itemId);
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        setCart(guestCart);
        return { success: true };
      }
      try {
        const updatedCart = await cartAPI.removeCartItem(itemId);

        setCart(updatedCart);
        return { success: true };
      } catch (error) {
        console.error('Error removing cart item:', error);
        return { success: false, message: error.message };
      }
    },
    [user],
  );

  const updateCartItemQuantity = useCallback(
    async (itemId, quantity) => {
      if (!user) {
        let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const itemIndex = guestCart.findIndex((item) => item._id === itemId);
        if (itemIndex > -1) {
          guestCart[itemIndex].quantity = quantity;
          if (quantity <= 0) {
            guestCart.splice(itemIndex, 1);
          }
        }
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        setCart([...guestCart]);
        return { success: true };
      }
      try {
        const updatedCart = await cartAPI.updateCartItem(itemId, quantity);

        setCart(updatedCart);
        return { success: true };
      } catch (error) {
        console.error('Error updating cart item quantity:', error);
        return { success: false, message: error.message };
      }
    },
    [user],
  );

  const updateCartItemDetails = useCallback(
    async (itemId, details) => {
      if (!user) return { success: false, message: 'User not logged in.' };
      try {
        const updatedCart = await cartAPI.updateCartItemDetails(
          itemId,
          details,
        );
        setCart(updatedCart);
        return { success: true };
      } catch (error) {
        console.error('Error updating cart item details:', error);
        return { success: false, message: error.message };
      }
    },
    [user],
  );

  const value = {
    user,
    setUser,
    authLoading,
    showLoginModal,
    setShowLoginModal,
    wishlist,
    setWishlist,
    cart,
    setCart,
    addToCart,
    removeCartItem,
    updateCartItemQuantity,
    updateCartItemDetails,
    fetchCart,
    logout,
    cleanupCorruptedCartItems,
    clearCartFrontend, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
