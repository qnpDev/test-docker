export interface IConditionItem {
  itemId: number;
  itemName: string;
  conditionType: "order" | "product" | "product_category" | "product_brand";
  quantity: number;
  applyForAll: boolean | null;
}
export interface ISapogoPromotion {
  id: number;
  name: string;
  code: string;
  discountPercent: number | null;
  discountAmount: number | null;
  orderTotalRequired: number;
  description: string;
  limit: number | null;
  limitPerCustomer: number | null;
  startDate: Date;
  endDate: Date;
  conditionType: "order" | "product" | "product_category" | "product_brand";
  conditionItems: IConditionItem[];
  isActive: boolean;
  readonly createdAt?: Date;
}
