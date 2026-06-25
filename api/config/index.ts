/**
 * 应用运营配置入口 — 后续管理平台统一读写此模块导出的结构。
 */
import { SPEECH_CONFIG, type SpeechConfig } from './speech-config.js';
import { WALK_LISTEN_CONFIG, type WalkListenConfig } from './walk-config.js';

export interface AppConfig {
  version: number;
  walk: WalkListenConfig;
  speech: SpeechConfig;
}

/** 当前生效的全局配置快照（同步至 Cloudflare Functions JSON） */
export const APP_CONFIG: AppConfig = {
  version: 1,
  walk: WALK_LISTEN_CONFIG,
  speech: SPEECH_CONFIG,
};

export {
  WALK_LISTEN_CONFIG,
  getFenceRadiusMeters,
  canAutoTriggerWalk,
  type WalkListenConfig,
  type WalkAutoTriggerConfig,
  type WalkAutoTriggerGate,
} from './walk-config.js';

export { SPEECH_CONFIG, estimateSpeechDurationFromConfig, type SpeechConfig } from './speech-config.js';
