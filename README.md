# youtubedl-wrapper

[![Build Status](https://travis-ci.com/Corollarium/youtubedl-wrapper.svg?branch=master)](https://travis-ci.com/Corollarium/youtubedl-wrapper)![NPM](https://img.shields.io/npm/l/@corollarium/youtubedl-wrapper)![node-current](https://img.shields.io/node/v/@corollarium/youtubedl-wrapper)![npm (scoped)](https://img.shields.io/npm/v/@corollarium/youtubedl-wrapper)

This is a NodeJS wrapper for [youtube-dl](http://rg3.github.com/youtube-dl/).

There's an alternative package [node-youtube-dl](https://github.com/przemyslawpluta/node-youtube-dl/). The main differences is that youtubedl-wrapper uses promises/async and downloads video through youtube-dl itself.

## Quickstart

Download video:

```js
const y = new youtubedl.Youtubedl();
const video = "https://www.youtube.com/watch?v=90AiXO1pAiA";
const download = await y.download(video, "mydirectory", ["-f", "best"]);

download.on("download", data => {
  console.log(
    `${data.progress}% downloaded, ETA ${data.ETA}, speed ${data.speed}${data.speedUnit}, downloaded bytes ${data.downloaded}${data.downloadedUnit}`
  );
});

download.on("end", data => {
  if (!data.status) {
    console.log("Download failed");
  } else {
    console.log("Data downloaded to: " + data.filename);
  }
});
```

Get the video information:

```js
const video = "https://www.youtube.com/watch?v=90AiXO1pAiA";
const data = await y.info(video);
```

Get a thumbnail:

```js
const video = "https://www.youtube.com/watch?v=90AiXO1pAiA";
const data = await y.thumbnail(video, path.join(__dirname, "thumbnail.jpg"));
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

- [Youtubedl](#youtubedl)
  - [Parameters](#parameters)
  - [setBinary](#setbinary)
    - [Parameters](#parameters-1)
  - [getBinary](#getbinary)
  - [download](#download)
    - [Parameters](#parameters-2)
  - [getVersion](#getversion)
  - [info](#info)
    - [Parameters](#parameters-3)
  - [thumbnail](#thumbnail)
    - [Parameters](#parameters-4)
  - [getExtractors](#getextractors)

### Youtubedl

The Youtubedl class

#### Parameters

- `binary` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The youtube-dl executable path. Defaults to {this package}/bin/youtube-dl (optional, default `null`)

#### setBinary

Set binary path for youtube-dl

##### Parameters

- `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The full binary file path

#### getBinary

Get binary path for youtube-dl

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The full binary file path

#### download

Downloads a video

##### Parameters

- `url` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
- `directory` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
- `args` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** Extra arguments for youtube-dl (optional, default `[]`)

Returns **Emitter** An Emitter object. Emits:- "download", {progress, speed, speedUnit, downloaded, downloadedUnit, ETA}

- "convert", {}
- "end" { status, code}

#### getVersion

Returns the current youtube-dl executable version

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** promise with the version

#### info

Gets video info

##### Parameters

- `url` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
- `options` **any**

#### thumbnail

Fetches a video thumbnail

##### Parameters

- `url` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The video url
- `filename` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The local filename to save the thumbnail

#### getExtractors

Gets the list of extractors

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)** with an array

## License

MIT
