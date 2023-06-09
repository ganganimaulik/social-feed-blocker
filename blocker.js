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

chrome.storage.local.get("config", ({ config }) => {
  console.log(config);

  // find config for the current website
  const website = config.find((website) =>
    website.domain.includes(
      document.location.hostname.replace(/^(www\.)/, "").replace(/^(m\.)/, "")
    )
  );
  console.log(website);
  if (website) {
    //todo: add a check to see if the website blocking is enabled
    removeFeed(website);
  }
});
