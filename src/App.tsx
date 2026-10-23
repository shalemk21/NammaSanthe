import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DeviceFrame } from './components/DeviceFrame';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './components/HomeScreen';
import { CategoriesScreen } from './components/CategoriesScreen';
import { ProductListingScreen } from './components/ProductListingScreen';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { CartScreen } from './components/CartScreen';
import { OrdersTrackingScreen } from './components/OrdersTrackingScreen';
import { ProfileScreen } from './components/ProfileScreen';

// Seller / Vendor Flow Screens
import { SellerDashboard } from './components/seller/SellerDashboard';
import { SellerAddProductScreen } from './components/seller/SellerAddProductScreen';
import { SellerInventoryScreen } from './components/seller/SellerInventoryScreen';
import { SellerOrdersScreen } from './components/seller/SellerOrdersScreen';
import { SellerAnalyticsScreen } from './components/seller/SellerAnalyticsScreen';

const MainNavigator: React.FC = () => {
  const { activeRole, customerScreen, sellerScreen } = useApp();

  if (activeRole === 'seller') {
    switch (sellerScreen) {
      case 'dashboard':
        return <SellerDashboard />;
      case 'inventory':
        return <SellerInventoryScreen />;
      case 'add_product':
        return <SellerAddProductScreen />;
      case 'orders':
        return <SellerOrdersScreen />;
      case 'analytics':
        return <SellerAnalyticsScreen />;
      default:
        return <SellerDashboard />;
    }
  }

  // Customer Flow
  switch (customerScreen) {
    case 'splash':
      return <SplashScreen />;
    case 'home':
      return <HomeScreen />;
    case 'categories':
      return <CategoriesScreen />;
    case 'listing':
      return <ProductListingScreen />;
    case 'detail':
      return <ProductDetailScreen />;
    case 'cart':
      return <CartScreen />;
    case 'orders':
      return <OrdersTrackingScreen />;
    case 'profile':
      return <ProfileScreen />;
    default:
      return <HomeScreen />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <DeviceFrame>
        <MainNavigator />
      </DeviceFrame>
    </AppProvider>
  );
}
