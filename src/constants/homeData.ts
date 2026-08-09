export const HERO_BANNERS = [
  { id: '1', image: require('@/assets/images/ac-new.png') },
  { id: '2', image: require('@/assets/images/electrician-new.png') },
  { id: '3', image: require('@/assets/images/geyser-new.png') },
  { id: '4', image: require('@/assets/images/plumbing-new.png') },
  { id: '5', image: require('@/assets/images/refragirator-new.png') },
  { id: '6', image: require('@/assets/images/tv-new.png') },
  { id: '7', image: require('@/assets/images/whashing-new.png') },
] as const;

export const SPECIAL_OFFERS = [
  {
    id: '1',
    title: 'AC Summer Special',
    desc: 'Complete service + gas refill',
    discount: '40% OFF',
    original: '₹999',
    price: '₹599',
    expires: 'Ends tonight',
    gradient: ['#E65100', '#F57C00'] as readonly [string, string],
  },
  {
    id: '2',
    title: 'Combo Service Pack',
    desc: 'AC + Refrigerator service',
    discount: '35% OFF',
    original: '₹1499',
    price: '₹999',
    expires: '2 days left',
    gradient: ['#6A1B9A', '#8E24AA'] as readonly [string, string],
  },
  {
    id: '3',
    title: 'New User Offer',
    desc: 'First service at flat discount',
    discount: '₹200 OFF',
    original: '₹699',
    price: '₹499',
    expires: 'Limited slots',
    gradient: ['#1565C0', '#0288D1'] as readonly [string, string],
  },
] as const;

export const WHY_MUBRYX = [
  { id: '1', svgType: 'shield-check', iconColor: '#1565C0', iconBg: '#EEF6FF', title: 'Verified Technicians', desc: 'Background checked & certified' },
  { id: '2', svgType: 'zap', iconColor: '#F9A825', iconBg: '#FEFDE8', title: 'Fast Service', desc: 'Same day & 2-hour slots' },
  { id: '3', svgType: 'award', iconColor: '#2E7D32', iconBg: '#F0FAF0', title: '90-Day Warranty', desc: 'On all repairs & parts' },
  { id: '4', svgType: 'tag', iconColor: '#E65100', iconBg: '#FFF7EE', title: 'Best Pricing', desc: 'Transparent, no hidden fees' },
  { id: '5', svgType: 'settings', iconColor: '#7B1FA2', iconBg: '#F8F0FC', title: 'Genuine Parts', desc: 'OEM & branded spares only' },
  { id: '6', svgType: 'headphones', iconColor: '#00695C', iconBg: '#EDFAF7', title: '24×7 Support', desc: 'Always here to help you' },
] as const;

export const REVIEWS = [
  {
    id: '1',
    name: 'Priya Sharma',
    service: 'AC Repair',
    rating: 5,
    review: 'Excellent service! The technician arrived on time and fixed my AC in under an hour. Very professional.',
    avatar: 'PS',
    avatarColor: '#1565C0',
    date: '2 days ago',
  },
  {
    id: '2',
    name: 'Rahul Verma',
    service: 'Refrigerator Service',
    rating: 5,
    review: 'Amazing experience. Transparent pricing, genuine parts used. My fridge is working perfectly now.',
    avatar: 'RV',
    avatarColor: '#00695C',
    date: '1 week ago',
  },
  {
    id: '3',
    name: 'Anita Patel',
    service: 'Washing Machine',
    rating: 5,
    review: 'Booked at 9 AM, technician arrived by 11 AM. Fixed the leak issue with 90-day warranty. Highly recommend!',
    avatar: 'AP',
    avatarColor: '#6A1B9A',
    date: '3 days ago',
  },
] as const;

export const POPULAR_SEARCHES = [
  'AC Not Cooling',
  'Washing Machine Leak',
  'Fridge Repair',
  'Microwave Fix',
  'RO Service',
  'TV Repair',
] as const;
