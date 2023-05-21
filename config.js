const fs = require("fs");
// create config
const config = [
  {
    domain: "facebook.com",
    selectors: [
      ".x1hc1fzr.x1unhpq9.x6o7n8i", // home page feed
      'div[role="feed"]', // gruops feed
      " .x9f619.x1n2onr6.x1ja2u2z.x2bj2ny.x1qpq9i9.xdney7k.xu5ydu1.xt3gfkd.xh8yej3.x6ikm8r.x10wlt62.xquyuld", //stories & reels
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
    selectors: ["*"],
    name: "instagram",
  },
  {
    domain: "reddit.com",
    selectors: ["*"],
    name: "reddit",
  },
  {
    domain: "youtube.com",
    selectors: ["*"],
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