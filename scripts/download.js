/* eslint-disable no-console */
const downloader = require("../src/downloader");

(async () => {
  try {
    await downloader(process.argv[2], true);
    console.log("Downloaded");
  } catch (err) {
    console.error("Download error: ", err);
  }
})();
