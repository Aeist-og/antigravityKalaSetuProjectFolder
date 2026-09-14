export interface KalaComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  authorName?: string;
  commentText: string;
  content?: string;
  createdAt: string;
}

export type KalaPostMediaType = 'image' | 'video';

export type KalaPostStoryType = 'craft_story' | 'product_showcase' | 'behind_the_scenes' | 'workshop_live';

export interface KalaPost {
  id: string;
  artisanId: string;
  artisanName: string;
  artisanLocation?: string;
  artisanAvatarEmoji?: string;
  craftType: string;
  mediaType: KalaPostMediaType;
  mediaUri: string;
  videoThumbnailUri?: string;
  storyType?: KalaPostStoryType;
  caption: string;
  linkedProductId?: string;
  linkedProductTitle?: string;
  linkedProductPrice?: number;
  likesCount: number;
  isLikedByMe?: boolean;
  commentsCount?: number;
  createdAt: string;
}

export interface CreateKalaPostInput {
  artisanId: string;
  artisanName: string;
  artisanLocation?: string;
  artisanAvatarEmoji?: string;
  craftType: string;
  mediaType: KalaPostMediaType;
  mediaUri: string;
  videoThumbnailUri?: string;
  storyType?: KalaPostStoryType;
  caption: string;
  linkedProductId?: string;
  linkedProductTitle?: string;
  linkedProductPrice?: number;
}
