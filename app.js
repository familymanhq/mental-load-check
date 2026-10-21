window.ML = window.ML || {};

ML.App = (function () {
  var state = null;
  var root = null;

  function rerender() {
    ML.Screens.render(root, state);
    var h1 = root.querySelector('h1');
    if (h1) h1.setAttribute('tabindex', '-1');
    window.scrollTo(0, 0);
  }

  function persistAndRender() {
    ML.Store.saveState(state);
    rerender();
  }

  function update(mutator) {
    mutator(state);
    persistAndRender();
  }

  function go(screen, patch) {
    state.progress = Object.assign({}, state.progress, { screen: screen }, patch || {});
    persistAndRender();
  }

  function hardReset() {
    ML.Store.clearState();
    state = ML.Store.newState();
    persistAndRender();
  }

  function init() {
    root = document.getElementById('app');
    state = ML.Store.loadState();
    rerender();
  }

  return { init: init, update: update, go: go, hardReset: hardReset };
})();

document.addEventListener('DOMContentLoaded', ML.App.init);
