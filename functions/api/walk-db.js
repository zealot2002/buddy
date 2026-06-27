/**
 * 边走边听 D1 / SQLite 查询层（Express 与 Cloudflare Functions 共用）
 */

const COMPANION_ALIASES = { 'sarcastic-guy': 'sharp-elder' };

const DEFAULT_SPEECH = { minDurationSeconds: 45, charsPerSecond: 4.5 };

export function normalizeCompanionId(companionId) {
  const id = companionId || 'su-dongpo';
  return COMPANION_ALIASES[id] || id;
}

export function estimateSpeechDuration(text, speechConfig = DEFAULT_SPEECH) {
  return Math.max(
    speechConfig.minDurationSeconds,
    Math.ceil((text?.length || 0) / speechConfig.charsPerSecond),
  );
}

export function haversineMeters(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}

function buildExcludeClause(excludeJokeIds) {
  if (!excludeJokeIds?.length) {
    return { clause: '', binds: [] };
  }
  const placeholders = excludeJokeIds.map(() => '?').join(', ');
  return {
    clause: ` AND j.id NOT IN (${placeholders})`,
    binds: excludeJokeIds,
  };
}

async function getFenceRow(db, fenceId) {
  return db
    .prepare(
      `SELECT id, label, lat, lng, radius_meters AS radiusMeters
       FROM walk_fences WHERE id = ?`,
    )
    .bind(fenceId)
    .first();
}

async function getJokeActs(db, fenceId, companionId, jokeId) {
  const rows = await db
    .prepare(
      `SELECT act_index AS actIndex, version_id AS versionId, content, label
       FROM walk_acts
       WHERE fence_id = ? AND companion_id = ? AND joke_id = ?
       ORDER BY act_index ASC`,
    )
    .bind(fenceId, companionId, jokeId)
    .all();
  return rows.results ?? rows;
}

async function pickRandomJokeRow(db, fenceId, companionId, excludeJokeIds = []) {
  const { clause, binds } = buildExcludeClause(excludeJokeIds);
  const result = await db
    .prepare(
      `SELECT j.id, j.label
       FROM walk_jokes j
       WHERE j.fence_id = ? AND j.companion_id = ?${clause}
       ORDER BY RANDOM()
       LIMIT 1`,
    )
    .bind(fenceId, companionId, ...binds)
    .first();
  return result;
}

async function findJokeRow(db, fenceId, companionId, jokeId) {
  return db
    .prepare(
      `SELECT id, label FROM walk_jokes
       WHERE fence_id = ? AND companion_id = ? AND id = ?`,
    )
    .bind(fenceId, companionId, jokeId)
    .first();
}

async function getFirstJokeRow(db, fenceId, companionId) {
  return db
    .prepare(
      `SELECT id, label FROM walk_jokes
       WHERE fence_id = ? AND companion_id = ?
       ORDER BY sort_order ASC, id ASC
       LIMIT 1`,
    )
    .bind(fenceId, companionId)
    .first();
}

export async function getAllFenceRows(db) {
  const rows = await db
    .prepare(
      `SELECT id, label, trigger_hint AS triggerHint, lat, lng,
              radius_meters AS radiusMeters, sort_order AS sortOrder, area_id AS areaId
       FROM walk_fences
       ORDER BY sort_order ASC, id ASC`,
    )
    .bind()
    .all();
  return rows.results ?? rows;
}

export async function getFencesByArea(db, areaId = 'gong-wang-fu') {
  const fences = await getAllFenceRows(db);
  return fences.filter((fence) => fence.areaId === areaId);
}

