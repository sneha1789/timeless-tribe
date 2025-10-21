import React from 'react';
// --- 1. ADD THIS IMPORT LINE ---
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Your component imports
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Category from './pages/Category/Category';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import Contact from './pages/Contact/Contact';
import Profile from './pages/Profile/Profile';
import { AuthProvider } from './context/AuthContext';
import SearchPage from './pages/SearchPage/SearchPage';
import Checkout from './pages/Checkout/Checkout';
import PaymentPage from './pages/Payment/PaymentPage';
import OrderSuccess from './pages/OrderSuccess/OrderSuccess'; 
import OrderDetailPage from './pages/OrderDetailPage/OrderDetailPage';


import './App.css';


function App() {
  return (
    <AuthProvider> 
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
             <Route path="/search" element={<SearchPage />} />
             <Route path="/order-confirmation" element={<OrderConfirmation />} />
             <Route path="/contact" element={<Contact />} />
             <Route path="/profile" element={<Profile />} />
             <Route path="/checkout" element={<Checkout />} />
             <Route path="/checkout/payment" element={<PaymentPage />} />
               <Route path="/order-success" element={<OrderSuccess />} />
               <Route path="/order/:orderId" element={<OrderDetailPage />} />
                <Route path="/contact" element={<Contact />} />
       
            {/* Add more routes as needed */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;