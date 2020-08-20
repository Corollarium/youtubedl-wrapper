const path = require("path");
const fsExtra = require("fs-extra");
const youtubedl = require("../src/index");

describe("Download", () => {
  beforeEach(() => {
    fsExtra.emptyDirSync(path.join(__dirname, "data"));
  });

  test("download youtube", async () => {
    const y = new youtubedl.Youtubedl();
    const video = "https://www.youtube.com/watch?v=90AiXO1pAiA";
    const download = await y.download(video, path.join(__dirname, "data"), [
      "-f",
      "best"
    ]);
    return expect(
      new Promise((resolve, reject) => {
        download.on("download", data => {
          if (data.progress === "100.0") {
            expect(data.progress).toBe("100.0");
            expect(data.speed).not.toBeNull();
            expect(data.speedUnit).not.toBeNull();
            expect(data.downloaded).not.toBeNull();
            expect(data.downloadedUnit).not.toBeNull();
            expect(data.ETA).toBe("00:00");
          }
        });
        download.on("end", data => {
          if (!data.status) {
            reject(data);
          } else {
            expect(data.filename).toMatch(/lol-90AiXO1pAiA.mp4$/);
            resolve(true);
          }
        });
      })
    ).resolves.toBe(true);
  });

  /* TODO: breaks on travis, perhaps vimeo blocks is there
  test("download vimeo", async () => {
    const y = new youtubedl.Youtubedl();
    const video = "https://vimeo.com/56282283";
    const download = await y.download(video, path.join(__dirname, "data"), [
      "-f",
      "best"
    ]);
    return expect(
      new Promise((resolve, reject) => {
        download.on("download", data => {
          if (data.progress === "100.0") {
            expect(data.progress).toBe("100.0");
            expect(data.speed).not.toBeNull();
            expect(data.speedUnit).not.toBeNull();
            expect(data.downloaded).not.toBeNull();
            expect(data.downloadedUnit).not.toBeNull();
            expect(data.ETA).toBe("00:00");
          }
        });
        download.on("end", data => {
          if (!data.status) {
            reject(data);
          } else {
            expect(data.filename).toMatch(/Public Test Video-56282283.mp4$/);
            resolve(true);
          }
        });
      })
    ).resolves.toBe(true);
  }); */
});
