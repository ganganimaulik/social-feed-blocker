// remove the feed for the specified website
function removeFeed(website) {
  if (!document.querySelector("body"))
    return setTimeout(() => removeFeed(website), 1000);

  if (document.querySelector("#feed-blocker")) {
    return;
  }
  const styleEl = document.createElement("style");
  styleEl.id = "feed-blocker";
  const selectors = website.selectors
    .filter((s) => s.selected)
    .map((s) => s.selector);

  if (!selectors.length) return;

  if (["linkedin", "twitter"].includes(website.name)) {
    styleEl.innerHTML = `${selectors} { visibility:hidden!important; }`;
  } else {
    styleEl.innerHTML = `${selectors} { display: none !important; }`;
  }

  document.head.appendChild(styleEl);
}

// get the website and remove feed
chrome.storage.local.get("config", ({ config }) => {
  // find config for the current website
  const website = config.find((website) =>
    website.domain.includes(
      document.location.hostname.replace(/^(www\.)/, "").replace(/^(m\.)/, "")
    )
  );
  if (website) {
  
    // Check if the stored timestamp is in the past or null
    chrome.storage.local.get("pausedTill", ({ pausedTill }) => {
      const currentTimestamp = new Date().getTime();

      if (pausedTill === null || pausedTill <= currentTimestamp) {
        // Social feed blocker is active
        removeFeed(website);
      } else {
        console.log("Social feed blocker is paused");
      }
    });
  }
});
