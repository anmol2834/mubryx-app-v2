export interface CategoryApiDto {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  iconBg?: string;
  iconColor?: string;
  bgColor?: string;
  displayOrder?: number;
  placement?: 'QUICK_SERVICE' | 'APPLIANCE' | 'NONE';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    services: number;
  };
}

export interface CategoryModel {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  iconBg: string;
  iconColor: string;
  bgColor: string;
  displayOrder: number;
  placement: 'QUICK_SERVICE' | 'APPLIANCE' | 'NONE';
  description: string;
  serviceCount: number;
}
