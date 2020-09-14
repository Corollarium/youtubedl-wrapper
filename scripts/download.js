/* eslint-disable no-console */
const { downloader } = require("../src");

(async () => {
  try {
    await downloader(
      process.argv[2],
      true,
      process.argv.includes("--windows") ? "windows" : "linux"
    );
    console.log("Downloaded");
  } catch (err) {
    console.error("Download error: ", err);
  }
})();
