import { stories } from './data/stories.js';
import { companions } from './data/companions.js';
import { synthesizeSpeechWithFallback } from './data/tts-synthesize.js';

export interface Env {
  // 可以在这里添加绑定的变量和 KV 命名空间
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle OPTIONS requests for CORS
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (path.startsWith('/api/stories')) {
      if (method === 'GET') {
        // Handle nearby stories
        if (path === '/api/stories/nearby') {
          const lat = parseFloat(url.searchParams.get('lat') || '0');
          const lng = parseFloat(url.searchParams.get('lng') || '0');
          
          // Simple distance calculation - return all stories for now
          // In production, you would filter by actual distance
          const nearbyStories = stories.map(story => ({
            ...story,
            distance: Math.sqrt(
              Math.pow((story.location.lat - lat) * 111, 2) + 
              Math.pow((story.location.lng - lng) * 111, 2)
            )
          })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
          
          return Response.json(nearbyStories, { headers: corsHeaders });
        }
        
        // Handle all stories
        if (path === '/api/stories') {
          return Response.json(stories, { headers: corsHeaders });
        }
        
        // Handle single story
        const id = path.replace('/api/stories/', '');
        const story = stories.find(s => s.id === id);
        if (story) {
          return Response.json(story, { headers: corsHeaders });
        }
        return Response.json({ error: 'Story not found' }, { status: 404, headers: corsHeaders });
      }
    }

    if (path.startsWith('/api/companions')) {
      if (method === 'GET') {
        if (path === '/api/companions') {
          return Response.json(companions, { headers: corsHeaders });
        }
        const id = path.replace('/api/companions/', '');
        const companion = companions.find(c => c.id === id);
        if (companion) {
          // Add stories count for companion
          const companionWithStories = {
            ...companion,
            stories: stories.filter(s => s.narrators.some(n => n.companionId === id))
          };
          return Response.json(companionWithStories, { headers: corsHeaders });
        }
        return Response.json({ error: 'Companion not found' }, { status: 404, headers: corsHeaders });
      }
    }

    if (path === '/api/tts') {
      if (method === 'GET') {
        const text = url.searchParams.get('text');
        const companionId = url.searchParams.get('companionId');
        const profileId = url.searchParams.get('profile');

        if (!text) {
          return Response.json({ error: 'Text parameter is required' }, { status: 400, headers: corsHeaders });
        }

        try {
          const { response, provider } = await synthesizeSpeechWithFallback({ text, companionId, profileId });
          if (!response.ok) {
            return Response.json({ error: 'Failed to generate audio' }, { status: 500, headers: corsHeaders });
          }

          const audioBuffer = await response.arrayBuffer();
          return new Response(audioBuffer, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'public, max-age=86400',
              'X-TTS-Provider': provider,
            },
          });
        } catch (e) {
          return Response.json({ error: 'TTS service unavailable' }, { status: 500, headers: corsHeaders });
        }
      }
    }

    if (path === '/api/health') {
      return Response.json({ success: true, message: 'ok' }, { headers: corsHeaders });
    }

    return Response.json({ error: 'API not found' }, { status: 404, headers: corsHeaders });
  },
};