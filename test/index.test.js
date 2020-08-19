const youtubedl = require("../src/index");

test("getVersion", async () => {
  const y = new youtubedl.Youtubedl();
  const version = await y.getVersion();
  expect(version).toMatch(/\d{4}\.\d\d\.\d\d(\.\d)?/);
});

test("getExtractors", async () => {
  const y = new youtubedl.Youtubedl();
  const extractors = await y.getExtractors();
  expect(extractors).toContain("youtube");
});
