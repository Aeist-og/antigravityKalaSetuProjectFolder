export interface FavouriteProductSummary {
  id: string;
  titleEn: string;
  titleHi: string;
  craftType?: string;
  primaryImageUrl?: string;
  finalListingPrice?: number;
}

export interface FavouriteItem {
  id: string;
  userId: string;
  productId?: string;
  artisanId?: string;
  product?: FavouriteProductSummary;
  artisanName?: string;
  createdAt: string;
}
