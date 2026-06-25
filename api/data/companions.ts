export interface Companion {
  id: string;
  name: string;
  avatar: string;
  style: string;
  description: string;
  voiceType: string;
  storiesCount: number;
}

export const companions: Companion[] = [
  {
    id: 'su-dongpo',
    name: '苏东坡',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20poet%20su%20dongpo%20portrait%20ink%20painting%20style%20elegant%20middle%20aged%20man%20with%20beard&image_size=square',
    style: '豪放洒脱',
    description: '北宋文坛领袖，豪放派诗词大家。他会用风趣幽默的方式，带你领略历史的诗意与豪情。',
    voiceType: '醇厚男声',
    storiesCount: 12,
  },
  {
    id: 'lin-huiyin',
    name: '林徽因',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20chinese%20woman%20lin%20huiyin%20portrait%20vintage%20style%20intellectual%20graceful%201930s%20fashion&image_size=square',
    style: '知性优雅',
    description: '中国第一位女建筑师，兼具才情与美貌。她会用细腻的视角，为你讲述建筑与文学的交融之美。',
    voiceType: '温婉女声',
    storiesCount: 8,
  },
  {
    id: 'gentle-lady',
    name: '温柔女士',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=kind%20gentle%20chinese%20woman%20portrait%20warm%20smile%20soft%20lighting%20elegant%20modern%20style&image_size=square',
    style: '温暖治愈',
    description: '一位温暖而善解人意的旅伴，娓娓道来，让你在旅途中感受到家的温馨。',
    voiceType: '温暖女声',
    storiesCount: 15,
  },
  {
    id: 'sharp-elder',
    name: '毒舌老炮',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20elderly%20man%20with%20character%20portrait%20sharp%20eyes%20witty%20expression%20street%20wise%20style&image_size=square',
    style: '犀利幽默',
    description: '一位见多识广的老炮儿，言辞犀利一针见血，用独特视角解读历史背后的故事。',
    voiceType: '沧桑男声',
    storiesCount: 10,
  },
];
