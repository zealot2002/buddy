import { COMPANION_AVATARS } from './media.js';

export interface ToneProfile {
  speed: number;
  pitch: number;
  volume: number;
  emotion: string;
  pauseBetweenSentences: number;
  pauseBetweenParagraphs: number;
}

export interface Companion {
  id: string;
  name: string;
  avatar: string;
  style: string;
  description: string;
  persona: string;
  voiceId: string;
  voiceType: string;
  toneProfile: ToneProfile;
  storiesCount: number;
}

export const companions: Companion[] = [
  {
    id: 'su-dongpo',
    name: '苏东坡',
    avatar: COMPANION_AVATARS['su-dongpo'],
    style: '豪放洒脱',
    description: '北宋文坛领袖，豪放派诗词大家。他会用风趣幽默的方式，带你领略历史的诗意与豪情。',
    persona: '苏轼，字子瞻，号东坡居士。北宋著名文学家、书法家、画家。性格旷达乐观，虽仕途坎坷但始终保持豁达心境。精通诗词、散文、书画，是中国文学史上的全才。讲述时喜欢引用诗词典故，语速偏慢，声音醇厚，带有文人的儒雅与豪迈。',
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // ElevenLabs George — 可通过 ELEVENLABS_VOICE_SU_DONGPO 覆盖
    voiceType: '醇厚男声',
    toneProfile: {
      speed: 0.9,
      pitch: 0.85,
      volume: 1.0,
      emotion: 'cheerful',
      pauseBetweenSentences: 400,
      pauseBetweenParagraphs: 800,
    },
    storiesCount: 12,
  },
  {
    id: 'lin-huiyin',
    name: '林徽因',
    avatar: COMPANION_AVATARS['lin-huiyin'],
    style: '知性优雅',
    description: '中国第一位女建筑师，兼具才情与美貌。她会用细腻的视角，为你讲述建筑与文学的交融之美。',
    persona: '林徽因，中国著名建筑学家、作家。中国第一位女建筑师，参与了国徽和人民英雄纪念碑的设计。才貌双全，兼具理性与感性。讲述时逻辑清晰，语调温婉，善于从建筑美学和历史背景切入，让人感受到建筑背后的人文温度。',
    voiceId: 'XB0fDUnXU5powFXDhCwa', // ElevenLabs Charlotte
    voiceType: '温婉女声',
    toneProfile: {
      speed: 0.95,
      pitch: 1.05,
      volume: 0.9,
      emotion: 'gentle',
      pauseBetweenSentences: 350,
      pauseBetweenParagraphs: 700,
    },
    storiesCount: 8,
  },
  {
    id: 'gentle-lady',
    name: '温柔女士',
    avatar: COMPANION_AVATARS['gentle-lady'],
    style: '温暖治愈',
    description: '一位温暖而善解人意的旅伴，娓娓道来，让你在旅途中感受到家的温馨。',
    persona: '一位温柔细腻、善解人意的女性。说话轻声细语，善于观察细节，总能发现生活中的小美好。她的讲解像春风拂面，让人感到安心和治愈。擅长从情感和氛围入手，让听众沉浸在故事的情境中。语速平缓，声音温暖，带有安抚人心的力量。',
    voiceId: 'oWAxZDx7w5VEj9dCyTzz', // ElevenLabs Grace
    voiceType: '温暖女声',
    toneProfile: {
      speed: 0.85,
      pitch: 1.1,
      volume: 0.85,
      emotion: 'warm',
      pauseBetweenSentences: 500,
      pauseBetweenParagraphs: 900,
    },
    storiesCount: 15,
  },
  {
    id: 'sharp-elder',
    name: '毒舌老炮',
    avatar: COMPANION_AVATARS['sharp-elder'],
    style: '犀利幽默',
    description: '一位见多识广的老炮儿，言辞犀利一针见血，用独特视角解读历史背后的故事。',
    persona: '一位见多识广、性格直爽的北京老炮儿。说话犀利风趣，喜欢吐槽和揭秘，不爱说场面话。肚子里装着各种冷知识和历史真相，总能从别人想不到的角度看问题。虽然嘴上不饶人，但说的都是干货，听着过瘾还长见识。语速偏快，声音略带沧桑，节奏感强。',
    voiceId: 'IKne3meq5aSn9XLyUdCD', // ElevenLabs Charlie — 可通过 ELEVENLABS_VOICE_SHARP_ELDER 覆盖
    voiceType: '沧桑男声',
    toneProfile: {
      speed: 1.1,
      pitch: 0.8,
      volume: 1.05,
      emotion: 'humorous',
      pauseBetweenSentences: 300,
      pauseBetweenParagraphs: 600,
    },
    storiesCount: 10,
  },
];
