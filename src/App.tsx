import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DeviceFrame } from './components/DeviceFrame';
import { AuthModal } from './components/AuthModal';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './components/HomeScreen';
import { CategoriesScreen } from './components/CategoriesScreen';
import { ProductListingScreen } from './components/ProductListingScreen';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { ShopProfileScreen } from './components/ShopProfileScreen';
import { ProductComparisonScreen } from './components/ProductComparisonScreen';
import { CartScreen } from './components/CartScreen';
import { OrdersTrackingScreen } from './components/OrdersTrackingScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { HelpScreen } from './components/HelpScreen';
import { PaymentConfirmationScreen } from './components/PaymentConfirmationScreen';

// Seller / Vendor Flow Screens
import { SellerDashboard } from './components/seller/SellerDashboard';
import { SellerAddProductScreen } from './components/seller/SellerAddProductScreen';
import { SellerInventoryScreen } from './components/seller/SellerInventoryScreen';
import { SellerOrdersScreen } from './components/seller/SellerOrdersScreen';
import { SellerAnalyticsScreen } from './components/seller/SellerAnalyticsScreen';
import { SellerReturnsScreen } from './components/seller/SellerReturnsScreen';
import { SellerDeliverySettingsScreen } from './components/seller/SellerDeliverySettingsScreen';

// Admin Screens
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminSellersScreen } from './components/admin/AdminSellersScreen';
import { AdminListingsScreen } from './components/admin/AdminListingsScreen';
import { AdminDisputesScreen } from './components/admin/AdminDisputesScreen';
import { AdminBannersScreen } from './components/admin/AdminBannersScreen';

const MainNavigator: React.FC = () => {
  const { activeRole, customerScreen, sellerScreen, adminScreen } = useApp();

  // Admin Flow
  if (activeRole === 'admin') {
    switch (adminScreen) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'sellers':
        return <AdminSellersScreen />;
      case 'listings':
        return <AdminListingsScreen />;
      case 'disputes':
        return <AdminDisputesScreen />;
      case 'banners':
        return <AdminBannersScreen />;
      default:
        return <AdminDashboard />;
    }
  }

  // Seller / Vendor Flow
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
      case 'returns':
        return <SellerReturnsScreen />;
      case 'delivery_settings':
        return <SellerDeliverySettingsScreen />;
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
    case 'shop':
      return <ShopProfileScreen />;
    case 'compare':
      return <ProductComparisonScreen />;
    case 'cart':
      return <CartScreen />;
    case 'orders':
    case 'order_tracking':
      return <OrdersTrackingScreen />;
    case 'payment_confirmation':
      return <PaymentConfirmationScreen />;
    case 'profile':
      return <ProfileScreen />;
    case 'help':
      return <HelpScreen />;
    default:
      return <HomeScreen />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <DeviceFrame>
        <MainNavigator />
        <AuthModal />
      </DeviceFrame>
    </AppProvider>
  );
}
