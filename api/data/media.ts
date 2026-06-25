/** 稳定的封面与头像资源 */

export const STORY_COVER_IMAGES: Record<string, string> = {
  'west-lake-bridge': '/images/west-lake-bridge.jpg',
  'forbidden-city-hall': '/images/forbidden-city-hall.jpg',
  'suzhou-garden': '/images/suzhou-garden.jpg',
  'terracotta-army': '/images/terracotta-army.jpg',
  'summer-palace': '/images/summer-palace.jpg',
  'yueyang-tower': '/images/yueyang-tower.jpg',
};

export const COMPANION_AVATARS: Record<string, string> = {
  'su-dongpo':
    'https://api.dicebear.com/7.x/notionists/svg?seed=su-dongpo&backgroundColor=d4af37',
  'lin-huiyin':
    'https://api.dicebear.com/7.x/notionists/svg?seed=lin-huiyin&backgroundColor=f5a623',
  'gentle-lady':
    'https://api.dicebear.com/7.x/notionists/svg?seed=gentle-lady&backgroundColor=152238',
  'sharp-elder':
    'https://api.dicebear.com/7.x/notionists/svg?seed=sharp-elder&backgroundColor=111d2f',
};

export const DEFAULT_STORY_COVER =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Changjiang.jpg/960px-Changjiang.jpg';

export const DEFAULT_AVATAR =
  'https://api.dicebear.com/7.x/notionists/svg?seed=companion&backgroundColor=152238';

export function getStoryCoverImage(storyId: string, fallback?: string): string {
  return STORY_COVER_IMAGES[storyId] || fallback || DEFAULT_STORY_COVER;
}

export function getCompanionAvatar(companionId: string, fallback?: string): string {
  return COMPANION_AVATARS[companionId] || fallback || DEFAULT_AVATAR;
}
