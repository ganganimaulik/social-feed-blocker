// Track the current URL
let lastUrl = location.href;

// Function to handle URL changes
function handleUrlChange() {
    // If we're on the home page, redirect to subscriptions
    if (location.pathname === "/" || location.pathname === "") {
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
        // Check if the clicked element or its parent is the home button
        const clickedElement = e.target.closest('a[title="Home"]');
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