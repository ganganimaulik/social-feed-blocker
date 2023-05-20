function removeFeed(website) {
  if (!document.querySelector("body"))
    return setTimeout(() => removeFeed(website), 1000);

  if (document.querySelector("#feed-blocker")) {
    return;
  }
  const styleEl = document.createElement("style");
  styleEl.id = "feed-blocker";
  if (website.name == "twitter" || website.name == "linkedin") {
    styleEl.innerHTML = `${website.selectors} { visibility:hidden!important; }`;
  } else {
    styleEl.innerHTML = `${website.selectors} { display: none !important; }`;
  }

  document.head.appendChild(styleEl);
}

chrome.storage.local.get("config", ({ config }) => {
  // find config for the current website
  const website = config.find((website) =>
    website.domain.includes(
      document.location.hostname.replace("www.", "").replace("m.", "")
    )
  );
  console.log(website);
  if (website) {
    //todo: add a check to see if the website blocking is enabled
    removeFeed(website);
  }
});