export async function getNearbyWalkStatus(db, lat, lng, limit = 20) {
  const fences = await getAllFenceRows(db);
  return fences
    .map((fence) => {
      const distanceMeters = Math.round(haversineMeters(lat, lng, fence.lat, fence.lng));
      return {
        id: fence.id,
        label: fence.label,
        lat: fence.lat,
        lng: fence.lng,
        radius: fence.radiusMeters,
        distanceMeters,
        inside: distanceMeters <= fence.radiusMeters,
      };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, limit);
}

export async function getNearbyWalkMetas(db, lat, lng, limit = 20) {
  const items = await getNearbyWalkStatus(db, lat, lng, limit);
  return items.map(({ id, label, lat: snippetLat, lng: snippetLng, radius }) => ({
    id,
    label,
    lat: snippetLat,
    lng: snippetLng,
    radius,
  }));
}

export async function findActiveFence(db, lat, lng) {
  const fences = await getAllFenceRows(db);
  const hit = fences
    .map((fence) => ({
      fence,
      distance: haversineMeters(lat, lng, fence.lat, fence.lng),
    }))
    .filter(({ fence, distance }) => distance <= fence.radiusMeters)
    .sort((a, b) => a.distance - b.distance)[0];
  return hit?.fence ?? null;
}

export async function resolveWalkPlay(db, fenceId, companionId, options = {}, speechConfig = DEFAULT_SPEECH) {
  const fence = await getFenceRow(db, fenceId);
  if (!fence) return null;

  const normalizedId = normalizeCompanionId(companionId);
  const excludeJokeIds = options.excludeJokeIds ?? [];
  const trigger = options.trigger || 'auto';

  let jokeRow;
  if (options.jokeId) {
    jokeRow = await findJokeRow(db, fenceId, normalizedId, options.jokeId);
  } else if (
    options.randomJoke !== false
    && (options.actIndex == null || options.actIndex === 0)
  ) {
    jokeRow = await pickRandomJokeRow(db, fenceId, normalizedId, excludeJokeIds);
  } else {
    jokeRow = await getFirstJokeRow(db, fenceId, normalizedId);
  }

  if (!jokeRow) return null;

  const acts = await getJokeActs(db, fenceId, normalizedId, jokeRow.id);
  if (!acts.length) return null;

  const actIndex = Math.min(
    Math.max(options.actIndex ?? 0, 0),
    acts.length - 1,
  );
  const act = acts[actIndex];
  if (!act?.content) return null;

  return {
    snippetId: fenceId,
    companionId: normalizedId,
    versionId: act.versionId,
    content: act.content,
    styleNote: '',
    duration: estimateSpeechDuration(act.content, speechConfig),
    triggerType: options.trigger ?? (actIndex === 0 ? 'auto' : 'tap'),
    jokeId: jokeRow.id,
    jokeLabel: jokeRow.label,
    actIndex,
    actCount: acts.length,
    actLabel: act.label,
    fenceLabel: fence.label,
  };
}

export async function resolveWalkAutoPlay(db, fenceId, companionId, excludeJokeIds = [], speechConfig = DEFAULT_SPEECH) {
  return resolveWalkPlay(
    db,
    fenceId,
    companionId,
    {
      randomJoke: true,
      actIndex: 0,
      trigger: 'auto',
      excludeJokeIds,
    },
    speechConfig,
  );
}

export async function countWalkJokes(db, fenceId, companionId) {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS count FROM walk_jokes
       WHERE fence_id = ? AND companion_id = ?`,
    )
    .bind(fenceId, normalizeCompanionId(companionId))
    .first();
  return row?.count ?? 0;
}

export async function listMissingCompanionJokes(db, areaId, companionId) {
  const rows = await db
    .prepare(
      `SELECT f.id, f.label
       FROM walk_fences f
       LEFT JOIN walk_jokes j
         ON j.fence_id = f.id AND j.companion_id = ?
       WHERE f.area_id = ? AND j.id IS NULL
       ORDER BY f.sort_order ASC, f.id ASC`,
    )
    .bind(normalizeCompanionId(companionId), areaId)
    .all();
  return rows.results ?? rows;
}

export async function listWalkAreas(db) {
  const rows = await db
    .prepare(
      `SELECT id, name, area_tag AS areaTag,
              sim_base_lat AS simBaseLat, sim_base_lng AS simBaseLng,
              sim_coord_step_lat AS simCoordStepLat, sim_radius_meters AS simRadiusMeters
       FROM walk_areas
       ORDER BY id ASC`,
    )
    .bind()
    .all();
  return rows.results ?? rows;
}
