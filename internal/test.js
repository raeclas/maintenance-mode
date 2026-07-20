// Test harness — node:assert pattern (see ../FightingInc/internal/test.js).
// Grows with the first gameplay commit; must stay green at every commit.
import assert from 'node:assert';

assert.ok(true, 'harness alive');
console.log('tests: 1 passed');
