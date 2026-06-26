import { estimateSpeechDuration } from './narrations.js';
import type { NarratorVersion } from './stories.js';

/** 城市故事：景点级概述，适合躺听，与围栏感言独立 */

function buildCityNarrators(
  entries: Array<{ companionId: string; content: string; styleNote: string }>,
): NarratorVersion[] {
  return entries.map((entry) => ({
    companionId: entry.companionId,
    content: entry.content,
    styleNote: entry.styleNote,
    duration: estimateSpeechDuration(entry.content),
  }));
}

export const forbiddenCityCityNarrators = buildCityNarrators([
  {
    companionId: 'su-dongpo',
    styleNote: '景点概览，豪放视角',
    content:
      '今晚咱们不赶路，就聊聊紫禁城这大盘子。六百年里，它既是天子的办公室，也是无数小人物的舞台。你记住三个词：中轴、等级、烟火气——下次实地走，会有完全不同的感觉。',
  },
  {
    companionId: 'sharp-elder',
    styleNote: '景点概览，京味儿点评',
    content:
      '故宫？说白了就是超大号四合院升级版。您先弄清哪儿是“客厅”，哪儿是“卧室”，哪儿是“后院”，再去看那些龙啊凤啊，就不容易被导游带跑偏。今儿咱先听个总纲，明儿现场再细抠。',
  },
]);

export const summerPalaceCityNarrators = buildCityNarrators([
  {
    companionId: 'su-dongpo',
    styleNote: '景点概览，山水视角',
    content:
      '颐和园最妙在“借景”——湖是镜子，山是背景，园子是诗。你即便人在宾馆，也可以先在脑子里画一条线：昆明湖、万寿山、长廊、桥。有了这条线，到现场就不乱。',
  },
  {
    companionId: 'sharp-elder',
    styleNote: '景点概览，现实视角',
    content:
      '颐和园名气大，故事也多，真真假假。您先记住一句：这是用银子堆出来的山水。知道了这个前提，再去看石舫、长廊、佛香阁，心里就有数了——美是真的，来路也是真的。',
  },
]);
