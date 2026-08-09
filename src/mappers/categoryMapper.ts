import { CategoryApiDto, CategoryModel } from '@/types/category';
import { getImageUrl } from '@/utils/image';
import { safeNumber } from '@/utils/number';
export function mapCategory(dto: CategoryApiDto): CategoryModel {
  if (!dto) {
    return {
      id: '',
      name: 'Category',
      slug: '',
      icon: 'grid',
      image: getImageUrl(null),
      iconBg: '#F5F5F5',
      iconColor: '#333333',
      bgColor: '#FFFFFF',
      displayOrder: 0,
      placement: 'NONE',
      description: '',
      serviceCount: 0,
    };
  }
  const placement = dto.placement || 'NONE';
  const mappedCategory: CategoryModel = {
    id: String(dto.id || ''),
    name: String(dto.name || 'Category'),
    slug: String(dto.slug || ''),
    icon: String(dto.icon || 'grid'),
    image: dto.image && dto.image.includes('http') ? dto.image : getImageUrl(dto.image),
    iconBg: String(dto.iconBg || '#F5F5F5'),
    iconColor: String(dto.iconColor || '#333333'),
    bgColor: String(dto.bgColor || '#FFFFFF'),
    displayOrder: safeNumber(dto.displayOrder, 0, 'Category.displayOrder'),
    placement: placement as 'QUICK_SERVICE' | 'APPLIANCE' | 'NONE',
    description: String(dto.description || ''),
    serviceCount: safeNumber(dto._count?.services, 0, 'Category.serviceCount'),
  };
  return mappedCategory;
}
export function mapCategoryList(dtos: CategoryApiDto[]): CategoryModel[] {
  if (!Array.isArray(dtos)) return [];
  return dtos.filter(Boolean).map(mapCategory);
}
