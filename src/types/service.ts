import { CategoryApiDto, CategoryModel } from './category';
import { ServiceReviewApiDto, ServiceReviewModel } from './review';

export interface ServiceApiDto {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount: number;
  duration: string;
  image: string;
  features?: string[];
  isPopular?: boolean;
  tag?: string;
  tagColor?: string;
  tagBg?: string;
  iconColor?: string;
  iconBg?: string;
  svgType?: string;
  category?: CategoryApiDto;
  reviews?: ServiceReviewApiDto[];
}

export interface ServiceModel {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount: number;
  duration: string;
  image: string;
  features: string[];
  isPopular: boolean;
  tag: string;
  tagColor: string;
  tagBg: string;
  iconColor: string;
  iconBg: string;
  svgType: string;
  category?: CategoryModel;
  reviews?: ServiceReviewModel[];
}
