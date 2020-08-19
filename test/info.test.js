const fs = require("fs");
const path = require("path");
const youtubedl = require("../src/index");

describe("Info", () => {
  test("info youtube", async () => {
    const y = new youtubedl.Youtubedl();
    const video = "https://www.youtube.com/watch?v=90AiXO1pAiA";
    const data = await y.info(video);
    expect(data.id).toBe("90AiXO1pAiA")
    expect(data.extractor).toBe("youtube");
  });
});
