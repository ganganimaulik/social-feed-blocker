const fs = require("fs");

// create config
const config = [
  {
    domain: "facebook.com",
    selectors: [
      ".x1hc1fzr.x1unhpq9.x6o7n8i", // home page feed
      'div[role="feed"]', // gruops feed
      '[aria-label="Stories"]', //stories
      'div[aria-label="Reels tray"]', //reels
      ".x78zum5.x1q0g3np.xl56j7k.x1yztbdb.x1y1aw1k", // stories & reels
      "#watch_feed", // watch feed
      'div[aria-label="Videos on Facebook Watch"]', // watch feed
      "video", // video player of reels and watch
      'div[aria-label="Collection of Marketplace items"]', // marketplace
      'div[aria-label="Preview of a group"]', // groups
      'div[aria-label="Notifications"]', // notifications
    ],
    name: "facebook",
  },
  {
    domain: "twitter.com",
    selectors: ["*"],
    name: "twitter",
  },
  {
    domain: "instagram.com",
    selectors: [`main[role="main"]`],
    name: "instagram",
  },
  {
    domain: "reddit.com",
    selectors: ["*"],
    name: "reddit",
  },
  {
    domain: "youtube.com",
    selectors: [
      '#page-manager>:not(ytd-search, [page-subtype="channels"], [page-subtype="history"], [page-subtype="subscriptions"], [page-subtype="playlist"]) #contents', // home page feed
      "#chips", // home page category chips
      "#big-yoodle", // home page hero image
      "#shorts-container", // shorts
      "#comments", // comments
      `a[title="Originals"]`, // originals
      `a[title="YouTube Music"]`, // music
      "ytd-reel-shelf-renderer", // hide reels in search results
    ],
    name: "youtube",
  },
  {
    domain: "linkedin.com",
    selectors: ["*"],
    name: "linkedin",
  },
];
// stringify config and write to config.txt file
fs.writeFileSync("config.txt", JSON.stringify(config));
