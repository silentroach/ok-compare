/**
 * Трекер активности пользователя
 *
 * Считает реальное время активности на странице и вызывает callBack,
 * когда пользователь набрал achieveTime секунд активности.
 *
 * Время считается окнами по testPeriod секунд.
 * Если за окно было хотя бы одно событие — всё окно засчитывается.
 */

const TRACKED_EVENTS =
  'touchmove scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave keydown keypress keyup focus blur focusin focusout change select submit resize';

const COOKIE_NAME = 'activity';

function readCookie() {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`),
  );

  if (!match) return null;

  const parts = decodeURIComponent(match[1]).split('|');

  return { tick: parseInt(parts[0], 10), active: parseInt(parts[1], 10) };
}

function writeCookie(tick, active) {
  document.cookie = `${COOKIE_NAME}=${tick}|${active}; path=/;`;
}

export function activity(options) {
  const config = Object.assign(
    {
      achieveTime: 60,
      loop: 0,
      testPeriod: 10,
      useMultiMode: 1,
      callBack() {},
      watchEvery: 1,
    },
    options,
  );

  config.watchEvery *= 1000;

  let hadActivity = false;
  let tickCount = 0;
  let activeSeconds = 0;
  let timer = null;

  if (config.useMultiMode) {
    const saved = readCookie();

    if (saved) {
      tickCount = saved.tick;
      activeSeconds = saved.active;
    }
  }

  if (activeSeconds === -1) return;

  function onUserEvent() {
    hadActivity = true;
  }

  function tick() {
    tickCount++;

    if (tickCount >= config.testPeriod) {
      if (hadActivity) {
        activeSeconds += config.testPeriod;
      }

      hadActivity = false;
      tickCount = 0;
    }

    if (config.useMultiMode) {
      writeCookie(tickCount, activeSeconds);
    }

    if (activeSeconds >= config.achieveTime) {
      if (!config.loop) {
        stop();
        activeSeconds = -1;
      } else {
        activeSeconds = 0;
      }

      config.callBack();
    }
  }

  function start() {
    for (const event of TRACKED_EVENTS.split(' ')) {
      document.addEventListener(event, onUserEvent, { passive: true });
    }

    timer = setInterval(tick, config.watchEvery);
  }

  function stop() {
    clearInterval(timer);

    for (const event of TRACKED_EVENTS.split(' ')) {
      document.removeEventListener(event, onUserEvent);
    }
  }

  start();

  return stop;
}
