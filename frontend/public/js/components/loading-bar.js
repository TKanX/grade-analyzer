/**
 * @fileoverview Loading Bar Component
 * @description Loading bar component for displaying loading state.
 */

(function renderLoadingBar() {
  const LOADING_BAR_INITIAL_WIDTH = '0%';
  const LOADING_BAR_COMPLETE_WIDTH = '100%';
  const LOADING_BAR_DISPLAY_DELAY = 400;
  const LOADING_BAR_INITIAL_UPDATE = 10;
  const LOADING_BAR_MID_UPDATE = 50;

  const loadingBarContainer = document.createElement('div');
  loadingBarContainer.className = 'fixed top-0 left-0 w-full z-50 hidden';
  loadingBarContainer.innerHTML =
    '<div class="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-primary-300 to-primary-200 transition-all duration-300 ease-linear"></div>';
  document.body.appendChild(loadingBarContainer);

  const loadingBar = loadingBarContainer.querySelector('div');

  function startLoading() {
    loadingBarContainer.style.display = 'block';
    loadingBar.style.width = LOADING_BAR_INITIAL_WIDTH;
  }

  function updateLoading(value) {
    loadingBar.style.width = value + '%';
  }

  function endLoading() {
    loadingBar.style.width = LOADING_BAR_COMPLETE_WIDTH;
    setTimeout(() => {
      loadingBarContainer.style.display = 'none';
      loadingBar.style.width = LOADING_BAR_INITIAL_WIDTH;
    }, LOADING_BAR_DISPLAY_DELAY);
  }

  window.addEventListener('load', () => {
    endLoading();
  });

  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    startLoading();
    updateLoading(LOADING_BAR_INITIAL_UPDATE);
    try {
      const response = await originalFetch(...args);
      updateLoading(LOADING_BAR_MID_UPDATE);
      return response;
    } finally {
      endLoading();
    }
  };

  startLoading();
})();
