export interface Story {
  id: string;
  title: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  distance: number;
  duration: number;
  description: string;
  coverImage: string;
  companionId: string;
  tags: string[];
  content: string;
}

export const stories: Story[] = [
  {
    id: 'west-lake-bridge',
    title: '西湖断桥的传说',
    location: {
      name: '杭州西湖',
      lat: 30.2741,
      lng: 120.1551,
    },
    distance: 120,
    duration: 180,
    description: '断桥不断，肝肠寸断。白娘子与许仙的爱情故事，从这里开始流传千年。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=west%20lake%20hangzhou%20broken%20bridge%20chinese%20traditional%20painting%20style%20beautiful%20scenery%20willow%20trees%20misty&image_size=landscape_16_9',
    companionId: 'lin-huiyin',
    tags: ['爱情', '传说', '西湖'],
    content: '各位朋友，欢迎来到西湖断桥。这座桥看似普通，却承载着中国最动人的爱情传说。传说中，白娘子与许仙在此相遇，一段人妖之恋就此展开...',
  },
  {
    id: 'forbidden-city-hall',
    title: '太和殿的权力密码',
    location: {
      name: '北京故宫',
      lat: 39.9163,
      lng: 116.3972,
    },
    distance: 850,
    duration: 240,
    description: '明清两代皇帝登基大典的场所，见证了无数历史风云变幻。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20beijing%20taihe%20palace%20grand%20hall%20chinese%20imperial%20architecture%20golden%20roof%20red%20walls&image_size=landscape_16_9',
    companionId: 'su-dongpo',
    tags: ['历史', '宫廷', '建筑'],
    content: '各位看官，眼前这座宏伟的建筑便是太和殿。当年康熙皇帝在这里接见万国来朝，乾隆皇帝在这里举行盛大典礼...',
  },
  {
    id: 'suzhou-garden',
    title: '拙政园的山水意境',
    location: {
      name: '苏州拙政园',
      lat: 31.2990,
      lng: 120.6202,
    },
    distance: 2300,
    duration: 200,
    description: '江南园林艺术的巅峰之作，一步一景，处处皆画。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=suzhou%20humble%20administrators%20garden%20chinese%20traditional%20garden%20beautiful%20landscape%20pavilion%20lake%20rocks&image_size=landscape_16_9',
    companionId: 'lin-huiyin',
    tags: ['园林', '艺术', '江南'],
    content: '亲爱的朋友，拙政园是我最爱的园林之一。你看这亭台楼阁，山水相映，处处透着江南文人的雅致情怀...',
  },
  {
    id: 'terracotta-army',
    title: '兵马俑的千年秘密',
    location: {
      name: '西安兵马俑',
      lat: 34.3853,
      lng: 109.2731,
    },
    distance: 5400,
    duration: 260,
    description: '千古一帝秦始皇的地下军团，沉睡千年后重见天日。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=terracotta%20army%20xian%20china%20ancient%20warriors%20museum%20dramatic%20lighting%20history&image_size=landscape_16_9',
    companionId: 'sharp-elder',
    tags: ['历史', '考古', '秦朝'],
    content: '嘿，您可别小看这些泥人！这可是秦始皇当年横扫六国的精锐部队，一个个都是真人大小，表情各异...',
  },
  {
    id: 'summer-palace',
    title: '颐和园的皇家往事',
    location: {
      name: '北京颐和园',
      lat: 39.9999,
      lng: 116.2755,
    },
    distance: 1500,
    duration: 190,
    description: '慈禧太后的后花园，见证了晚清的兴衰荣辱。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=summer%20palace%20beijing%20kunming%20lake%20pagoda%20chinese%20imperial%20garden%20beautiful%20scenery&image_size=landscape_16_9',
    companionId: 'gentle-lady',
    tags: ['皇家', '园林', '近代史'],
    content: '这里是颐和园，曾经是慈禧太后休养的地方。漫步湖边，仿佛还能感受到当年皇家的气派与繁华...',
  },
  {
    id: 'yueyang-tower',
    title: '岳阳楼的千古绝唱',
    location: {
      name: '岳阳岳阳楼',
      lat: 29.3436,
      lng: 113.0853,
    },
    distance: 8900,
    duration: 220,
    description: '范仲淹《岳阳楼记》的诞生地，"先天下之忧而忧"的情怀在此传颂。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yueyang%20tower%20chinese%20ancient%20tower%20overlooking%20dongting%20lake%20traditional%20architecture%20sunset&image_size=landscape_16_9',
    companionId: 'su-dongpo',
    tags: ['诗词', '建筑', '文化'],
    content: '噫！微斯人，吾谁与归？范仲淹的名句让岳阳楼名扬天下。当年我也曾在此留下墨宝...',
  },
];
