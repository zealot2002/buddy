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
  'sharp-elder': [sharpElderForbidden],
};

export const SUMMER_PALACE_NARRATIONS: LocationNarrations = {
  'su-dongpo': [suDongpoSummer],
  'sharp-elder': [sharpElderSummer],
};

/** 兼容旧旅伴 ID → MVP 旅伴 */
export const COMPANION_ID_ALIASES: Record<string, string> = {
  'sarcastic-guy': 'sharp-elder',
  'lin-huiyin': 'su-dongpo',
  'gentle-lady': 'su-dongpo',
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
