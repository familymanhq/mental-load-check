window.ML = window.ML || {};

ML.CONFIG = {
  storageKey: 'mentalload.v1',
  verdictThreshold: 0.75,
  balanceHeavy: 0.6,
  balanceLight: 0.3
};

ML.STAGES = ['c', 'p', 'e'];
ML.STAGE_TITLES = { c: 'Conceive', p: 'Plan', e: 'Execute' };

ML.SCALE = {
  values: [-2, -1, 0, 1, 2],
  labels: { '-2': 'All me', '-1': 'Mostly me', '0': 'Roughly equal', '1': 'Mostly spouse', '2': 'Spouse' },
  colors: { '-2': '#1F5A8F', '-1': '#A9C8E4', '0': '#E4E2DC', '1': '#F2C48D', '2': '#B3530F' },
  textOn: { '-2': '#fff', '-1': '#14213D', '0': '#14213D', '1': '#14213D', '2': '#fff' }
};

ML.Store = (function () {
  function newState() {
    return {
      version: 1,
      gut: {},
      detail: {},
      opened: [],
      progress: { screen: 'welcome', gutPage: 0, activeCategory: null, explainerSeen: false }
    };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(ML.CONFIG.storageKey);
      if (!raw) return newState();
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1) return newState();
      var base = newState();
      return {
        version: 1,
        gut: parsed.gut || {},
        detail: parsed.detail || {},
        opened: parsed.opened || [],
        progress: Object.assign(base.progress, parsed.progress || {})
      };
    } catch (e) {
      return newState();
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(ML.CONFIG.storageKey, JSON.stringify(state));
    } catch (e) {
      // storage blocked: app keeps running in memory for this session
    }
  }

  function clearState() {
    try {
      localStorage.removeItem(ML.CONFIG.storageKey);
    } catch (e) {}
  }

  return { newState: newState, loadState: loadState, saveState: saveState, clearState: clearState };
})();

ML.Cats = (function () {
  function isSkipped(state, id) {
    return state.gut[id] === 'skip';
  }
  function isGutAnswered(state, id) {
    return state.gut[id] !== undefined;
  }
  function allGutAnswered(state) {
    return ML.CATEGORIES.every(function (c) { return isGutAnswered(state, c.id); });
  }
  function activeCategories(state) {
    return ML.CATEGORIES.filter(function (c) { return !isSkipped(state, c.id); });
  }
  function isOpened(state, id) {
    return state.opened.indexOf(id) !== -1;
  }
  function unopenedActiveCategories(state) {
    return activeCategories(state).filter(function (c) { return !isOpened(state, c.id); });
  }
  function detailDone(detail) {
    return !!detail && ML.STAGES.every(function (s) { return detail[s] !== undefined && detail[s] !== null; });
  }
  function leadCategory(state) {
    var active = activeCategories(state);
    var allYou = active.find(function (c) { return state.gut[c.id] === -2; });
    if (allYou) return allYou;
    var equal = active.find(function (c) { return state.gut[c.id] === 0; });
    if (equal) return equal;
    var anyAnswered = active.find(function (c) { return typeof state.gut[c.id] === 'number'; });
    return anyAnswered || active[0] || ML.CATEGORIES[0];
  }
  function pickNextOrder(state) {
    var remaining = unopenedActiveCategories(state);
    var allYou = remaining.filter(function (c) { return state.gut[c.id] === -2; });
    var equal = remaining.filter(function (c) { return state.gut[c.id] === 0; });
    var rest = remaining.filter(function (c) { return state.gut[c.id] !== -2 && state.gut[c.id] !== 0; });
    return allYou.concat(equal, rest);
  }
  function getCategory(id) {
    return ML.CATEGORIES.find(function (c) { return c.id === id; });
  }
  return {
    isSkipped: isSkipped, isGutAnswered: isGutAnswered, allGutAnswered: allGutAnswered,
    activeCategories: activeCategories, isOpened: isOpened, unopenedActiveCategories: unopenedActiveCategories,
    detailDone: detailDone, leadCategory: leadCategory, pickNextOrder: pickNextOrder, getCategory: getCategory
  };
})();

ML.Scoring = (function () {
  function numeric(v) { return typeof v === 'number'; }

  function detailAverage(detail) {
    var nums = ML.STAGES.map(function (s) { return detail[s]; }).filter(numeric);
    if (!nums.length) return null;
    return nums.reduce(function (a, b) { return a + b; }, 0) / nums.length;
  }

  function widestStage(detail, gut) {
    var far = null, max = -1;
    ML.STAGES.forEach(function (s) {
      var v = detail[s];
      if (numeric(v)) {
        var d = Math.abs(v - gut);
        if (d > max) { max = d; far = s; }
      }
    });
    return far;
  }

  function verdictFor(gap) {
    if (gap <= -ML.CONFIG.verdictThreshold) return 'more';
    if (gap >= ML.CONFIG.verdictThreshold) return 'less';
    return 'ok';
  }

  function analyzeCategory(cat, state) {
    var gut = state.gut[cat.id];
    var detail = state.detail[cat.id];
    if (gut === undefined || gut === 'skip' || !ML.Cats.detailDone(detail)) return null;
    var avg = detailAverage(detail);
    if (avg === null) return null;
    var gap = avg - gut;
    return { cat: cat, gut: gut, detail: detail, avg: avg, gap: gap, verdict: verdictFor(gap), widest: widestStage(detail, gut) };
  }

  function allAnalyzed(state) {
    return ML.CATEGORIES.map(function (c) { return analyzeCategory(c, state); }).filter(Boolean);
  }

  function topSurprises(state, n) {
    return allAnalyzed(state)
      .filter(function (a) { return a.verdict !== 'ok'; })
      .sort(function (x, y) { return Math.abs(y.gap) - Math.abs(x.gap); })
      .slice(0, n || 3);
  }

  function thankYouList(state, n) {
    return allAnalyzed(state)
      .filter(function (a) { return a.verdict === 'less'; })
      .sort(function (x, y) { return Math.abs(y.gap) - Math.abs(x.gap); })
      .slice(0, n || 3);
  }

  function bestGuesses(state, n) {
    return allAnalyzed(state)
      .filter(function (a) { return a.verdict === 'ok'; })
      .sort(function (x, y) { return Math.abs(x.gap) - Math.abs(y.gap); })
      .slice(0, n || 3);
  }

  function balanceCheck(state) {
    var withConceive = allAnalyzed(state).filter(function (a) { return numeric(a.detail.c); });
    var den = withConceive.length;
    var num = withConceive.filter(function (a) { return a.detail.c < 0; }).length;
    var ratio = den ? num / den : 0;
    var tier = 'none';
    if (den > 0) {
      if (ratio >= ML.CONFIG.balanceHeavy) tier = 'heavy';
      else if (ratio <= ML.CONFIG.balanceLight) tier = 'light';
      else tier = 'mixed';
    }
    return { num: num, den: den, ratio: ratio, tier: tier };
  }

  return {
    numeric: numeric, detailAverage: detailAverage, widestStage: widestStage, verdictFor: verdictFor,
    analyzeCategory: analyzeCategory, allAnalyzed: allAnalyzed, topSurprises: topSurprises,
    thankYouList: thankYouList, bestGuesses: bestGuesses, balanceCheck: balanceCheck
  };
})();
