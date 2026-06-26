import data from './stories-data.json';

const { stories, companions, walkSnippets = [], walkOffsiteChatter = {}, appConfig = {} } = data;

const speechConfig = appConfig.speech || { minDurationSeconds: 45, charsPerSecond: 4.5 };
const walkConfig = appConfig.walk || { nearby: { limit: 20 } };

function estimateSpeechDuration(text) {
  return Math.max(
    speechConfig.minDurationSeconds,
    Math.ceil((text?.length || 0) / speechConfig.charsPerSecond),
  );
}

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

function pickRandomJoke(fence, excludeJokeIds = []) {
  if (!fence?.jokes?.length) return null;
  const exclude = new Set(excludeJokeIds);
  const pool = fence.jokes.filter((joke) => !exclude.has(joke.id));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function resolveWalkPlay(fenceId, companionId, options = {}) {
  const fence = walkSnippets.find((item) => item.id === fenceId);
  if (!fence?.jokes?.length) return null;

  const trigger = options.trigger || 'auto';
  const normalizedId = normalizeCompanionId(companionId || fence.primaryCompanionId || 'su-dongpo');
  const excludeJokeIds = options.excludeJokeIds || [];

  let joke;
  if (options.jokeId) {
    joke = fence.jokes.find((item) => item.id === options.jokeId);
  } else if (
    options.randomJoke !== false
    && (options.actIndex == null || options.actIndex === 0)
  ) {
    joke = pickRandomJoke(fence, excludeJokeIds);
  } else {
    joke = fence.jokes[0];
  }
  if (!joke?.acts?.length) return null;

  const actIndex = Math.min(
    Math.max(options.actIndex ?? 0, 0),
    joke.acts.length - 1,
  );
  const act = joke.acts[actIndex];
  if (!act?.content) return null;

  return {
    snippetId: fenceId,
    companionId: normalizedId,
    versionId: act.versionId,
    content: act.content,
    styleNote: '',
    duration: estimateSpeechDuration(act.content),
    triggerType: options.trigger ?? (actIndex === 0 ? 'auto' : 'tap'),
    jokeId: joke.id,
    jokeLabel: joke.label,
    actIndex,
    actCount: joke.acts.length,
    actLabel: act.label,
    fenceLabel: fence.label,
  };
}

function resolveWalkAutoPlay(fenceId, companionId, excludeJokeIds = []) {
  return resolveWalkPlay(fenceId, companionId, {
    randomJoke: true,
    actIndex: 0,
    trigger: 'auto',
    excludeJokeIds,
  });
}

function resolveOffsiteChatter(companionId) {
  const normalizedId = normalizeCompanionId(companionId);
  const scripts = walkOffsiteChatter[normalizedId] || walkOffsiteChatter['su-dongpo'] || [];
  const picked = pickRandomVariant(scripts);
  const duration = estimateSpeechDuration(picked.content);

  return {
    snippetId: 'offsite-chatter',
    companionId: normalizedId,
    versionId: picked.versionId,
    content: picked.content,
    styleNote: picked.styleNote || '',
    duration,
    triggerType: 'offsite',
  };
}

function getNearbyWalkMetas(lat, lng, limit = walkConfig.nearby?.limit ?? 20) {
  return walkSnippets
    .map((snippet) => {
      const distanceMeters = Math.round(
        haversineMeters(lat, lng, snippet.location.lat, snippet.location.lng),
      );
      const inside = distanceMeters <= snippet.location.radiusMeters;
      return {
        id: snippet.id,
        label: snippet.label,
        lat: snippet.location.lat,
        lng: snippet.location.lng,
        radius: snippet.location.radiusMeters,
        primaryCompanionId: snippet.primaryCompanionId,
        distanceMeters,
        inside,
      };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, limit);
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

  if (path.startsWith('/api/config')) {
    if (method === 'GET') {
      if (path === '/api/config/walk') {
        return Response.json(appConfig.walk || {}, { headers: corsHeaders });
      }
      if (path === '/api/config') {
        return Response.json(appConfig, { headers: corsHeaders });
      }
    }
  }

  if (path.startsWith('/api/walk')) {
    if (method === 'GET') {
      if (path === '/api/walk/nearby') {
        const lat = parseFloat(url.searchParams.get('lat') || '39.9163');
        const lng = parseFloat(url.searchParams.get('lng') || '116.3972');
        const verbose = url.searchParams.get('verbose') === '1';
        const items = getNearbyWalkMetas(lat, lng);
        if (verbose) {
          return Response.json(items, { headers: corsHeaders });
        }
        return Response.json(
          items.map(({ id, lat: snippetLat, lng: snippetLng, radius }) => ({
            id,
            lat: snippetLat,
            lng: snippetLng,
            radius,
          })),
          { headers: corsHeaders },
        );
      }

      if (path === '/api/walk/tap') {
        const lat = parseFloat(url.searchParams.get('lat') || '39.9163');
        const lng = parseFloat(url.searchParams.get('lng') || '116.3972');
        const companionId = normalizeCompanionId(url.searchParams.get('companionId') || 'su-dongpo');

        const activeSnippet = findActiveSnippet(lat, lng);
        if (!activeSnippet) {
          return Response.json(resolveOffsiteChatter(companionId), { headers: corsHeaders });
        }

        const excludeRaw = url.searchParams.get('exclude');
        const excludeJokeIds = excludeRaw
          ? excludeRaw.split(',').map((s) => s.trim()).filter(Boolean)
          : [];

        const payload = resolveWalkAutoPlay(activeSnippet.id, activeSnippet.primaryCompanionId, excludeJokeIds);
        if (!payload) {
          return Response.json(resolveOffsiteChatter(companionId), { headers: corsHeaders });
        }

        return Response.json(payload, { headers: corsHeaders });
      }

      if (path === '/api/walk/offsite') {
        const companionId = normalizeCompanionId(url.searchParams.get('companionId') || 'su-dongpo');
        return Response.json(resolveOffsiteChatter(companionId), { headers: corsHeaders });
      }

      const playMatch = path.match(/^\/api\/walk\/([^/]+)\/play$/);
      if (playMatch) {
        const companionId = normalizeCompanionId(url.searchParams.get('companionId') || 'su-dongpo');
        const trigger = url.searchParams.get('trigger') === 'tap' ? 'tap' : 'auto';
        const jokeId = url.searchParams.get('jokeId') || undefined;
        const actRaw = url.searchParams.get('act');
        const actIndex = actRaw != null && actRaw !== '' ? Number.parseInt(actRaw, 10) : undefined;
        const randomJoke = url.searchParams.get('random') !== '0';
        const excludeRaw = url.searchParams.get('exclude');
        const excludeJokeIds = excludeRaw
          ? excludeRaw.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
        const payload = jokeId || actIndex != null || randomJoke === false
          ? resolveWalkPlay(playMatch[1], companionId, {
              jokeId,
              actIndex,
              randomJoke,
              excludeJokeIds,
              trigger,
            })
          : resolveWalkAutoPlay(playMatch[1], companionId, excludeJokeIds);
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
