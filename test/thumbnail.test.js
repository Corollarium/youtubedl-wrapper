const fs = require("fs");
const path = require("path");
const fsExtra = require('fs-extra');
const youtubedl = require("../src/index");

describe("Download", () => {
  beforeEach(() => {
    fsExtra.emptyDirSync(path.join(__dirname, "data"));
  });

  test("thumbnail youtube", async () => {
    const y = new youtubedl.Youtubedl();
    const video = "https://www.youtube.com/watch?v=90AiXO1pAiA";
    const f = path.join(__dirname, "data/youtube.jpg");
    await y.thumbnail(video, f);
    expect(fs.existsSync(f)).toBe(true);
  });
});
