chrome.runtime.onInstalled.addListener(function (details) {
  chrome.storage.local.clear()
  chrome.storage.local.set({
    config: [],
  });

  // Call initConfig when the extension is installed.
  initConfig();
});

// redirect to subscriptions page for youtube
chrome.webNavigation.onCompleted.addListener(function (details) {
  if (details.url === "https://www.youtube.com/" ||
    details.url === "https://youtube.com/") {
    chrome.tabs.update(details.tabId, {
      url: "https://www.youtube.com/feed/subscriptions"
    });
  }
}, {
  url: [{
    hostContains: "youtube.com",
    pathEquals: "/"
  }]
});


const devLocalConfigTxt = true;

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
                  selected: true,
                };
              });
              console.log("selectors", selectors);
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
