import { estimateSpeechDuration, pickRandomScript, normalizeCompanionId } from './narrations.js';
import type { WalkPlayPayload } from './walk-snippets.js';

export interface OffsiteChatterScript {
  versionId: string;
  content: string;
  styleNote: string;
}

/** 非景点区域点击头像时随机触发的「调皮话」（MVP：苏东坡 / 毒舌老炮） */
export const WALK_OFFSITE_CHATTER: Record<string, OffsiteChatterScript[]> = {
  'su-dongpo': [
    {
      versionId: 'su-dongpo-offsite-1',
      styleNote: '无定位，俏皮闲聊',
      content:
        '（笑）这会儿没风景给你讲，要不咱聊聊你刚吃的那碗面？味道比得上我炖的东坡肉吗？',
    },
    {
      versionId: 'su-dongpo-offsite-2',
      styleNote: '无定位，俏皮闲聊',
      content:
        '哎，你让我一个古人看导航？此处不在我的「游记」里，要不你往前走两步，看看有没有值得下酒的风物？',
    },
    {
      versionId: 'su-dongpo-offsite-3',
      styleNote: '无定位，俏皮闲聊',
      content:
        '歇会儿就歇会儿，我当年在黄州种地，也经常蹲在田埂上发呆。别急，风景会等你的。',
    },
    {
      versionId: 'su-dongpo-offsite-4',
      styleNote: '无定位，俏皮闲聊',
      content:
        '你这手指头倒是勤快，点我作甚？我此刻既无酒也无月，只剩一肚子不合时宜——你真要听？',
    },
  ],
  'sharp-elder': [
    {
      versionId: 'sharp-elder-offsite-1',
      styleNote: '无定位，京味儿贫嘴',
      content:
        '嘿，您这手指头闲得慌是吧？这儿前不着村后不着店儿，没文物给您叨叨，倒是有个电线杆子，您要听我跟它唠？',
    },
    {
      versionId: 'sharp-elder-offsite-2',
      styleNote: '无定位，京味儿贫嘴',
      content:
        '嘎哈呢？想听我白话两句？可咱还没到地儿呢。要不我给来段儿《空城计》垫垫场子？',
    },
    {
      versionId: 'sharp-elder-offsite-3',
      styleNote: '无定位，京味儿贫嘴',
      content:
        '别戳了别戳了，再戳我把你定位关了信不信？到了故宫颐和园，我自然开腔，现在先让嗓子歇会儿。',
    },
    {
      versionId: 'sharp-elder-offsite-4',
      styleNote: '无定位，京味儿贫嘴',
      content:
        '您瞅瞅这周围，连个古物毛都没有。不过我看着您这双运动鞋倒挺有意思——它是哪朝的文物？',
    },
  ],
};

export function resolveOffsiteChatter(companionId: string): WalkPlayPayload {
  const normalizedId = normalizeCompanionId(companionId);
  const scripts = WALK_OFFSITE_CHATTER[normalizedId] ?? WALK_OFFSITE_CHATTER['su-dongpo'];
  const picked = pickRandomScript(scripts);

  return {
    snippetId: 'offsite-chatter',
    companionId: normalizedId,
    versionId: picked.versionId,
    content: picked.content,
    styleNote: picked.styleNote,
    duration: estimateSpeechDuration(picked.content),
    triggerType: 'offsite',
  };
}
