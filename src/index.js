const { spawn } = require("child_process");
const readline = require("readline");
const EventEmitter = require("events");

class YoutubedlEmitter extends EventEmitter {}

function parseLine(line, yemit) {
  if (line.indexOf("[download]") >= 0) {
    const regex = /\[download\]\s+(?<progress>[0-9\.]+)%\s+of\s+(?<downloaded>[0-9\.]+)(?<downloadedUnit>[a-zA-Z]+)\s+at\s+(?<speed>[0-9\.%]+)(?<speedUnit>[a-zA-Z\/]+)\s+ETA\s+(?<ETA>[0-9:]+)/;
    const match = regex.exec(line);
    if (match) {
      yemit.emit("download", { ...match.groups });
    }
  } else if (line.indexOf("[ffmpeg]") >= 0) {
    const progress = 0; // TODO
    yemit.emit("convert", { progress });
  }
}

class Youtubedl {
  constructor(binary = null) {
    this.binary = binary || `${__dirname}/../bin/youtube-dl`;
  }

  run(url, args = []) {
    const yemit = new YoutubedlEmitter();

    args.unshift("--newline");
    if (url) {
      args.unshift(url);
    }
    const y = spawn(this.binary, args);

    const rl = readline.createInterface({ input: y.stdout });
    rl.on("line", function stdout(line) {
      parseLine(line, yemit);
    });

    y.stderr.on("data", function stderr(data) {
      console.log(`stderr: ${data.toString()}`);
    });

    y.on("close", code => {
      console.log(`child process exited with code ${code.toString()}`);
      yemit.emit("end", { code, status: code === 0 });
    });
    return yemit;
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

  async download(url, args = []) {
    return this.run(url, args);
  }

  /**
   * @returns {Promise}
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
   *
   * @param {string} url
   * @param {*} options
   */
  async getInfo(url, options) {
    const args = options;
    return this.run(url, args);
  }

  async getSubs(url, options) {
    const args = options;
    return this.run(url, args);
  }

  async getThumbs(url, options) {
    const args = options;
    return this.run(url, args);
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
