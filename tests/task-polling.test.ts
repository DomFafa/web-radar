import { expect, it } from 'vitest';
import type { Job } from '../src/shared/model';
import { needsClonePolling } from '../src/client/task-polling';
it('stops for missing, finished, failed, paused and stopped tasks',()=>{
  expect(needsClonePolling({job:null})).toBe(false);
  for(const status of ['succeeded','failed','paused','cancelled'] as const)expect(needsClonePolling({job:{status} as Job})).toBe(false);
});
it('continues through publication and restarts for resumed generation',()=>{
  expect(needsClonePolling({job:{status:'succeeded'} as Job,publication:{status:'running'}})).toBe(true);
  expect(needsClonePolling({job:{status:'succeeded'} as Job,publication:{status:'succeeded'}})).toBe(false);
  expect(needsClonePolling({job:{status:'queued'} as Job})).toBe(true);
});
