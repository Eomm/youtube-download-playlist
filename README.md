# youtube-download-playlist

[![Coverage Status](https://coveralls.io/repos/github/Eomm/youtube-download-playlist/badge.svg?branch=master)](https://coveralls.io/github/Eomm/youtube-download-playlist?branch=master)

This module let you to programatic download the audio files of a video playlist on YouTube in MP3 format.
It exposes API to download also single audio.

## Usage

### CLI

```sh
node cli.js id[, command]
```

| Command | Description |
| ------- | ----------- |
| `playlist` | Download the video on playlist id (Default)
| `video` | Download the video id
| `info-playlist` | Print playlist info
| `info-video` | Print video info


#### Customize FFMPEG Path

To config the `ffmpeg` path you can run the script like this:

```sh
PATH=$PATH:/ffmpeg/bin; node cli ZIyyj2FrVI0 video
```


### Module

```js
const DownloadYTFile = require('youtube-download-playlist')

const downloader = new DownloadYTFile({ 
  outputPath: __dirname,
  overwrite,
  fileNameGenerator,
  maxParallelDownload,
})

downloader.on('start', (fileInfo) => startEvents++)
downloader.on('progress', (fileProgressInfo) => progressEvents++)
downloader.on('complete', (fileInfo) => completeEvents++)
downloader.on('error', (fileInfo) => errorEvents++)

downloader.download(id, inputFileName = null) : Promise
downloader.downloadPlaylist(playlistId) : Promise<Array>

downloader.getPlaylistInfo(id, inputFileName = null) : Promise
downloader.getVideoInfo(playlistId) : Promise

```

## Test

```
npm test
```


TODO: writing better standard docs.. ⏳
