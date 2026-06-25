/** TTS / 播放时长估算配置 */

export interface SpeechConfig {
  /** 最短播放时长（秒） */
  minDurationSeconds: number;
  /** 估算语速：字/秒 */
  charsPerSecond: number;
}

export const SPEECH_CONFIG: SpeechConfig = {
  minDurationSeconds: 45,
  charsPerSecond: 4.5,
};

export function estimateSpeechDurationFromConfig(
  text: string,
  config: SpeechConfig = SPEECH_CONFIG,
): number {
  return Math.max(
    config.minDurationSeconds,
    Math.ceil(text.length / config.charsPerSecond),
  );
}
