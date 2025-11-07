import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './components/ToastStyles.css';

// Screens
import Home from './screens/Home';
import Product from './screens/Product';
import Cart from './screens/Cart';
import Login from './screens/Login';
import Register from './screens/Register';
import Profile from './screens/Profile';
import Shipping from './screens/Shipping';
import Payment from './screens/Payment';
import PlaceOrder from './screens/PlaceOrder';
import Order from './screens/Order';
import UserList from './screens/admin/UserList';
import UserEdit from './screens/admin/UserEdit';
import ProductList from './screens/admin/ProductList';
import ProductEdit from './screens/admin/ProductEdit';
import ProductCreate from './screens/admin/ProductCreate';
import OrderList from './screens/admin/OrderList';

// Components
import Navbar from './components/Navbar';
import Newnav from './components/Newnav';
import Footer from './components/Footer';

// Styles
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Navbar />
        <Newnav />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/placeorder" element={<PlaceOrder />} />
            <Route path="/order/:id" element={<Order />} />
            
            {/* Admin Routes */}
            <Route path="/admin/userlist" element={<UserList />} />
            <Route path="/admin/user/:id/edit" element={<UserEdit />} />
            <Route path="/admin/productlist" element={<ProductList />} />
            <Route path="/admin/product/create" element={<ProductCreate />} />
            <Route path="/admin/product/:id/edit" element={<ProductEdit />} />
            <Route path="/admin/orderlist" element={<OrderList />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </Provider>
  );
}

export default App;