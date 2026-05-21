// Check if the redirect configuration is enabled
let redirectEnabled = false;

chrome.storage.local.get(["config", "pausedTill"], ({ config, pausedTill }) => {
  const currentTimestamp = new Date().getTime();
  if (pausedTill && pausedTill > currentTimestamp) {
    // Blocker is paused, do not redirect
    return;
  }

  if (!config) return;

  const twitterConfig = config.find(site => site.domain === "x.com");
  if (!twitterConfig) return;

  const redirectConfig = twitterConfig.selectors.find(s => s.name === "redirect home to following");
  if (redirectConfig && redirectConfig.selected) {
    redirectEnabled = true;
    initializeRedirect();
  }
});

function initializeRedirect() {
  let redirectInterval = null;
  let attempts = 0;
  const maxAttempts = 100; // Wait up to 10 seconds (100 * 100ms)

  function isHomePage() {
    const path = window.location.pathname;
    return path === "/" || path === "/home" || path === "";
  }

  function findFollowingTab() {
    const tabList = document.querySelector('[role="tablist"]');
    if (!tabList) return null;

    const tabs = tabList.querySelectorAll('[role="tab"]');
    if (tabs.length < 2) return null;

    // 1. Try to find by text content "Following" (case-insensitive, trimmed)
    for (const tab of tabs) {
      if (tab.textContent && tab.textContent.trim().toLowerCase() === 'following') {
        return tab;
      }
    }

    // 2. Fallback to index 1 (the second tab is always Following)
    return tabs[1];
  }

  function tryClickFollowingTab() {
    if (!redirectEnabled || !isHomePage()) {
      if (redirectInterval) {
        clearInterval(redirectInterval);
        redirectInterval = null;
      }
      return;
    }

    attempts++;
    if (attempts > maxAttempts) {
      if (redirectInterval) {
        clearInterval(redirectInterval);
        redirectInterval = null;
      }
      return;
    }

    const tab = findFollowingTab();
    if (tab) {
      // Clear the interval since we found the tab
      if (redirectInterval) {
        clearInterval(redirectInterval);
        redirectInterval = null;
      }

      const isSelected = tab.getAttribute('aria-selected') === 'true';
      if (!isSelected) {
        // Add a temporary style to hide the timeline feed during transition to prevent flicker
        const styleEl = document.createElement("style");
        styleEl.id = "x-following-redirect-transition";
        styleEl.innerHTML = 'div[aria-label="Timeline: Your Home Timeline"] { opacity: 0 !important; }';
        document.documentElement.appendChild(styleEl);

        // Click the Following tab
        tab.click();

        // Remove the style after a short delay so the feed shows up smoothly
        setTimeout(() => {
          if (styleEl.parentNode) {
            styleEl.parentNode.removeChild(styleEl);
          }
        }, 500);
      }
    }
  }

  function handleUrlChange() {
    if (!redirectEnabled) return;

    if (isHomePage()) {
      attempts = 0;
      if (!redirectInterval) {
        redirectInterval = setInterval(tryClickFollowingTab, 100);
      }
      // Run once immediately
      tryClickFollowingTab();
    } else {
      if (redirectInterval) {
        clearInterval(redirectInterval);
        redirectInterval = null;
      }
    }
  }

  // Intercept Twitter's History API usage (SPA navigation)
  const originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(this, arguments);
    handleUrlChange();
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    handleUrlChange();
  };

  // Handle popstate events (back/forward navigation)
  window.addEventListener('popstate', handleUrlChange);

  // Check on initial page load
  handleUrlChange();
}
