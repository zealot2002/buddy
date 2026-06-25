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
    companionId: 'lin-huiyin',
    styleNote: '景点概览，建筑视角',
    content:
      '故宫是中国古建礼制空间最完整的样本。中轴对称、层层递进、色彩等级，都在告诉你“秩序”二字如何被写进砖木之间。先建立这张地图，再走进每一个院子，才不会只看热闹。',
  },
  {
    companionId: 'gentle-lady',
    styleNote: '景点概览，治愈视角',
    content:
      '如果把故宫想成一本厚书，今天我们先读目录。红墙是封面，中轴是书脊，那些我们熟悉的名字，都只是其中几个章节。慢慢听，不必一次听完，让好奇心留到真正踏进去那一刻。',
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
    companionId: 'lin-huiyin',
    styleNote: '景点概览，园林视角',
    content:
      '这是中国古典园林向皇家尺度放大后的杰作。它把江南园林的曲折、北方山水的开阔，和宫廷礼制揉在一起。先听框架，再去看每一处的“借”和“障”，会轻松很多。',
  },
  {
    companionId: 'gentle-lady',
    styleNote: '景点概览，舒缓视角',
    content:
      '把它想象成一位老人在讲自己的一生：有风光，也有遗憾；有精致，也有匆忙。我们今晚只听“轮廓”，不急着评判。等风真的从昆明湖面上吹过来，你会更懂这些句子。',
  },
  {
    companionId: 'sharp-elder',
    styleNote: '景点概览，现实视角',
    content:
      '颐和园名气大，故事也多，真真假假。您先记住一句：这是用银子堆出来的山水。知道了这个前提，再去看石舫、长廊、佛香阁，心里就有数了——美是真的，来路也是真的。',
  },
]);
