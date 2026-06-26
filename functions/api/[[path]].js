import data from './stories-data.json';
import { synthesizeSpeechWithFallback } from './tts-synthesize.js';

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

function resolveTreeVariant(tree, layer, branch) {
  if (!tree) return null;
  switch (layer) {
    case 'L1':
      return tree.l1;
    case 'L2':
      return branch === 'B' ? tree.l2B : tree.l2A;
    case 'L3':
      return tree.l3;
    default:
      return null;
  }
}

function resolveWalkPlay(snippetId, companionId, options = {}) {
  const snippet = walkSnippets.find((item) => item.id === snippetId);
  if (!snippet || !companionId) return null;

  const layer = options.layer || 'L1';
  const branch = options.branch || 'A';
  const trigger = options.trigger || (layer === 'L1' ? 'auto' : 'tap');
  const normalizedId = normalizeCompanionId(companionId);
  const tree = snippet.treesByCompanion?.[normalizedId] ?? snippet.tree;
  if (!tree) return null;

  const variant = resolveTreeVariant(tree, layer, branch);
  if (!variant?.content) return null;

  return {
    snippetId,
    companionId: normalizedId,
    versionId: variant.versionId,
    content: variant.content,
    styleNote: variant.styleNote || '',
    duration: estimateSpeechDuration(variant.content),
    triggerType: trigger,
    layer,
    branch: layer === 'L2' ? branch : undefined,
    label:
      layer === 'L2'
        ? branch === 'B'
          ? tree.l2B?.label
          : tree.l2A?.label
        : snippet.label,
  };
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

function getNearbyWalkMetas(lat, lng, companionId, limit = walkConfig.nearby?.limit ?? 20) {
  return walkSnippets
    .map((snippet) => {
      const distanceMeters = Math.round(
        haversineMeters(lat, lng, snippet.location.lat, snippet.location.lng),
      );
      const inside = distanceMeters <= snippet.location.radiusMeters;
      const normalizedId = companionId ? normalizeCompanionId(companionId) : null;
      const hasContent = normalizedId
        ? Boolean(snippet.treesByCompanion?.[normalizedId] ?? snippet.tree)
        : undefined;
      return {
        id: snippet.id,
        label: snippet.label,
        lat: snippet.location.lat,
        lng: snippet.location.lng,
        radius: snippet.location.radiusMeters,
        distanceMeters,
        inside,
        hasContent,
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
        const lat = parseFloat(url.searchParams.get('lat') || '39.9371');
        const lng = parseFloat(url.searchParams.get('lng') || '116.3862');
        const companionId = url.searchParams.get('companionId') || undefined;
        const verbose = url.searchParams.get('verbose') === '1';
        const items = getNearbyWalkMetas(lat, lng, companionId);
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

        const payload = resolveWalkPlay(activeSnippet.id, companionId, {
          layer: 'L2',
          branch: 'A',
          trigger: 'tap',
        });
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
        const layer = url.searchParams.get('layer') || 'L1';
        const branch = url.searchParams.get('branch') || 'A';
        const payload = resolveWalkPlay(playMatch[1], companionId, { layer, branch, trigger });
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
