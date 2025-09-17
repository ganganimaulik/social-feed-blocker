chrome.runtime.onInstalled.addListener(function (details) {
  chrome.storage.local.clear()
  chrome.storage.local.set({
    config: [],
  });

  // Call initConfig when the extension is installed.
  initConfig();
});

// redirect to subscriptions page for youtube, but only if enabled in config
chrome.webNavigation.onCompleted.addListener(function (details) {
  if (details.url === "https://www.youtube.com/" ||
    details.url === "https://youtube.com/") {

    // Check if redirection is enabled in the config
    chrome.storage.local.get("config", ({ config }) => {
      if (!config) return;

      const youtubeConfig = config.find(site => site.domain === "youtube.com");
      if (!youtubeConfig) return;

      const redirectConfig = youtubeConfig.selectors.find(s => s.name === "redirect home to subscriptions");
      if (redirectConfig && redirectConfig.selected) {
        // Only redirect if the option is enabled
        chrome.tabs.update(details.tabId, {
          url: "https://www.youtube.com/feed/subscriptions"
        });
      }
    });
  }
}, {
  url: [{
    hostContains: "youtube.com",
    pathEquals: "/"
  }]
});


const devLocalConfigTxt = true; // set to true for local config.txt file

function initConfig() {
  chrome.storage.local.get((store) => {
    // Get the latest config from the server.
    fetch(
      devLocalConfigTxt
        ? `./config.txt`
        : `https://raw.githubusercontent.com/ganganimaulik/social-feed-blocker/master/config.txt`
    )
      .then((res) => res.text())
      .then((res) => {
        let config = JSON.parse(res);

        console.log("store.config", store.config);
        // match store.config with config and update new config selected values
        if (store.config) {
          config = config.map((c) => {
            const storeConfig = store.config.find((sc) => sc.name == c.name);
            if (storeConfig) {
              const selectors = c.selectors.map((s) => {
                const storeSelector = storeConfig.selectors.find(
                  (ss) => ss.name == s.name
                );
                if (storeSelector) {
                  return {
                    ...s,
                    selected: storeSelector.selected,
                  };
                }
                return {
                  ...s,
                  selected: !(s?.default === false),
                };
              });
              c.selected = storeConfig.selected;
              return {
                ...c,
                selectors,
              };
            }
            c.selected = true;
            c.selectors = c.selectors.map((s) => {
              return {
                ...s,
                selected: true,
              };
            });
            return c;
          });
        }
        console.log("config", config);
        // Store the latest config in the local storage.
        chrome.storage.local.set({ config }, () => { });
      })
      .catch((err) => console.log(err));
  });
  // Call initConfig every 24 hours.
  setTimeout(initConfig, 24 * 3600 * 100);
}

// Call initConfig when the extension is reloaded.
initConfig();


// Check pause timer status every second
setInterval(() => {
  chrome.storage.local.get(["pausedTill", "config"], (data) => {
    const { pausedTill, config } = data;

    if (!pausedTill || !config) return;

    const pausedTillTimestamp = parseInt(pausedTill);
    const currentTime = new Date().getTime();

    // Check if timer just expired (within the last second)
    if (pausedTillTimestamp > 0 &&
      pausedTillTimestamp <= currentTime &&
      pausedTillTimestamp > currentTime - 1000) {
      // console.log("Timer expired in background script, reloading matching tabs");

      // // Find all tabs that match domains in the config
      // chrome.tabs.query({}, (tabs) => {
      //   tabs.forEach(tab => {
      //     try {
      //       if (!tab.url) return;
      //       const tabUrl = new URL(tab.url);

      //       // Check if the tab URL matches any domain in config
      //       const matchingConfig = config.find(site =>
      //         tabUrl.hostname.includes(site.domain));

      //       if (matchingConfig) {
      //         chrome.tabs.reload(tab.id);
      //       }
      //     } catch (e) {
      //       console.error("Error processing tab:", e);
      //     }
      //   });
      // });
    }
  });
}, 1000);
