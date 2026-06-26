import { STORY_COVER_IMAGES } from './media.js';
import {
  forbiddenCityCityNarrators,
  summerPalaceCityNarrators,
} from './city-narrators.js';

export interface NarratorVariant {
  versionId: string;
  content: string;
  styleNote?: string;
  duration?: number;
}

export interface NarratorVersion {
  versionId?: string;
  companionId: string;
  duration: number;
  content: string;
  styleNote: string;
  variants?: NarratorVariant[];
  audioUrl?: string;
  version?: string;
  status?: 'draft' | 'review' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

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
  defaultCompanionId: string;
  tags: string[];
  narrators: NarratorVersion[];
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
    coverImage: STORY_COVER_IMAGES['west-lake-bridge'],
    defaultCompanionId: 'su-dongpo',
    tags: ['爱情', '传说', '西湖'],
    narrators: [
      {
        companionId: 'su-dongpo',
        duration: 200,
        content: '哈哈！各位看官，这断桥可有意思了。断桥不断，肝肠寸断——说的就是白娘子和许仙那档子事。想当年我苏东坡也在西湖边修过苏堤，见过的才子佳人可不少...',
        styleNote: '豪放风趣，穿插诗词典故',
      },
      {
        companionId: 'sharp-elder',
        duration: 170,
        content: '嘿，我说您可别光看景儿！这断桥有讲究——为什么叫断桥不叫断情桥？因为这桥啊，冬天雪化的时候，从宝石山上看，桥的一端像是断了一样。白娘子那是后人附会的神话...',
        styleNote: '犀利直白，讲干货冷知识',
      },
    ],
  },
  {
    id: 'forbidden-city-hall',
    title: '故宫：紫禁城的千年回响',
    location: {
      name: '北京故宫',
      lat: 39.9163,
      lng: 116.3972,
    },
    distance: 850,
    duration: 180,
    description: '走进紫禁城，在朱墙黄瓦间聆听六百年的人间冷暖与皇家往事。',
    coverImage: STORY_COVER_IMAGES['forbidden-city-hall'],
    defaultCompanionId: 'su-dongpo',
    tags: ['历史', '宫廷', '建筑'],
    narrators: forbiddenCityCityNarrators,
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
    coverImage: STORY_COVER_IMAGES['suzhou-garden'],
    defaultCompanionId: 'su-dongpo',
    tags: ['园林', '艺术', '江南'],
    narrators: [
      {
        companionId: 'su-dongpo',
        duration: 220,
        content: '哈哈哈，这拙政园的名字取得有意思！"拙政"二字，出自潘岳的《闲居赋》，意思是说自己笨拙，只会从政。说白了就是当官当腻了，归隐田园...',
        styleNote: '风趣幽默，文人视角',
      },
      {
        companionId: 'sharp-elder',
        duration: 190,
        content: '别以为这园子就是种花种草的地方！拙政园的格局大有讲究——远香堂、见山楼、小飞虹，每一处名字都有出处。文人造园，讲究的是"虽由人作，宛自天开"...',
        styleNote: '犀利直白，讲门道',
      },
    ],
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
    coverImage: STORY_COVER_IMAGES['terracotta-army'],
    defaultCompanionId: 'sharp-elder',
    tags: ['历史', '考古', '秦朝'],
    narrators: [
      {
        companionId: 'sharp-elder',
        duration: 260,
        content: '嘿，您可别小看这些泥人！告诉您几个真东西——兵马俑刚挖出来的时候是彩色的，一见空气就掉色了。还有，每个兵的脸都不一样，据说都是照着真人捏的...',
        styleNote: '犀利揭秘，考古视角',
      },
      {
        companionId: 'su-dongpo',
        duration: 280,
        content: '秦王扫六合，虎视何雄哉！想当年秦始皇嬴政，十三岁登基，三十九岁统一六国，这份功业，前无古人后无来者。这兵马俑，就是他千古霸业的见证...',
        styleNote: '豪放大气，帝王功业视角',
      },
    ],
  },
  {
    id: 'summer-palace',
    title: '颐和园：皇家园林的诗意',
    location: {
      name: '北京颐和园',
      lat: 39.9999,
      lng: 116.2755,
    },
    distance: 1500,
    duration: 180,
    description: '昆明湖畔，长廊画舫，在湖光山色间感受皇家园林的借景之美与时代往事。',
    coverImage: STORY_COVER_IMAGES['summer-palace'],
    defaultCompanionId: 'su-dongpo',
    tags: ['皇家', '园林', '近代史'],
    narrators: summerPalaceCityNarrators,
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
    coverImage: STORY_COVER_IMAGES['yueyang-tower'],
    defaultCompanionId: 'su-dongpo',
    tags: ['诗词', '建筑', '文化'],
    narrators: [
      {
        companionId: 'su-dongpo',
        duration: 220,
        content: '噫！微斯人，吾谁与归？范仲淹的《岳阳楼记》，真是字字珠玑。先天下之忧而忧，后天下之乐而乐——这份胸襟，这份抱负，让我苏东坡也钦佩不已...',
        styleNote: '豪放激昂，文人情怀',
      },
      {
        companionId: 'sharp-elder',
        duration: 210,
        content: '您可别以为范仲淹真的天天在岳阳楼上待着！告诉您，《岳阳楼记》是他看着一幅画写出来的，他本人根本没去过岳阳楼。这就是文人的厉害之处...',
        styleNote: '犀利揭秘，冷知识',
      },
    ],
  },
];
