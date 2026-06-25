/** 稳定的封面与头像资源（原 trae-api 图片服务已不可用） */

export const STORY_COVER_IMAGES: Record<string, string> = {
  'west-lake-bridge':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Hangzhou_Su_Causeway.JPG/960px-Hangzhou_Su_Causeway.JPG',
  'forbidden-city-hall':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/The_Forbidden_City_-_View_from_Jingshan_Hill.jpg/960px-The_Forbidden_City_-_View_from_Jingshan_Hill.jpg',
  'suzhou-garden':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Humble_Administrator%27s_Garden.jpg/960px-Humble_Administrator%27s_Garden.jpg',
  'terracotta-army':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Terracotta_Army_at_the_Museum_of_Qin_Terra-cotta_Warriors_and_Horses.jpg/960px-Terracotta_Army_at_the_Museum_of_Qin_Terra-cotta_Warriors_and_Horses.jpg',
  'summer-palace':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Summer_palace_beijing.jpg/960px-Summer_palace_beijing.jpg',
  'yueyang-tower':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Yueyang_Tower.jpg/960px-Yueyang_Tower.jpg',
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
