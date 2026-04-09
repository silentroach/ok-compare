import { activity } from './ymActivity.js';

activity({
  achieveTime: 60,
  testPeriod: 10,
  useMultiMode: 0,
  callBack() {
    if (typeof window.ym === 'function') {
      window.ym(108465472, 'reachGoal', '60_sec');
    }
  },
});
