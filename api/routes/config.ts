import express, { Request, Response } from 'express';
import { APP_CONFIG } from '../config/index.js';

const router = express.Router();

/** 全量运营配置（供管理平台 / 调试） */
router.get('/', (_req: Request, res: Response) => {
  res.json(APP_CONFIG);
});

/** 边走边听策略配置（供客户端拉取） */
router.get('/walk', (_req: Request, res: Response) => {
  res.json(APP_CONFIG.walk);
});

export default router;
