chrome.runtime.onInstalled.addListener(function (details) {
  chrome.storage.local.set({
    config: [],
  });

  // Call initConfig when the extension is installed.
  initConfig();
});

const devLocalConfigTxt = false;

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
        console.log(res);
        let config = JSON.parse(res);

        // match store.config with config and update new config selected values
        if (store.config) {
          config = config.map((c) => {
            const storeConfig = store.config.find((s) => s.name == c.name);
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
                return s;
              });
              return {
                ...c,
                selectors,
              };
            }
            return c;
          });
        }

        // Store the latest config in the local storage.
        chrome.storage.local.set({ config }, () => {});
      })
      .catch((err) => console.log(err));
  });
  // Call initConfig every 24 hours.
  setTimeout(initConfig, 24 * 3600 * 100);
}

// Call initConfig when the extension is reloaded.
initConfig();
