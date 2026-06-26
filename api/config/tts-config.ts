/** TTS 音色与韵律配置（边走边听 / 旅伴播报） */

export interface TtsVoiceProfile {
  /** Edge TTS voice name */
  voice: string;
  /** SSML prosody rate，负值略慢更有顿挫 */
  rate: string;
  /** SSML prosody pitch，负值偏低更粗犷 */
  pitch: string;
  /** 句末停顿时长（ms） */
  sentenceBreakMs: number;
  /** 逗号停顿时长（ms） */
  commaBreakMs: number;
}

export interface TtsConfig {
  /** Edge Read Aloud 客户端 token（公开客户端） */
  edgeClientToken: string;
  defaultProfileId: string;
  profiles: Record<string, TtsVoiceProfile>;
}

export const TTS_CONFIG: TtsConfig = {
  edgeClientToken: '6A5AA1D4EAFF4E9FB37E23D68491D6F4',
  defaultProfileId: 'rough-male',
  profiles: {
    /** 毒舌老炮：低沉粗犷、节奏分明 */
    'sharp-elder': {
      voice: 'zh-CN-YunjianNeural',
      rate: '-6%',
      pitch: '-18Hz',
      sentenceBreakMs: 520,
      commaBreakMs: 240,
    },
    /** 苏东坡：男声醇厚，略慢，留气口 */
    'su-dongpo': {
      voice: 'zh-CN-YunxiNeural',
      rate: '-12%',
      pitch: '-8Hz',
      sentenceBreakMs: 480,
      commaBreakMs: 220,
    },
    /** 默认边走边听男声（未匹配旅伴时） */
    'rough-male': {
      voice: 'zh-CN-YunjianNeural',
      rate: '-6%',
      pitch: '-18Hz',
      sentenceBreakMs: 520,
      commaBreakMs: 240,
    },
  },
};

export function resolveTtsProfileId(companionId?: string | null): string {
  if (!companionId) return TTS_CONFIG.defaultProfileId;
  if (TTS_CONFIG.profiles[companionId]) return companionId;
  return TTS_CONFIG.defaultProfileId;
}

export function getTtsProfile(profileId?: string | null): TtsVoiceProfile {
  const id = profileId && TTS_CONFIG.profiles[profileId]
    ? profileId
    : TTS_CONFIG.defaultProfileId;
  return TTS_CONFIG.profiles[id] ?? TTS_CONFIG.profiles['rough-male'];
}
