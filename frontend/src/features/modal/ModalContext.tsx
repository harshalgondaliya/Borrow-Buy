import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../../services/products';

interface ModalContextType {
  // Modals state
  selectedProduct: Product | null;
  bookingProduct: Product | null;
  authModalOpen: boolean;
  authTab: 'login' | 'register';
  categoryExplorerOpen: boolean;
  wishlistOpen: boolean;
  profileOpen: boolean;
  helpOpen: boolean;
  aboutOpen: boolean;

  // Actions
  openProduct: (product: Product) => void;
  closeProduct: () => void;
  openBooking: (product: Product) => void;
  closeBooking: () => void;
  openAuth: (tab?: 'login' | 'register') => void;
  closeAuth: () => void;
  openCategoryExplorer: () => void;
  closeCategoryExplorer: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  openProfile: () => void;
  closeProfile: () => void;
  openHelp: () => void;
  closeHelp: () => void;
  openAbout: () => void;
  closeAbout: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bookingProduct, setBookingProduct] = useState<Product | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [categoryExplorerOpen, setCategoryExplorerOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const openProduct = (product: Product) => setSelectedProduct(product);
  const closeProduct = () => setSelectedProduct(null);

  const openBooking = (product: Product) => {
    setSelectedProduct(null);
    setBookingProduct(product);
  };
  const closeBooking = () => setBookingProduct(null);

  const openAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  };
  const closeAuth = () => setAuthModalOpen(false);

  const openCategoryExplorer = () => setCategoryExplorerOpen(true);
  const closeCategoryExplorer = () => setCategoryExplorerOpen(false);

  const openWishlist = () => setWishlistOpen(true);
  const closeWishlist = () => setWishlistOpen(false);

  const openProfile = () => setProfileOpen(true);
  const closeProfile = () => setProfileOpen(false);

  const openHelp = () => setHelpOpen(true);
  const closeHelp = () => setHelpOpen(false);

  const openAbout = () => setAboutOpen(true);
  const closeAbout = () => setAboutOpen(false);

  return (
    <ModalContext.Provider
      value={{
        selectedProduct,
        bookingProduct,
        authModalOpen,
        authTab,
        categoryExplorerOpen,
        wishlistOpen,
        profileOpen,
        helpOpen,
        aboutOpen,
        openProduct,
        closeProduct,
        openBooking,
        closeBooking,
        openAuth,
        closeAuth,
        openCategoryExplorer,
        closeCategoryExplorer,
        openWishlist,
        closeWishlist,
        openProfile,
        closeProfile,
        openHelp,
        closeHelp,
        openAbout,
        closeAbout,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
}
