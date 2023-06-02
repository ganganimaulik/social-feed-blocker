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
      devLocalConfigTxt ? `./config.txt` : `https://raw.githubusercontent.com/ganganimaulik/social-feed-blocker/master/config.txt`
    )
      .then((res) => res.text())
      .then((res) => {
        console.log(res);
        const config = JSON.parse(res);
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
