import gongWangFuData from '../api/data/gong-wang-fu.json';
import { MVP_COMPANION_IDS } from '../api/data/companions.js';
import type { WalkArea } from '../api/data/walk-area-types.js';
import {
  clearWalkContent,
  getLocalWalkDbForSeed,
  isWalkDbSeeded,
  runWalkMigrations,
} from '../api/db/local-walk-db.js';

const area = gongWangFuData as WalkArea;

export function seedWalkContentFromJson(options: { force?: boolean } = {}) {
  runWalkMigrations();

  if (!options.force && isWalkDbSeeded()) {
    console.log('joyjoy walk DB already seeded, skip (use --force to replace)');
    return { seeded: false, fences: 0, jokes: 0, acts: 0 };
  }

  if (options.force) {
    clearWalkContent();
  }

  const db = getLocalWalkDbForSeed();
  const insertArea = db.prepare(`
    INSERT INTO walk_areas (id, name, area_tag, sim_base_lat, sim_base_lng, sim_coord_step_lat, sim_radius_meters)
    VALUES (@id, @name, @areaTag, @simBaseLat, @simBaseLng, @simCoordStepLat, @simRadiusMeters)
  `);

  const insertFence = db.prepare(`
    INSERT INTO walk_fences (id, area_id, label, trigger_hint, lat, lng, radius_meters, sort_order)
    VALUES (@id, @areaId, @label, @triggerHint, @lat, @lng, @radiusMeters, @sortOrder)
  `);

  const insertJoke = db.prepare(`
    INSERT INTO walk_jokes (id, fence_id, companion_id, label, sort_order)
    VALUES (@id, @fenceId, @companionId, @label, @sortOrder)
  `);

  const insertAct = db.prepare(`
    INSERT INTO walk_acts (fence_id, companion_id, joke_id, act_index, version_id, content, label)
    VALUES (@fenceId, @companionId, @jokeId, @actIndex, @versionId, @content, @label)
  `);

  let jokeCount = 0;
  let actCount = 0;

  const seedAll = db.transaction(() => {
    insertArea.run({
      id: area.id,
      name: area.name,
      areaTag: area.areaTag,
      simBaseLat: area.simulation?.baseLat ?? null,
      simBaseLng: area.simulation?.baseLng ?? null,
      simCoordStepLat: area.simulation?.coordStepLat ?? null,
      simRadiusMeters: area.simulation?.radiusMeters ?? null,
    });

    area.fences.forEach((fence, fenceIndex) => {
      insertFence.run({
        id: fence.id,
        areaId: area.id,
        label: fence.label,
        triggerHint: fence.triggerHint ?? null,
        lat: fence.location.lat,
        lng: fence.location.lng,
        radiusMeters: fence.location.radiusMeters,
        sortOrder: fenceIndex,
      });

      for (const companionId of MVP_COMPANION_IDS) {
        const jokes = fence.byCompanion[companionId]?.jokes ?? [];
        jokes.forEach((joke, jokeIndex) => {
          insertJoke.run({
            id: joke.id,
            fenceId: fence.id,
            companionId,
            label: joke.label ?? null,
            sortOrder: jokeIndex,
          });
          jokeCount += 1;

          joke.acts.forEach((act, actIndex) => {
            insertAct.run({
              fenceId: fence.id,
              companionId,
              jokeId: joke.id,
              actIndex,
              versionId: act.versionId,
              content: act.content,
              label: act.label ?? null,
            });
            actCount += 1;
          });
        });
      }
    });
  });

  seedAll();

  console.log('joyjoy seeded walk DB:', {
    area: area.id,
    fences: area.fences.length,
    jokes: jokeCount,
    acts: actCount,
  });

  return {
    seeded: true,
    fences: area.fences.length,
    jokes: jokeCount,
    acts: actCount,
  };
}
