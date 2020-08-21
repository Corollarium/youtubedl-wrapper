const fs = require("fs");
const path = require("path");
const got = require("got");
const stream = require("stream");
const { promisify } = require("util");
const youtubedl = require("./index");

// function createPath(dir) {
//   if (!fs.existsSync(dir)) {
//     mkdirp.sync(dir);
//     if (binDir) mkdirp.sync(defaultBin);
//   }
//   filePath = path.join(dir, exec("youtube-dl"));
// }

/**
 * Downloads youtube-dl binary. If isOverwrite is true, the version is checked against the
 * current one to avoid downloading it again.
 *
 * @param {string} basePath The path to download file to
 * @param {boolean} isOverwrite If true overwrites an existing binary
 * @param {string} platform "linux" or "windows"
 * @returns {Promise<boolean>}
 */
async function downloader(basePath, isOverwrite = false, platform = "linux") {
  let filePath = basePath;
  let currentVersion = "xxx";

  const executable = `youtube-dl${platform === "windows" ? ".exe" : ""}`;

  // handle overwriting
  let exists = fs.existsSync(filePath);
  let lstat;
  if (exists) {
    lstat = fs.lstatSync(filePath);

    // diretory
    if (lstat.isDirectory()) {
      filePath = path.join(filePath, executable);
      lstat = fs.lstatSync(filePath);
      exists = fs.existsSync(filePath);
    }
  }
  if (exists) {
    if (!isOverwrite) {
      throw Error("File exists");
    }

    // check version
    const y = new youtubedl.Youtubedl(filePath);
    currentVersion = await y.getVersion();
  }

  const url =
    (process.env.YOUTUBE_DL_DOWNLOAD_HOST ||
      "https://yt-dl.org/downloads/latest/youtube-dl") +
    (platform === "windows" ? ".exe" : "");

  const res = await got.get(url, { followRedirect: false });
  if (res.statusCode !== 302) {
    throw new Error(
      `Did not get redirect for the latest version link. Status: ${res.statusCode}`
    );
  }

  const finalurl = res.headers.location;
  const newVersion = /yt-dl\.org\/downloads\/(\d{4}\.\d\d\.\d\d(\.\d)?)\/youtube-dl/.exec(
    finalurl
  )[1];

  // avoid downloading the same version
  if (newVersion === currentVersion) {
    return true;
  }
  // unlink if it exists
  if (exists) {
    fs.unlinkSync(filePath);
  }

  const pipeline = promisify(stream.pipeline);
  return pipeline(
    got.stream(url),
    fs.createWriteStream(filePath, { mode: 493 })
  );
}

module.exports = downloader;
