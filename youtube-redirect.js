// Check if the redirect configuration is enabled
let redirectEnabled = false;

chrome.storage.local.get("config", ({ config }) => {
    if (!config) return;

    const youtubeConfig = config.find(site => site.domain === "youtube.com");
    if (!youtubeConfig) return;

    const redirectConfig = youtubeConfig.selectors.find(s => s.name === "redirect home to subscriptions");
    if (redirectConfig && redirectConfig.selected) {
        redirectEnabled = true;
        initializeRedirect();
    }
});

function initializeRedirect() {
    // Track the current URL
    let lastUrl = location.href;

    // Function to handle URL changes
    function handleUrlChange() {
        // Only redirect if feature is enabled
        if (redirectEnabled && (location.pathname === "/" || location.pathname === "")) {
            window.location.href = "https://www.youtube.com/feed/subscriptions";
        }

        // Update the last URL
        lastUrl = location.href;
    }

    // Intercept YouTube's History API usage (SPA navigation)
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

    // Handle home button clicks more efficiently
    function handleHomeButtonClicks() {
        // Target the home button elements
        document.body.addEventListener('click', function (e) {
            // Only intercept if feature is enabled
            if (!redirectEnabled) return;

            // Check if the clicked element or its parent is the home button
            const clickedElement = e.target.closest('a[href="/"]');
            if (clickedElement) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = "https://www.youtube.com/feed/subscriptions";
            }
        }, true);
    }

    // Run once DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleHomeButtonClicks);
    } else {
        handleHomeButtonClicks();
    }
}
