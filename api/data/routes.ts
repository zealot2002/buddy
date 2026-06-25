export interface Route {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  duration: number;
  distance: number;
  storyIds: string[];
}

export const routes: Route[] = [
  {
    id: 'hangzhou-day-trip',
    name: '杭州西湖一日游',
    description: '漫步西湖十景，聆听千年传说，感受江南水乡的诗情画意。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hangzhou%20west%20lake%20panorama%20beautiful%20chinese%20scenery%20willow%20trees%20pagodas%20boats&image_size=landscape_16_9',
    duration: 480,
    distance: 8.5,
    storyIds: ['west-lake-bridge'],
  },
  {
    id: 'beijing-imperial-tour',
    name: '北京皇城深度游',
    description: '从故宫到颐和园，穿越六百年皇家历史，感受帝王之都的威严与辉煌。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20city%20skyline%20with%20forbidden%20city%20and%20summer%20palace%20chinese%20imperial%20architecture&image_size=landscape_16_9',
    duration: 600,
    distance: 15.2,
    storyIds: ['forbidden-city-hall', 'summer-palace'],
  },
  {
    id: 'suzhou-garden-tour',
    name: '苏州园林艺术之旅',
    description: '探访拙政园、留园、狮子林，品味江南园林的精致与典雅。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=suzhou%20traditional%20gardens%20collection%20chinese%20classical%20architecture%20beautiful%20landscape&image_size=landscape_16_9',
    duration: 360,
    distance: 6.8,
    storyIds: ['suzhou-garden'],
  },
  {
    id: 'xian-history-tour',
    name: '西安古都探秘之旅',
    description: '兵马俑、大雁塔、古城墙，穿越五千年中华文明。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=xian%20city%20ancient%20walls%20and%20big%20wild%20goose%20pagoda%20chinese%20history%20city&image_size=landscape_16_9',
    duration: 420,
    distance: 12.0,
    storyIds: ['terracotta-army'],
  },
];
