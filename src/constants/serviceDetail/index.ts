import { ImageSourcePropType } from 'react-native';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  rating: string;
  reviewCount: string;
  duration: string;
  price: number;
  originalPrice?: number;
  successHighlight: string;
  popular?: boolean;
  image: any;
}

export interface ServiceDetailData {
  id: string;
  title: string;
  category: string;
  description: string;
  image: any;
  bgColor: string;
  services: ServiceItem[];
}

export const TRUST_INDICATORS = [
  { id: '1', svgType: 'shield', title: 'Verified Pros', subtitle: 'Background checked', color: '#1565C0', bg: '#EEF6FF' },
  { id: '2', svgType: 'clock', title: 'On-Time', subtitle: 'Guaranteed arrival', color: '#2E7D32', bg: '#F0FAF0' },
  { id: '3', svgType: 'award', title: '30-Day Warranty', subtitle: 'On all services', color: '#E65100', bg: '#FFF7EE' },
  { id: '4', svgType: 'tag', title: 'Best Price', subtitle: 'No hidden charges', color: '#7B1FA2', bg: '#F8F0FC' },
] as const;
