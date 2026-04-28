export type PromotionType = 'CATEGORY' | 'PRODUCT';

export interface Promotion {
  id: string;
  type: PromotionType;
  target: string;
  discountPercent: number;
  active: boolean;
  title: string;
  startsAt?: Date;
  endsAt?: Date;
  createdAt: Date;
}
