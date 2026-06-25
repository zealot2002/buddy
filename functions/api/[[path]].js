import data from './stories-data.json';

const { stories, companions, walkSnippets = [] } = data;

const STORY_ID_ALIASES = {
  'forbidden-city': 'forbidden-city-hall',
  'terra-cotta': 'terracotta-army',
  'su-garden': 'suzhou-garden',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function resolveStoryId(id) {
  return STORY_ID_ALIASES[id] || id;
}

function haversineMeters(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}

function normalizeCompanionId(companionId) {
  const aliases = { 'sarcastic-guy': 'sharp-elder' };
  return aliases[companionId] || companionId;
}

function pickRandomVariant(variants) {
  return variants[Math.floor(Math.random() * variants.length)];
}

function resolveWalkPlay(snippetId, companionId) {
  const snippet = walkSnippets.find((item) => item.id === snippetId);
  if (!snippet) return null;

  const normalizedId = normalizeCompanionId(companionId);
  const companionScripts = snippet.scripts?.[normalizedId];
  if (!companionScripts?.variants?.length) return null;

  const picked = pickRandomVariant(companionScripts.variants);
  const duration = Math.max(45, Math.ceil((picked.content?.length || 0) / 4.5));

  return {
    snippetId,
    companionId: normalizedId,
    versionId: picked.versionId,
    content: picked.content,
    styleNote: picked.styleNote || '',
    duration,
  };
}

function getNearbyWalkMetas(lat, lng, limit = 20) {
  return walkSnippets
    .map((snippet) => ({
      id: snippet.id,
      lat: snippet.location.lat,
      lng: snippet.location.lng,
      radius: snippet.location.radiusMeters,
      distance: haversineMeters(lat, lng, snippet.location.lat, snippet.location.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ id, lat: snippetLat, lng: snippetLng, radius }) => ({
      id,
      lat: snippetLat,
      lng: snippetLng,
      radius,
    }));
}

function findActiveSnippet(lat, lng) {
  return walkSnippets
    .map((snippet) => ({
      snippet,
      distance: haversineMeters(lat, lng, snippet.location.lat, snippet.location.lng),
    }))
    .filter(({ snippet, distance }) => distance <= snippet.location.radiusMeters)
    .sort((a, b) => a.distance - b.distance)[0]?.snippet;
}

function findStory(id) {
  const resolvedId = resolveStoryId(id);
  return stories.find((story) => story.id === resolvedId || story.id === id);
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (path.startsWith('/api/walk')) {
    if (method === 'GET') {
      if (path === '/api/walk/nearby') {
        const lat = parseFloat(url.searchParams.get('lat') || '39.9163');
        const lng = parseFloat(url.searchParams.get('lng') || '116.3972');
        return Response.json(getNearbyWalkMetas(lat, lng), { headers: corsHeaders });
      }

      if (path === '/api/walk/tap') {
        const lat = parseFloat(url.searchParams.get('lat') || '39.9163');
        const lng = parseFloat(url.searchParams.get('lng') || '116.3972');
        const companionId = normalizeCompanionId(url.searchParams.get('companionId') || 'su-dongpo');

        const activeSnippet = findActiveSnippet(lat, lng);
        const nearestMeta = getNearbyWalkMetas(lat, lng, 1)[0];
        const snippetId = activeSnippet?.id || nearestMeta?.id;

        if (!snippetId) {
          return Response.json({ error: 'No walk snippets available' }, { status: 404, headers: corsHeaders });
        }

        const payload = resolveWalkPlay(snippetId, companionId);
        if (!payload) {
          return Response.json({ error: 'Walk snippet not found' }, { status: 404, headers: corsHeaders });
        }

        return Response.json(payload, { headers: corsHeaders });
      }

      const playMatch = path.match(/^\/api\/walk\/([^/]+)\/play$/);
      if (playMatch) {
        const companionId = normalizeCompanionId(url.searchParams.get('companionId') || 'su-dongpo');
        const payload = resolveWalkPlay(playMatch[1], companionId);
        if (!payload) {
          return Response.json({ error: 'Walk snippet not found' }, { status: 404, headers: corsHeaders });
        }
        return Response.json(payload, { headers: corsHeaders });
      }
    }
  }

  if (path.startsWith('/api/stories')) {
    if (method === 'GET') {
      if (path === '/api/stories/nearby') {
        const lat = parseFloat(url.searchParams.get('lat') || '0');
        const lng = parseFloat(url.searchParams.get('lng') || '0');

        const nearbyStories = stories.map((story) => ({
          ...story,
          distance: Math.sqrt(
            Math.pow((story.location.lat - lat) * 111, 2) +
            Math.pow((story.location.lng - lng) * 111, 2),
          ),
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

        return Response.json(nearbyStories, { headers: corsHeaders });
      }

      if (path === '/api/stories') {
        return Response.json(stories, { headers: corsHeaders });
      }

      const id = path.replace('/api/stories/', '');
      const story = findStory(id);
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
      const companion = companions.find((item) => item.id === id);
      if (companion) {
        const companionWithStories = {
          ...companion,
          stories: stories.filter((story) =>
            story.narrators.some((narrator) => narrator.companionId === id),
          ),
        };
        return Response.json(companionWithStories, { headers: corsHeaders });
      }
      return Response.json({ error: 'Companion not found' }, { status: 404, headers: corsHeaders });
    }
  }

  if (path === '/api/tts') {
    if (method === 'GET') {
      const text = url.searchParams.get('text');
      const lang = url.searchParams.get('lang') || 'zh-CN';

      if (!text) {
        return Response.json({ error: 'Text parameter is required' }, { status: 400, headers: corsHeaders });
      }

      const encodedText = encodeURIComponent(text);
      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;

      try {
        const response = await fetch(googleTtsUrl);
        if (!response.ok) {
          return Response.json({ error: 'Failed to generate audio' }, { status: 500, headers: corsHeaders });
        }

        const audioBuffer = await response.arrayBuffer();
        return new Response(audioBuffer, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'audio/mp3',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      } catch {
        return Response.json({ error: 'TTS service unavailable' }, { status: 500, headers: corsHeaders });
      }
    }
  }

  if (path === '/api/health') {
    return Response.json({ success: true, message: 'ok' }, { headers: corsHeaders });
  }

  return Response.json({ error: 'API not found' }, { status: 404, headers: corsHeaders });
}
