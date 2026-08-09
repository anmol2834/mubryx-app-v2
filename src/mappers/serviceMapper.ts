import { ServiceApiDto, ServiceModel } from '@/types/service';
import { ServiceReviewApiDto, ServiceReviewModel } from '@/types/review';
import { mapCategory } from './categoryMapper';
import { getImageUrl } from '@/utils/image';
import { safeNumber } from '@/utils/number';

export function mapReview(dto: ServiceReviewApiDto): ServiceReviewModel {
  if (!dto) {
    return {
      id: '',
      rating: 5,
      comment: '',
      createdAt: new Date().toISOString(),
      user: { id: '', fullName: 'User' },
    };
  }

  return {
    id: String(dto.id || ''),
    rating: safeNumber(dto.rating, 5, 'Review.rating'),
    comment: String(dto.comment || ''),
    createdAt: String(dto.createdAt || new Date().toISOString()),
    user: {
      id: String(dto.user?.id || ''),
      fullName: String(dto.user?.fullName || 'User'),
      avatar: dto.user?.avatar ? getImageUrl(dto.user.avatar) : undefined,
    },
  };
}

export function mapService(dto: ServiceApiDto): ServiceModel {
  if (!dto) {
    return {
      id: '',
      categoryId: '',
      title: 'Service',
      description: '',
      price: 0,
      rating: 5.0,
      reviewCount: 0,
      duration: '45 mins',
      image: getImageUrl(null),
      features: [],
      isPopular: false,
      tag: '',
      tagColor: '#000000',
      tagBg: '#FFFFFF',
      iconColor: '#000000',
      iconBg: '#FFFFFF',
      svgType: 'thermometer',
    };
  }

  const parsedPrice = safeNumber(dto.price, 0, 'Service.price');
  const parsedDiscount = dto.discountPrice !== undefined && dto.discountPrice !== null
    ? safeNumber(dto.discountPrice, undefined as any, 'Service.discountPrice')
    : undefined;

  const parsedRating = safeNumber(dto.rating, 5.0, 'Service.rating');
  const parsedReviewCount = safeNumber(dto.reviewCount, 0, 'Service.reviewCount');

  return {
    id: String(dto.id || ''),
    categoryId: String(dto.categoryId || ''),
    title: String(dto.title || 'Service'),
    description: String(dto.description || ''),
    price: parsedPrice,
    discountPrice: parsedDiscount,
    rating: parsedRating,
    reviewCount: parsedReviewCount,
    duration: String(dto.duration || '45 mins'),
    image: dto.image && dto.image.includes('http') ? dto.image : getImageUrl(dto.image),
    features: Array.isArray(dto.features) ? dto.features.map(String) : [],
    isPopular: Boolean(dto.isPopular),
    tag: String(dto.tag || ''),
    tagColor: String(dto.tagColor || '#000000'),
    tagBg: String(dto.tagBg || '#FFFFFF'),
    iconColor: String(dto.iconColor || '#000000'),
    iconBg: String(dto.iconBg || '#FFFFFF'),
    svgType: String(dto.svgType || 'thermometer'),
    category: dto.category ? mapCategory(dto.category) : undefined,
    reviews: Array.isArray(dto.reviews) ? dto.reviews.filter(Boolean).map(mapReview) : [],
  };
}

export function mapServiceList(dtos: ServiceApiDto[]): ServiceModel[] {
  if (!Array.isArray(dtos)) return [];
  return dtos.filter(Boolean).map(mapService);
}
