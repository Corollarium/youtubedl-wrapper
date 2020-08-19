const youtubedl = require("../src/index");

describe("Download", () => {
  beforeEach(() => {
    //
  });

  test("download youtube", async () => {
    const y = new youtubedl.Youtubedl();
    const video = "https://www.youtube.com/watch?v=90AiXO1pAiA";
    const download = await y.download(video, ["-f", "best"]);
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
            reject();
          } else {
            resolve(true);
          }
        });
      })
    ).resolves.toBe(true);
  });
});
