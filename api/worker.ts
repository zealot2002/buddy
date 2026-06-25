import { stories } from './data/stories.js';
import { companions } from './data/companions.js';
import { routes } from './data/routes.js';

export interface Env {
  // 可以在这里添加绑定的变量和 KV 命名空间
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (path.startsWith('/api/stories')) {
      if (method === 'GET') {
        if (path === '/api/stories') {
          return Response.json(stories);
        }
        const id = path.split('/').pop();
        const story = stories.find(s => s.id === id);
        if (story) {
          return Response.json(story);
        }
        return Response.json({ error: 'Story not found' }, { status: 404 });
      }
    }

    if (path.startsWith('/api/companions')) {
      if (method === 'GET') {
        if (path === '/api/companions') {
          return Response.json(companions);
        }
        const id = path.split('/').pop();
        const companion = companions.find(c => c.id === id);
        if (companion) {
          return Response.json(companion);
        }
        return Response.json({ error: 'Companion not found' }, { status: 404 });
      }
    }

    if (path.startsWith('/api/routes')) {
      if (method === 'GET') {
        if (path === '/api/routes') {
          return Response.json(routes);
        }
        const id = path.split('/').pop();
        const route = routes.find(r => r.id === id);
        if (route) {
          return Response.json(route);
        }
        return Response.json({ error: 'Route not found' }, { status: 404 });
      }
    }

    if (path === '/api/tts') {
      if (method === 'GET') {
        const text = url.searchParams.get('text');
        const lang = url.searchParams.get('lang') || 'zh-CN';
        
        if (!text) {
          return Response.json({ error: 'Text parameter is required' }, { status: 400 });
        }

        const encodedText = encodeURIComponent(text);
        const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;
        
        const response = await fetch(googleTtsUrl);
        if (!response.ok) {
          return Response.json({ error: 'Failed to generate audio' }, { status: 500 });
        }
        
        const audioBuffer = await response.arrayBuffer();
        return new Response(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mp3',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }
    }

    if (path === '/api/health') {
      return Response.json({ success: true, message: 'ok' });
    }

    return Response.json({ error: 'API not found' }, { status: 404 });
  },
};
