import { STORY_COVER_IMAGES } from './media.js';

export interface NarratorVersion {
  versionId?: string;
  companionId: string;
  duration: number;
  content: string;
  styleNote: string;
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
    defaultCompanionId: 'lin-huiyin',
    tags: ['爱情', '传说', '西湖'],
    narrators: [
      {
        companionId: 'lin-huiyin',
        duration: 180,
        content: '各位朋友，欢迎来到西湖断桥。站在这座桥上，我仿佛能感受到白娘子与许仙初次相遇时的心跳。你看这烟雨朦胧中的桥身，正如他们的爱情一样，若隐若现，如梦似幻...',
        styleNote: '温婉细腻，侧重情感与美学',
      },
      {
        companionId: 'su-dongpo',
        duration: 200,
        content: '哈哈！各位看官，这断桥可有意思了。断桥不断，肝肠寸断——说的就是白娘子和许仙那档子事。想当年我苏东坡也在西湖边修过苏堤，见过的才子佳人可不少...',
        styleNote: '豪放风趣，穿插诗词典故',
      },
      {
        companionId: 'gentle-lady',
        duration: 190,
        content: '亲爱的朋友，慢慢走，别着急。你看这断桥边的柳树，正随风轻轻摆动，像是在诉说着一个古老的故事。白娘子的传说之所以动人，是因为它告诉我们，真爱可以跨越一切...',
        styleNote: '温柔治愈，娓娓道来',
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
    title: '太和殿的权力密码',
    location: {
      name: '北京故宫',
      lat: 39.9163,
      lng: 116.3972,
    },
    distance: 850,
    duration: 240,
    description: '明清两代皇帝登基大典的场所，见证了无数历史风云变幻。',
    coverImage: STORY_COVER_IMAGES['forbidden-city-hall'],
    defaultCompanionId: 'su-dongpo',
    tags: ['历史', '宫廷', '建筑'],
    narrators: [
      {
        companionId: 'su-dongpo',
        duration: 240,
        content: '各位看官，眼前这太和殿，可是真正的权力中心！想当年康熙爷八岁登基，十四岁亲政，就在这大殿之上，谈笑间擒鳌拜、平三藩。这金砖铺地，每一块都藏着故事...',
        styleNote: '豪放大气，帝王视角',
      },
      {
        companionId: 'lin-huiyin',
        duration: 260,
        content: '从建筑的角度来看，太和殿是中国古代宫殿建筑的巅峰之作。你看这斗拱结构，层层递进，既美观又实用。重檐庑殿顶，是建筑等级中最高的形制...',
        styleNote: '专业细致，建筑美学视角',
      },
      {
        companionId: 'gentle-lady',
        duration: 230,
        content: '站在太和殿前，你是否也感受到了一种庄严和肃穆？六百年来，这里见证了多少王朝更迭、人事兴衰。历史的长河中，我们每个人都是过客...',
        styleNote: '温暖共情，人文关怀',
      },
      {
        companionId: 'sharp-elder',
        duration: 220,
        content: '别光看这殿气派，告诉您几个冷知识——太和殿其实很少用，一年也就用那么几次：登基、大婚、册立皇后、命将出征。平时上朝不在这，在乾清门...',
        styleNote: '犀利揭秘，反套路',
      },
    ],
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
    defaultCompanionId: 'lin-huiyin',
    tags: ['园林', '艺术', '江南'],
    narrators: [
      {
        companionId: 'lin-huiyin',
        duration: 200,
        content: '亲爱的朋友，拙政园是我最爱的园林之一。你看这亭台楼阁，山水相映，处处透着江南文人的雅致情怀。借景、框景、对景——每一种造园手法，都是一首无声的诗...',
        styleNote: '专业细腻，建筑美学',
      },
      {
        companionId: 'su-dongpo',
        duration: 220,
        content: '哈哈哈，这拙政园的名字取得有意思！"拙政"二字，出自潘岳的《闲居赋》，意思是说自己笨拙，只会从政。说白了就是当官当腻了，归隐田园...',
        styleNote: '风趣幽默，文人视角',
      },
      {
        companionId: 'gentle-lady',
        duration: 210,
        content: '慢慢走，别着急。在拙政园里，时间是用来浪费的。你听这雨声打在芭蕉叶上，滴答滴答，像是大自然在为你演奏一曲轻音乐...',
        styleNote: '温柔治愈，沉浸式体验',
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
      {
        companionId: 'lin-huiyin',
        duration: 250,
        content: '从艺术史的角度来看，兵马俑是中国古代雕塑艺术的杰作。你看这每一张面孔，都有不同的表情和特征——将军的威严、士兵的坚毅、弓箭手的专注...',
        styleNote: '艺术审美，细致观察',
      },
      {
        companionId: 'gentle-lady',
        duration: 240,
        content: '看着这些沉默了两千多年的士兵，我的心里有种说不出的感动。他们曾经也是有血有肉的年轻人，为了一个帝国的梦想，永远地站在了这里...',
        styleNote: '温暖共情，人文视角',
      },
    ],
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
    coverImage: STORY_COVER_IMAGES['summer-palace'],
    defaultCompanionId: 'gentle-lady',
    tags: ['皇家', '园林', '近代史'],
    narrators: [
      {
        companionId: 'gentle-lady',
        duration: 190,
        content: '这里是颐和园，曾经是慈禧太后休养的地方。漫步湖边，仿佛还能感受到当年皇家的气派与繁华。佛香阁静静矗立，昆明湖水波荡漾，一切都在诉说着过往的故事...',
        styleNote: '温柔细腻，历史感怀',
      },
      {
        companionId: 'sharp-elder',
        duration: 200,
        content: '别被这美景骗了！颐和园的修建造价可是天价——当年挪用了海军军费来修园子，结果甲午海战输得一塌糊涂。慈禧太后这老太太，享福是真有一套...',
        styleNote: '犀利批判，历史真相',
      },
      {
        companionId: 'su-dongpo',
        duration: 210,
        content: '哈哈哈，这颐和园倒是有点意思。想当年我在杭州修苏堤，也是为了百姓生计。这皇家园林虽然气派，但终究少了几分烟火气。还是江南的园子更对我胃口...',
        styleNote: '风趣对比，文人视角',
      },
      {
        companionId: 'lin-huiyin',
        duration: 200,
        content: '从建筑角度来看，颐和园是中国古典园林的集大成之作。长廊的彩绘、佛香阁的结构、十七孔桥的造型——每一处都值得细细品味...',
        styleNote: '专业建筑视角',
      },
    ],
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
        companionId: 'gentle-lady',
        duration: 230,
        content: '站在岳阳楼上，眺望洞庭湖，心中不由得涌起一种开阔的感觉。范仲淹说得真好——不以物喜，不以己悲。这种境界，值得我们每个人去追寻...',
        styleNote: '温暖治愈，人生感悟',
      },
      {
        companionId: 'sharp-elder',
        duration: 210,
        content: '您可别以为范仲淹真的天天在岳阳楼上待着！告诉您，《岳阳楼记》是他看着一幅画写出来的，他本人根本没去过岳阳楼。这就是文人的厉害之处...',
        styleNote: '犀利揭秘，冷知识',
      },
      {
        companionId: 'lin-huiyin',
        duration: 200,
        content: '岳阳楼的建筑结构非常有特色。三层飞檐，盔顶造型，是中国古建筑中独一无二的形制。从力学角度来看，这种结构既稳固又美观，堪称建筑史上的奇迹...',
        styleNote: '专业建筑视角',
      },
    ],
  },
];
