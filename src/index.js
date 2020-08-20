const fs = require("fs");
const { spawn } = require("child_process");
const readline = require("readline");
const EventEmitter = require("events");
const got = require("got");
const stream = require("stream");
const { promisify } = require("util");

class YoutubedlEmitter extends EventEmitter {}

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
      args.push("-o");
      args.push(`${directory}/%(title)s-%(id)s.%(ext)s`);
    }

    if (url) {
      args.unshift(url);
    }
    const y = spawn(this.binary, args);

    function parseLine(line) {
      if (line.indexOf("[download]") >= 0) {
        const regex = /\[download\]\s+(?<progress>[0-9.]+)%\s+of\s+~?(?<downloaded>[0-9.]+)(?<downloadedUnit>[a-zA-Z]+)\s+at\s+(?<speed>[0-9\.%]+)(?<speedUnit>[a-zA-Z\/]+)\s+ETA\s+(?<ETA>[0-9:]+)/;
        const match = regex.exec(line);
        if (match) {
          yemit.emit("download", { ...match.groups });
        } else {
          console.log(line);
          const f = /\[download\]\s+Destination:\s+(?<filename>.*)/.exec(line);
          if (f) {
            filename = f.groups.filename;
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

    y.stderr.on("data", function stderr(data) {
      // ?
    });

    y.on("close", code => {
      yemit.emit("end", { code, status: code === 0, filename });
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

  async subtitles(url) {
    // TODO
  }

  /**
   * Fetches a video thumbnail
   *
   * @param {string} url The video url
   * @param {string} filename The local filename to save the thumbnail
   */
  async thumbnail(url, filename) {
    let thumbnailURL = null;
    return new Promise((resolve, reject) => {
      const y = spawn(this.binary, [url, "--get-thumbnail"]);

      const rl = readline.createInterface({ input: y.stdout });
      rl.on("line", function stdout(line) {
        thumbnailURL = line;
      });

      y.on("exit", code => {
        if (code) {
          reject(code);
          return;
        }
        const pipeline = promisify(stream.pipeline);
        pipeline(
          got.stream(thumbnailURL),
          fs.createWriteStream(filename, { mode: 493 })
        ).then(resolve);
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
}

exports.Youtubedl = Youtubedl;
