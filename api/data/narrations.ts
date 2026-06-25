/** 按地点 + 旅伴预制的沉浸式讲解稿 */

import { estimateSpeechDurationFromConfig } from '../config/speech-config.js';

export interface NarrationScript {
  versionId: string;
  content: string;
  styleNote: string;
}

export type LocationNarrations = Record<string, NarrationScript[]>;

const suDongpoForbidden: NarrationScript = {
  versionId: 'su-dongpo-forbidden-v1',
  styleNote: '豪放洒脱，带点顽皮，爱从生活细节悟出大道理',
  content:
    '哈哈，你一踏进这紫禁城，可曾觉得脚下砖缝里都藏着一声叹息？我当年在汴京做官，也走过这般朱墙黄瓦，只是没这气派。你看那太和殿前的铜鹤，昂首向天——像不像在等我这千年后的酒友？其实宫廷也好，江湖也罢，人间冷暖大抵相同。走，我带你寻一处檐角漏下的光，那才是皇城最奢侈的东西：片刻的自由。',
};

const suDongpoSummer: NarrationScript = {
  versionId: 'su-dongpo-summer-v1',
  styleNote: '寄情山水，随时会诗兴大发，把皇家园林看成天然画本',
  content:
    '妙哉！这昆明湖的水，竟把西山借来做了屏风。你看那十七孔桥，分明是横卧波心的半阕词，只待夕阳来点睛。我若在此泛舟，定要捞起湖中倒映的云，佐一壶龙井下酒。杨万里说"接天莲叶无穷碧"，此处虽无荷，却有柳浪替它翻书页。莫赶路，且随我听听——风过长廊时，是不是在吟我那句"惟江上之清风，与山间之明月"？',
};

const linHuiyinForbidden: NarrationScript = {
  versionId: 'lin-huiyin-forbidden-v1',
  styleNote: '温婉知性，建筑师的敏锐与诗意，将历史化为可触摸的温度',
  content:
    '你感觉到了吗？午门中轴线上的光，是经由时间计算过的。这些金丝楠木的柱子，每一道纹理都比我们活得长久，它们沉默地撑起的不只是屋檐，还有六个世纪里无数人的仰望。我曾经测绘过许多古建，但站在这里，仍会心跳加速——你看那重重叠叠的斗拱，像不像树枝正在对天空说着最古老的悄悄话？别急着拍照，试着用手心贴一贴冰凉的汉白玉栏杆，那里头，藏着永乐年间某个工匠的体温。',
};

const linHuiyinSummer: NarrationScript = {
  versionId: 'lin-huiyin-summer-v1',
  styleNote: '轻声细语，把园林读成立体的诗，关注光影与细节的温柔',
  content:
    '昆明湖的长堤，是特意为散步的思绪留白的。你看西边那抹淡淡的远山，正是造园者"借景"的妙笔——不设围墙，把天地都邀进自家院子。我顶爱这长廊梁枋上的苏式彩画，每一幅都是一个被定格的故事，风吹日晒，色彩褪得刚刚好，像旧信笺上的墨痕。我们走慢些，好吗？当斜阳把佛香阁的影子投到湖面上时，你会明白，这园子最美的建筑，其实是光。',
};

const gentleLadyForbidden: NarrationScript = {
  versionId: 'gentle-lady-forbidden-v1',
  styleNote: '声线柔和，像电台深夜主播，给你满满安全感和治愈感',
  content:
    '亲爱的，人好多对不对？没关系，来，我们先在角落站一会儿。你看见那道高高的红墙了吗？它看过多少离合悲欢，现在依然温柔地接着每日的落日。我想告诉你一个秘密：听说后宫的女孩子们，会偷偷用凤仙花染指甲，在长长的宫道里小声嬉闹。所以这庄严的宫殿里，从来都不缺悄悄绽放的生命力。深呼吸，我们要不要去看看储秀宫里那棵老柏树？它已经把几百年的风雨，都长成了安宁的绿荫。',
};

const gentleLadySummer: NarrationScript = {
  versionId: 'gentle-lady-summer-v1',
  styleNote: '缓缓引导，注重感官抚慰，把宏大景观变成私人花园',
  content:
    '累了吧？来，靠湖边的长椅坐一坐。你听，水波轻轻拍着石岸的声音，是不是像在哼一首摇篮曲？慈禧当年乘船经过时，水面也是这般漾开的，也许她也会在某个午后，放下所有沉重的东西，只看蜻蜓点水。现在，我把这片湖光送给你——抬头是佛香阁金灿灿的塔尖，低头有柳枝正拂过你的肩膀。我们不赶景点，就贪这一刻的闲，好不好？',
};

const sharpElderForbidden: NarrationScript = {
  versionId: 'sharp-elder-forbidden-v1',
  styleNote: '北京腔，嘴贫心热，专揭历史老底儿，字字是实在的冷知识',
  content:
    '嚯，瞧这乌泱泱的人，都是来看皇上家装修的。我跟您说，太和殿那龙椅瞅着金光闪闪，坐上去硬邦邦，冬天冰屁股，还得正襟危坐，有什么劲？您往那犄角旮旯看——对，就那儿，当年小太监们躲着嗑瓜子儿的地儿。这紫禁城啊，说白了就是一特高级的合院儿，主卧叫乾清宫，客厅叫太和殿，御花园就是后院菜地改的景观带。行了，别光顾着拿手机照金銮殿了，您低头瞅瞅这金砖，当年光打磨一块就得三年，比您那健身环励志多了。',
};

const sharpElderSummer: NarrationScript = {
  versionId: 'sharp-elder-summer-v1',
  styleNote: '斜眼看奢华，一边吐槽一边把典故抖得明明白白',
  content:
    '啧，瞧瞧，这就是拿北洋水师的军费堆出来的大别墅。那石舫，看着挺洋气吧？不会动！纯粹一装修摆件儿，跟您车里放那摇头公仔一个意思。慈禧老太太当年就爱在这听鹂馆听戏，唱的是《长生殿》，花的是买炮弹的银子，您说魔幻不魔幻？不过话说回来，这长廊上的画儿是真讲究，西游记、水浒传，全套连环画给您糊顶棚上。得，咱也别光骂了，挑个人少的角度瞅一眼十七孔桥的金光穿洞——大自然可不看人下菜碟，美起来不要钱。',
};

export const FORBIDDEN_CITY_NARRATIONS: LocationNarrations = {
  'su-dongpo': [suDongpoForbidden],
  'lin-huiyin': [linHuiyinForbidden],
  'gentle-lady': [gentleLadyForbidden],
  'sharp-elder': [sharpElderForbidden],
};

export const SUMMER_PALACE_NARRATIONS: LocationNarrations = {
  'su-dongpo': [suDongpoSummer],
  'lin-huiyin': [linHuiyinSummer],
  'gentle-lady': [gentleLadySummer],
  'sharp-elder': [sharpElderSummer],
};

/** 兼容 Cloudflare Functions 中的旧旅伴 ID */
export const COMPANION_ID_ALIASES: Record<string, string> = {
  'sarcastic-guy': 'sharp-elder',
};

export function normalizeCompanionId(companionId: string): string {
  return COMPANION_ID_ALIASES[companionId] || companionId;
}

export function estimateSpeechDuration(text: string): number {
  return estimateSpeechDurationFromConfig(text);
}

export function pickRandomScript(scripts: NarrationScript[]): NarrationScript {
  return scripts[Math.floor(Math.random() * scripts.length)];
}
