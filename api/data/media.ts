/** 稳定的封面与头像资源（均存 public/images/，禁止外链 SVG） */

export const STORY_COVER_IMAGES: Record<string, string> = {
  'west-lake-bridge': '/images/west-lake-bridge.jpg',
  'forbidden-city-hall': '/images/forbidden-city-hall.jpg',
  'suzhou-garden': '/images/suzhou-garden.jpg',
  'terracotta-army': '/images/terracotta-army.jpg',
  'summer-palace': '/images/summer-palace.jpg',
  'yueyang-tower': '/images/yueyang-tower.jpg',
};

/** 旅伴头像：public/images/avatars/ 下本地 PNG/JPEG，按 companion id 映射（MVP 两位） */
export const COMPANION_AVATARS: Record<string, string> = {
  'su-dongpo': '/images/avatars/su-dongpo.jpeg',
  'sharp-elder': '/images/avatars/sharp-elder.png',
};

export const DEFAULT_STORY_COVER = '/images/west-lake-bridge.jpg';

export const DEFAULT_AVATAR = COMPANION_AVATARS['su-dongpo'];

export const STORY_ID_ALIASES: Record<string, string> = {
  'forbidden-city': 'forbidden-city-hall',
  'terra-cotta': 'terracotta-army',
  'su-garden': 'suzhou-garden',
};

export function getStoryCoverImage(storyId: string, fallback?: string): string {
  const normalizedId = STORY_ID_ALIASES[storyId] || storyId;
  if (STORY_COVER_IMAGES[normalizedId]) {
    return STORY_COVER_IMAGES[normalizedId];
  }
  if (fallback && fallback.startsWith('/images/')) {
    return fallback;
  }
  return DEFAULT_STORY_COVER;
}

export function getCompanionAvatar(companionId: string, _fallback?: string): string {
  return COMPANION_AVATARS[companionId] || DEFAULT_AVATAR;
}

/** 边走边听入场视频（public/videos/） */
export const WALK_INTRO_VIDEOS: Partial<Record<string, string>> = {
  'su-dongpo': '/videos/su-dongpo.mp4',
  'sharp-elder': '/videos/sharp-elder.mp4',
};

export function getWalkIntroVideo(companionId: string): string | undefined {
  return WALK_INTRO_VIDEOS[companionId];
}
