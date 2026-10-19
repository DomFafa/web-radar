import assert from 'node:assert/strict';
import test from 'node:test';
import { scripts, createMockRun, advanceMockRun } from '../src/mock-engine.js';

test('each script transitions from running to success with deterministic steps', () => {
  for (const script of scripts) {
    let run = createMockRun(script, 1);
    assert.equal(run.state, 'running');
    assert.equal(run.step, 0);
    for (let index = 0; index < script.steps.length; index += 1) {
      run = advanceMockRun(run, script);
      assert.equal(run.step, index + 1);
      assert.equal(run.state, index === script.steps.length - 1 ? 'success' : 'running');
    }
    assert.equal(advanceMockRun(run, script), run, 'completed runs do not advance');
    assert.equal(run.logs.at(-1), '任务已成功完成（模拟）');
  }
});

test('unknown script cannot create or advance a run', () => {
  assert.throws(() => createMockRun({ id: 'PRODUCTION' }, 2), /Unknown mock script/);
  const run = createMockRun(scripts[0], 1);
  assert.equal(advanceMockRun(run, scripts[1]), run);
});
