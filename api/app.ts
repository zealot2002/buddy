/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { createProxyMiddleware } from 'http-proxy-middleware'
import authRoutes from './routes/auth.js'
import storiesRoutes from './routes/stories.js'
import walkRoutes from './routes/walk.js'
import companionsRoutes from './routes/companions.js'
import ttsRoutes from './routes/tts.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/stories', storiesRoutes)
app.use('/api/walk', walkRoutes)
app.use('/api/companions', companionsRoutes)
app.use('/api/tts', ttsRoutes)

app.use('/api/map-tiles', createProxyMiddleware({
  target: 'https://cartocdn.com',
  changeOrigin: true,
  pathRewrite: { '^/api/map-tiles': '' },
  headers: {
    'Referer': 'https://cartocdn.com',
  },
}))

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
