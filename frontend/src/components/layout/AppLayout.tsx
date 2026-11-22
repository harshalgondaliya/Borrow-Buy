import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useModals } from '../../features/modal/ModalContext';
import { Category, Product, productsService } from '../../services/products';
import { ProductDetailsModal } from '../product/ProductDetailsModal';
import { DateRangePickerModal } from '../booking/DateRangePickerModal';
import { WishlistModal } from '../product/WishlistModal';
import { UserProfileModal } from '../auth/UserProfileModal';
import { HelpFaqModal } from '../common/HelpFaqModal';
import { AboutModal } from '../common/AboutModal';
import { CategoryExplorerModal } from '../product/CategoryExplorerModal';
import { AuthModal } from '../auth/AuthModal';
import { StartupSplash } from '../common/StartupSplash';

export const AppLayout: React.FC = () => {
  const {
    selectedProduct,
    closeProduct,
    bookingProduct,
    closeBooking,
    openBooking,
    openProduct,
    authModalOpen,
    closeAuth,
    authTab,
    categoryExplorerOpen,
    closeCategoryExplorer,
    wishlistOpen,
    closeWishlist,
    profileOpen,
    closeProfile,
    helpOpen,
    closeHelp,
    aboutOpen,
    closeAbout,
  } = useModals();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productsService
      .getCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Failed to load categories', err));

    productsService
      .listProducts({ page: 1, limit: 30 })
      .then((res) => setProducts(res.products))
      .catch((err) => console.error('Failed to load products for modals', err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#17191C] antialiased selection:bg-[#315CF5] selection:text-white font-sans">
      <StartupSplash />

      <Navbar categoryCount={categories.length || 25} />

      <main className="flex-1 w-full">
        <Outlet context={{ categories, products }} />
      </main>

      <Footer />

      {/* Global Modals */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={closeProduct}
        onBookNow={(p) => openBooking(p)}
      />

      <DateRangePickerModal
        product={bookingProduct}
        isOpen={!!bookingProduct}
        onClose={closeBooking}
        onBookingSuccess={() => {
          closeBooking();
        }}
      />

      <WishlistModal
        isOpen={wishlistOpen}
        onClose={closeWishlist}
        products={products}
        onSelectProduct={openProduct}
        onInitiateBooking={openBooking}
      />

      <UserProfileModal isOpen={profileOpen} onClose={closeProfile} />

      <HelpFaqModal isOpen={helpOpen} onClose={closeHelp} />

      <AboutModal isOpen={aboutOpen} onClose={closeAbout} />

      <CategoryExplorerModal
        isOpen={categoryExplorerOpen}
        onClose={closeCategoryExplorer}
        categories={categories}
        products={products}
        onSelectCategory={(catId) => {
          closeCategoryExplorer();
          window.location.href = `/browse?category=${catId}`;
        }}
        onSelectProduct={(p) => {
          closeCategoryExplorer();
          openProduct(p);
        }}
      />

      <AuthModal isOpen={authModalOpen} onClose={closeAuth} initialTab={authTab} />
    </div>
  );
};
