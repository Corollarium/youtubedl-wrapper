const fs = require("fs");
const { spawn } = require("child_process");
const readline = require("readline");
const EventEmitter = require("events");
const got = require("got");
const stream = require("stream");
const { promisify } = require("util");
const downloader = require("./downloader");

class YoutubedlEmitter extends EventEmitter {
  // nothing
}

/**
 * The Youtubedl class
 * @param {string} binary The youtube-dl executable path. Defaults to {this package}/bin/youtube-dl
 */
class Youtubedl {
  constructor(binary = null) {
    this.binary = binary || `${__dirname}/../bin/youtube-dl`;
  }

  /**
   * Set binary path for youtube-dl
   *
   * @param {string} path The full binary file path
   */
  setBinary(path) {
    this.binary = path;
  }

  /**
   * Get binary path for youtube-dl
   *
   * @returns {string} The full binary file path
   */
  getBinary() {
    return this.binary;
  }

  /**
   * Downloads a video
   *
   * @param {string} url
   * @param {string} directory
   * @param {Array} args Extra arguments for youtube-dl
   * @returns {Emitter} An Emitter object. Emits:
   * - "download", {progress, speed, speedUnit, downloaded, downloadedUnit, ETA}
   * - "convert", {}
   * - "end" { status, code}
   */
  async download(url, directory, args = []) {
    const yemit = new YoutubedlEmitter();
    let filename = "";

    args.unshift("--newline");
    if (directory) {
      // TODO: check -o in args
      let i;
      for (i = 0; i < args.length; i++) {
        if (args[i] == '-o') {
          break;
        }
      }
      if (i === args.length) {
        args.push("-o");
        args.push(`${directory}/%(title)s-%(id)s.%(ext)s`);
      }
    }

    if (url) {
      args.unshift(url);
    }
    const y = spawn(this.binary, args);

    function parseLine(line) {
      if (line.indexOf("[download]") >= 0) {
        const regex = /\[download\]\s+(?<progress>[0-9.]+)%\s+of\s+~?(?<download>[0-9.]+)(?<downloadUnit>[a-zA-Z]+)\s+at\s+(?<speed>[0-9a-zA-Z.%]+)\s*(?<speedUnit>[a-zA-Z/]+)\s+ETA\s+(?<ETA>[0-9:]+)/;
        const match = regex.exec(line);
        if (match) {
          yemit.emit("download", { ...match.groups, filename });
        } else {
          // console.log(line);
          const f = /\[download\]\s+Destination:\s+(?<filename>.*)/.exec(line);
          if (f) {
            // eslint-disable-next-line prefer-destructuring
            filename = f.groups.filename;
            yemit.emit("filename", filename);
          }
        }
      } else if (line.indexOf("[ffmpeg]") >= 0) {
        const progress = 0; // TODO
        yemit.emit("convert", { progress });
      }
    }

    const rl = readline.createInterface({ input: y.stdout });
    rl.on("line", function stdout(line) {
      parseLine(line);
    });

    const errOutput = [];
    y.stderr.on("data", function stderr(data) {
      errOutput.push(data);
    });

    y.on("close", code => {
      yemit.emit("end", {
        code,
        status: code === 0,
        filename,
        stderr: errOutput.join("")
      });
    });
    return yemit;
  }

  /**
   * Returns the current youtube-dl executable version
   *
   * @returns {Promise<string>} promise with the version
   */
  async getVersion() {
    return new Promise((resolve, reject) => {
      const y = spawn(this.binary, ["--version"]);

      y.stdout.on("data", function stdout(data) {
        const line = data.toString().trim();
        resolve(line);
      });

      y.on("exit", code => {
        if (code) {
          reject(code);
        }
      });
    });
  }

  /**
   * Gets video info
   *
   * @param {string} url
   * @param {*} options
   */
  async info(url) {
    return new Promise((resolve, reject) => {
      const y = spawn(this.binary, [url, "--dump-json"]);
      const json = [];

      y.stdout.on("data", function stdout(data) {
        json.push(data.toString());
      });

      y.on("exit", code => {
        if (code) {
          reject(code);
          return;
        }
        resolve(JSON.parse(json.join("")));
      });
    });
  }

  // async subtitles(url) {
  //   // TODO
  // }

  /**
   * Fetches a video thumbnail
   *
   * @param {string} url The video url
   * @param {string} filename The local filename to save the thumbnail
   * @returns {Promise}
   */
  async thumbnail(url, filename) {
    let thumbnailURL = null;
    return new Promise((resolve, reject) => {
      const y = spawn(this.binary, [url, "--get-thumbnail"]);

      const rl = readline.createInterface({ input: y.stdout });
      rl.on("line", function stdout(line) {
        thumbnailURL = line;
      });

      const errOutput = [];
      y.stderr.on("data", function stderr(data) {
        errOutput.push(data);
      });

      y.on("exit", code => {
        if (code) {
          reject(code);
          return;
        }
        if (!thumbnailURL) {
          reject(errOutput.join());
        }
        const pipeline = promisify(stream.pipeline);
        pipeline(
          got.stream(thumbnailURL),
          fs.createWriteStream(filename, { mode: 493 })
        ).then(() => resolve(true));
      });
    });
  }

  /**
   * Gets the list of extractors
   *
   * @param
   * @returns {Promise} with an array
   */
  async getExtractors() {
    return new Promise((resolve, reject) => {
      const y = spawn(this.binary, ["--list-extractors"]);
      const extractors = [];

      const rl = readline.createInterface({ input: y.stdout });
      rl.on("line", function stdout(line) {
        extractors.push(line);
      });

      y.on("exit", code => {
        if (code) {
          reject(code);
        }
        resolve(extractors);
      });
    });
  }

  /**
   * Downloads youtube-dl binary. If isOverwrite is true, the version is checked against the
   * current one to avoid downloading it again.
   *
   * @param {string} basePath The path to download file to
   * @param {boolean} isOverwrite If true overwrites an existing binary
   * @param {string} platform "linux" or "windows"
   * @returns {Promise<boolean>}
   */
  static async binaryDownload(
    basePath,
    isOverwrite = false,
    platform = "linux"
  ) {
    return downloader(basePath, isOverwrite, platform);
  }
}

exports.Youtubedl = Youtubedl;
