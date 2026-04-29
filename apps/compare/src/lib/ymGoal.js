import { activity } from './ymActivity.js';

activity({
  achieveTime: 60,
  testPeriod: 10,
  useMultiMode: 0,
  callBack() {
    const raw = document.documentElement.dataset.ymId;
    const id = Number(raw ?? '108465472');

    if (typeof window.ym === 'function' && Number.isFinite(id)) {
      window.ym(id, 'reachGoal', '60_sec');
    }
  },
});
