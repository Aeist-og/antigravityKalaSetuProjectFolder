export interface Exhibition {
  id: string;
  artisanId: string;
  exhibitionName?: string;
  name?: string;
  collectionTitle?: string;
  description?: string;
  promoMessage?: string;
  shareSlug?: string;
  stallNumber?: string;
  location?: string;
  qrCodeUrl?: string;
  qrCodePayload?: string;
  bannerConfig?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExhibitionInput {
  artisanId: string;
  exhibitionName?: string;
  name?: string;
  collectionTitle?: string;
  description?: string;
  promoMessage?: string;
  stallNumber?: string;
  location?: string;
  shareSlug?: string;
  qrCodePayload?: string;
  bannerConfig?: Record<string, any>;
}
