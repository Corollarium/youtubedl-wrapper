/* eslint-disable no-console */
const downloader = require("../src/downloader");

(async () => {
  try {
    await downloader(process.argv[2], true, process.argv[3] === "--windows");
    console.log("Downloaded");
  } catch (err) {
    console.error("Download error: ", err);
  }
})();
