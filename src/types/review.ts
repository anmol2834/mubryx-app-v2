export interface ServiceReviewApiDto {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface ServiceReviewModel {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}
