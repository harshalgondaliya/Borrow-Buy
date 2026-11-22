import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '../../services/products';
import {
  X,
  Layers,
  ArrowRight,
  Search
} from 'lucide-react';
import { resolveImageUrl } from '../../utils/apiUrl.js';

export interface CategoryPreviewData {
  slug: string;
  coverImage: string;
  previews: Array<{
    name: string;
    image: string;
  }>;
}

export const CATEGORY_VISUALS: Record<string, CategoryPreviewData> = {
  'laptops': {
    slug: 'laptops',
    coverImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'Apple MacBook Pro M3', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
      { name: 'Dell XPS 15 Laptop', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80' },
      { name: '4K Color-Accurate Monitor', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'cameras': {
    slug: 'cameras',
    coverImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'Sony Alpha Full-Frame Body', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80' },
      { name: 'Cinema Zoom Lens Kit', image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=600&q=80' },
      { name: '3-Axis Camera Gimbal', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'projectors': {
    slug: 'projectors',
    coverImage: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: '4K High-Lumens Projector', image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80' },
      { name: 'Compact Meeting Projector', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=600&q=80' },
      { name: '100-Inch Tripod Pull-Up Screen', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'mobile-accessories': {
    slug: 'mobile-accessories',
    coverImage: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'DJI Mobile Gimbal Stabilizer', image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=600&q=80' },
      { name: 'Dual Wireless Lavalier Mics', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80' },
      { name: 'Bi-Color Creator Ring Light', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'audio': {
    slug: 'audio',
    coverImage: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'JBL PartyBox High-Power Speaker', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80' },
      { name: 'Outdoor Event PA Sound System', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80' },
      { name: 'Shure Cordless UHF Microphone', image: 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'gaming': {
    slug: 'gaming',
    coverImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'Sony PlayStation 5 Console Kit', image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80' },
      { name: 'Meta Quest 3 VR Headset', image: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=600&q=80' },
      { name: 'DualSense Wireless Controller', image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'sports': {
    slug: 'sports',
    coverImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'English Willow Cricket Kit', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80' },
      { name: 'Yonex Badminton Racket Set', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80' },
      { name: 'Rubber Hex Dumbbell Pair', image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'bicycles': {
    slug: 'bicycles',
    coverImage: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'Trek 21-Speed Mountain Bike', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80' },
      { name: 'City Hybrid Commuter Cycle', image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80' },
      { name: 'Universal Car Bike Carrier', image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'tools': {
    slug: 'tools',
    coverImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'Bosch Cordless Drill Kit', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80' },
      { name: 'Heavy Rotary Hammer Drill', image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80' },
      { name: 'Professional Hand Toolkit', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'appliances': {
    slug: 'appliances',
    coverImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'Singer Electronic Sewing Machine', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
      { name: 'Room Air Purifier & Filter', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80' },
      { name: 'Handheld Steam Garment Iron', image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'kitchen': {
    slug: 'kitchen',
    coverImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'Philips Digital Air Fryer XL', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80' },
      { name: 'Portable Induction Cooktop', image: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=600&q=80' },
      { name: 'Stainless Buffet Chafing Set', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'instruments': {
    slug: 'instruments',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'Yamaha F310 Acoustic Guitar', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80' },
      { name: 'Roland 61-Key Keyboard', image: 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?auto=format&fit=crop&w=600&q=80' },
      { name: 'Concert Harmonium 9-Stopper', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'events': {
    slug: 'events',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'Stage Fog & Smoke Machine', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80' },
      { name: 'RGB Event Laser Lights', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80' },
      { name: 'Dual Nozzle Balloon Pump', image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'travel': {
    slug: 'travel',
    coverImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'Samsonite Hard-Shell Trolley', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80' },
      { name: 'Quechua 60L Trekking Backpack', image: 'https://images.unsplash.com/photo-1509744645300-a2098b11871a?auto=format&fit=crop&w=600&q=80' },
      { name: 'Waterproof Car Roof Cargo Bag', image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'study': {
    slug: 'study',
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'Texas Instruments CAS Calculator', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80' },
      { name: 'Architectural A1 Mini Drafter', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80' },
      { name: 'Wireless Presentation Clicker', image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'outdoor': {
    slug: 'outdoor',
    coverImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'Coleman 4-Person Dome Tent', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80' },
      { name: 'Sub-Zero Sleeping Bag', image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80' },
      { name: 'Portable Camping Gas Stove', image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'lighting': {
    slug: 'lighting',
    coverImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'Godox 300W Studio Strobe', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80' },
      { name: 'Octabox Softbox Kit with Stand', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80' },
      { name: 'RGB Handheld Tube Wand', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'office': {
    slug: 'office',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'Jabra Speak 710 Conference Unit', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80' },
      { name: 'Heavy Duty Paper Shredder', image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80' },
      { name: 'Mobile Magnetic Whiteboard', image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'networking': {
    slug: 'networking',
    coverImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'TP-Link Wi-Fi 6 Mesh System', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80' },
      { name: 'Gigabit 16-Port PoE Switch', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80' },
      { name: 'Pocket 4G LTE Wi-Fi Hotspot', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'cleaning': {
    slug: 'cleaning',
    coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'Kärcher High Pressure Washer', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80' },
      { name: '30L Industrial Wet/Dry Vacuum', image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80' },
      { name: 'Handheld Steam Sanitizer', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'drones': {
    slug: 'drones',
    coverImage: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
    previews: [
      { name: 'DJI Mavic 3 Cine 5.1K Drone', image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80' },
      { name: 'DJI Mini 4 Pro Drone Kit', image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=600&q=80' },
      { name: 'Intelligent Flight Battery Pack', image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  'video-production': {
    slug: 'video-production',
    coverImage: '/images/products/blackmagic-pocket-cinema-camera-6k-pro/image-01.webp',
    previews: [
      { name: 'Blackmagic Pocket Cinema 6K Pro', image: '/images/products/blackmagic-pocket-cinema-camera-6k-pro/image-01.webp' },
      { name: 'Hollyland Mars 400S Pro Wireless Video', image: '/images/products/hollyland-mars-400s-pro-wireless-video/image-01.webp' },
      { name: 'Aputure LS 600d Pro Daylight LED', image: '/images/products/aputure-ls-600d-pro-daylight-led/image-01.webp' },
    ],
  },
  'construction': {
    slug: 'construction',
    coverImage: '/images/products/dewalt-laser-level-green-beam-3x360/image-01.webp',
    previews: [
      { name: 'DeWalt 3x360 Green Beam Laser Level', image: '/images/products/dewalt-laser-level-green-beam-3x360/image-01.webp' },
      { name: 'Honda 2.5 kVA Portable Silent Generator', image: '/images/products/honda-2-5kva-portable-silent-generator/image-01.webp' },
      { name: 'Heavy Duty Aluminium Scaffolding Tower', image: '/images/products/heavy-duty-aluminium-scaffolding-tower-15ft/image-01.webp' },
    ],
  },
  'baby-family': {
    slug: 'baby-family',
    coverImage: '/images/products/chicco-bravo-trio-travel-system-stroller/image-01.webp',
    previews: [
      { name: 'Chicco Bravo Trio Travel System Stroller', image: '/images/products/chicco-bravo-trio-travel-system-stroller/image-01.webp' },
      { name: 'Graco Pack n Play Portable Playard', image: '/images/products/graco-pack-n-play-portable-playard/image-01.webp' },
      { name: 'Ergobaby Omni 360 All-Position Carrier', image: '/images/products/ergobaby-omni-360-all-position-carrier/image-01.webp' },
    ],
  },
  'decor-furniture': {
    slug: 'decor-furniture',
    coverImage: '/images/products/wooden-easel-stand-wedding-welcome-board/image-01.webp',
    previews: [
      { name: 'Wedding Welcome Wooden Easel Stand', image: '/images/products/wooden-easel-stand-wedding-welcome-board/image-01.webp' },
      { name: 'Warm White Outdoor Commercial Fairy Lights', image: '/images/products/warm-white-outdoor-commercial-fairy-lights-50m/image-01.webp' },
      { name: 'Foldable Banquet Catering Tables 6ft', image: '/images/products/foldable-banquet-catering-tables-set-of-4/image-01.webp' },
    ],
  },
};

interface CategoryExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId?: string) => void;
  products?: any[];
  onSelectProduct?: (product: any) => void;
  onSearchProduct?: (productName: string, categoryId?: string) => void;
}

export const CategoryExplorerModal: React.FC<CategoryExplorerModalProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategoryId,
  onSelectCategory,
  products = [],
  onSelectProduct,
  onSearchProduct: _onSearchProduct,
}) => {
  const [activeCategory, setActiveCategory] = useState<Category | null>(() => {
    return categories.find((c) => c.id === selectedCategoryId) || categories[0] || null;
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Update activeCategory if categories load or selected changes
  React.useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeVisual = activeCategory
    ? CATEGORY_VISUALS[activeCategory.slug] || CATEGORY_VISUALS['cameras']
    : CATEGORY_VISUALS['cameras'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-bb-border max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col z-10"
        >
          {/* Top Header */}
          <div className="p-5 sm:p-6 border-b border-bb-border bg-bb-surface-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-bb-accent/10 text-bb-accent flex items-center justify-center border border-bb-accent/20 shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-display font-extrabold text-bb-text-primary">
                  Rental Categories Catalog
                </h2>
                <p className="text-xs text-bb-text-secondary">
                  Explore {categories.length} curated product categories with real examples across India
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-bb-text-secondary hover:text-bb-text-primary rounded-xl hover:bg-slate-200 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Grid: Left Sidebar list + Right Details view */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            {/* Left Column: Category selector list with search */}
            <div className="w-full md:w-72 border-r border-bb-border p-4 overflow-y-auto bg-bb-surface-subtle flex flex-col gap-2 shrink-0 max-h-60 md:max-h-none">
              <div className="relative mb-1">
                <Search className="w-3.5 h-3.5 text-bb-text-secondary absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-bb-border rounded-xl focus:outline-none focus:ring-2 focus:ring-bb-accent text-bb-text-primary"
                />
              </div>

              <div className="space-y-1">
                {filteredCategories.map((cat) => {
                  const isSelected = activeCategory?.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-bb-text-primary text-white shadow-xs font-bold'
                          : 'text-bb-text-secondary hover:bg-white hover:text-bb-text-primary'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {cat._count?.products !== undefined && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-bb-text-primary'
                          }`}
                        >
                          {cat._count.products}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Visual category spotlight & 3 real examples */}
            {activeCategory && (
              <div className="flex-1 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between space-y-6 bg-white">
                <div>
                  {/* Category Cover Banner */}
                  <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden border border-bb-border shadow-xs mb-5 group">
                    <img
                      src={activeVisual?.coverImage || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80'}
                      alt={activeCategory.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-5 text-white">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300 mb-1">
                        Curated Category
                      </span>
                      <h3 className="font-display font-black text-xl sm:text-2xl leading-tight text-white">
                        {activeCategory.name}
                      </h3>
                      <p className="text-xs text-slate-200 mt-1 max-w-lg line-clamp-2">
                        {activeCategory.description}
                      </p>
                    </div>
                  </div>

                  {/* Real Product Visual Examples from Database */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-bb-text-secondary">
                        Available Equipment in this Category
                      </h4>
                      <span className="text-[11px] text-bb-accent font-semibold">Click any item to view & rent</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {((products || []).filter((p) => p.categoryId === activeCategory.id).length > 0
                        ? (products || []).filter((p) => p.categoryId === activeCategory.id).slice(0, 3)
                        : (activeVisual?.previews || []).map((pv) => ({
                            id: `preview-${pv.name}`,
                            name: pv.name,
                            images: [pv.image],
                            pricePerDay: 1500,
                            securityDeposit: 5000,
                            condition: 'LIKE_NEW',
                            location: 'Ahmedabad',
                          } as any))
                      ).map((item: any, i: number) => {
                        const imgSrc = resolveImageUrl(item.images?.[0]);

                        return (
                          <div
                            key={item.id || i}
                            onClick={() => {
                              onClose();
                              if (onSelectProduct && item.id && !item.id.startsWith('preview-')) {
                                onSelectProduct(item);
                              } else {
                                onSelectCategory(activeCategory.id);
                              }
                            }}
                            className="rounded-xl border border-bb-border overflow-hidden bg-white shadow-xs group cursor-pointer hover:border-bb-accent hover:shadow-card transition-all duration-200 text-left"
                          >
                            <div className="h-28 overflow-hidden bg-bb-surface-subtle relative">
                              <img
                                src={imgSrc}
                                alt={item.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80';
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="px-2.5 py-1 bg-white text-bb-text-primary text-[10px] font-bold rounded-lg shadow-sm flex items-center gap-1">
                                  <span>View & Rent</span>
                                  <ArrowRight className="w-3 h-3 text-bb-accent" />
                                </span>
                              </div>
                            </div>
                            <div className="p-2.5">
                              <div className="font-bold text-xs text-bb-text-primary truncate group-hover:text-bb-accent transition-colors">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-bb-accent font-semibold mt-0.5 flex items-center justify-between">
                                <span>₹{item.pricePerDay || 1500}/day</span>
                                <span className="text-[10px] text-bb-text-secondary underline">Open &rarr;</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA to Filter Catalog by this category */}
                <div className="pt-4 border-t border-bb-border flex items-center justify-between">
                  <div className="text-xs text-bb-text-secondary">
                    {activeCategory._count?.products || 0} active listings in Gujarat
                  </div>

                  <button
                    onClick={() => {
                      onSelectCategory(activeCategory.id);
                      onClose();
                    }}
                    className="px-5 py-2.5 bg-bb-accent hover:bg-bb-accent-hover text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
                  >
                    <span>View {activeCategory.name} Listings</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
