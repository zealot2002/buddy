import data from './stories-data.json';
import {
  findActiveFence,
  getNearbyWalkMetas,
  getNearbyWalkStatus,
  resolveWalkAutoPlay,
  resolveWalkPlay,
} from './walk-db.js';

const { stories, companions, walkOffsiteChatter = {}, appConfig = {} } = data;

const speechConfig = appConfig.speech || { minDurationSeconds: 45, charsPerSecond: 4.5 };
const walkConfig = appConfig.walk || { nearby: { limit: 20 } };
const ttsConfig = appConfig.tts || { provider: 'elevenlabs', modelId: 'eleven_multilingual_v2', outputFormat: 'mp3_44100_128' };

const EMOTION_STABILITY = { cheerful: 0.45, gentle: 0.55, warm: 0.5, humorous: 0.35 };
const EMOTION_STYLE = { cheerful: 0.35, gentle: 0.25, warm: 0.3, humorous: 0.45 };

function resolveElevenLabsVoiceSettings(companionId) {
  const normalizedId = normalizeCompanionId(companionId || 'su-dongpo');
  const companion = companions.find((item) => item.id === normalizedId) || companions[0];
  const emotion = companion?.toneProfile?.emotion || 'cheerful';
  return {
    stability: EMOTION_STABILITY[emotion] ?? 0.5,
    similarity_boost: 0.75,
    style: EMOTION_STYLE[emotion] ?? 0.3,
    use_speaker_boost: true,
    speed: companion?.toneProfile?.speed ?? 1,
  };
}

function resolveElevenLabsVoiceId(companionId) {
  const normalizedId = normalizeCompanionId(companionId || 'su-dongpo');
  const companion = companions.find((item) => item.id === normalizedId);
  return companion?.voiceId || 'JBFqnCBsd6RMkjVDRZzb';
}

async function synthesizeElevenLabsSpeech(text, companionId, apiKey) {
  const voiceId = resolveElevenLabsVoiceId(companionId);
  const voiceSettings = resolveElevenLabsVoiceSettings(companionId);
  const { speed, ...settings } = voiceSettings;
  const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`);
  url.searchParams.set('output_format', ttsConfig.outputFormat || 'mp3_44100_128');

  return fetch(url.toString(), {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: text.trim(),
      model_id: ttsConfig.modelId || 'eleven_multilingual_v2',
      voice_settings: settings,
      speed,
    }),
  });
}

async function synthesizeGoogleSpeechFallback(text, lang = 'zh-CN') {
  const encodedText = encodeURIComponent(text);
  return fetch(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`);
}

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
  return aliases[companionId] || companionId || 'su-dongpo';
}

function pickRandomVariant(variants) {
  return variants[Math.floor(Math.random() * variants.length)];
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

function walkDbErrorResponse() {
  return Response.json(
    { error: 'walk_db_not_configured', hint: 'Bind D1 (DB) and run db:seed:remote' },
    { status: 503, headers: corsHeaders },
  );
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
    const db = context.env?.DB;
    if (!db) {
      return walkDbErrorResponse();
    }

    const speechConfig = appConfig.speech || { minDurationSeconds: 45, charsPerSecond: 4.5 };
    const nearbyLimit = walkConfig.nearby?.limit ?? 20;

    if (method === 'GET') {
      if (path === '/api/walk/nearby') {
        const lat = parseFloat(url.searchParams.get('lat') || '39.9163');
        const lng = parseFloat(url.searchParams.get('lng') || '116.3972');
        const verbose = url.searchParams.get('verbose') === '1';
        if (verbose) {
          const items = await getNearbyWalkStatus(db, lat, lng, nearbyLimit);
          return Response.json(items, { headers: corsHeaders });
        }
        const items = await getNearbyWalkMetas(db, lat, lng, nearbyLimit);
        return Response.json(items, { headers: corsHeaders });
      }

      if (path === '/api/walk/tap') {
        const lat = parseFloat(url.searchParams.get('lat') || '39.9163');
        const lng = parseFloat(url.searchParams.get('lng') || '116.3972');
        const companionId = normalizeCompanionId(url.searchParams.get('companionId') || 'su-dongpo');

        const activeFence = await findActiveFence(db, lat, lng);
        if (!activeFence) {
          return Response.json(resolveOffsiteChatter(companionId), { headers: corsHeaders });
        }

        const excludeRaw = url.searchParams.get('exclude');
        const excludeJokeIds = excludeRaw
          ? excludeRaw.split(',').map((s) => s.trim()).filter(Boolean)
          : [];

        const payload = await resolveWalkAutoPlay(
          db,
          activeFence.id,
          companionId,
          excludeJokeIds,
          speechConfig,
        );
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
          ? await resolveWalkPlay(
              db,
              playMatch[1],
              companionId,
              {
                jokeId,
                actIndex,
                randomJoke,
                excludeJokeIds,
                trigger,
              },
              speechConfig,
            )
          : await resolveWalkAutoPlay(db, playMatch[1], companionId, excludeJokeIds, speechConfig);
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
      const companionId = url.searchParams.get('companionId') || 'su-dongpo';
      const apiKey = context.env?.ELEVENLABS_API_KEY;

      if (!text?.trim()) {
        return Response.json({ error: 'Text parameter is required' }, { status: 400, headers: corsHeaders });
      }

      try {
        let response;
        let provider = 'google';

        if (apiKey) {
          response = await synthesizeElevenLabsSpeech(text, companionId, apiKey);
          if (response.ok) {
            provider = 'elevenlabs';
          } else {
            console.error('joyjoy ElevenLabs TTS failed:', response.status);
            response = await synthesizeGoogleSpeechFallback(text, lang);
          }
        } else {
          response = await synthesizeGoogleSpeechFallback(text, lang);
        }

        if (!response.ok) {
          return Response.json({ error: 'Failed to generate audio' }, { status: 500, headers: corsHeaders });
        }

        const audioBuffer = await response.arrayBuffer();
        return new Response(audioBuffer, {
          headers: {
            ...corsHeaders,
            'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
            'Cache-Control': 'public, max-age=86400',
            'X-TTS-Provider': provider,
          },
        });
      } catch (error) {
        console.error('joyjoy TTS service error:', error);
        return Response.json({ error: 'TTS service unavailable' }, { status: 500, headers: corsHeaders });
      }
    }
  }

  if (path === '/api/health') {
    return Response.json({ success: true, message: 'ok' }, { headers: corsHeaders });
  }

  return Response.json({ error: 'API not found' }, { status: 404, headers: corsHeaders });
}
