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

/** MVP 仅保留两位旅伴 */
export const MVP_COMPANION_IDS = ['su-dongpo', 'sharp-elder'] as const;
export type MvpCompanionId = (typeof MVP_COMPANION_IDS)[number];

export function isMvpCompanionId(id: string): id is MvpCompanionId {
  return (MVP_COMPANION_IDS as readonly string[]).includes(id);
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
