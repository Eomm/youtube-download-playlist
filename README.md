# yt-dl-playlist

[![Coverage Status](https://coveralls.io/repos/github/Eomm/youtube-download-playlist/badge.svg?branch=master)](https://coveralls.io/github/Eomm/youtube-download-playlist?branch=master)
[![install size](https://packagephobia.now.sh/badge?p=yt-dl-playlist)](https://packagephobia.now.sh/result?p=yt-dl-playlist)

This module let you to programatic download the audio files of a video playlist on YouTube in MP3 format.
It exposes API to download also single audio.

The name of this module is due the npm policy, call it `youtube-download-playlist`.

⚠ You must use this module/cli respecting the [YouTube's Copyright Policies](https://www.youtube.com/intl/en/about/copyright/#support-and-troubleshooting).

## Usage

### CLI

The cli is very simple and quick-and-dirty:

```sh
# NPM Global
npm install yt-dl-playlist -g
yd ${id}[, command]

# NPX
npx yt-dl-playlist ${id}[, command]
```

| Command | Description |
| ------- | ----------- |
| `playlist` | Download the video on playlist id (Default)
| `video` | Download the video id
| `info-playlist` | Print playlist info
| `info-video` | Print video info

Ex:

```sh
# Download playlist
yd PLAv2aQ9JgGbVcUtDpuiTB9WgaMljCUpa_

# Download audio
yd 2bexTB7xq_U video

# View info video
yd 2bexTB7xq_U info-video
```


#### FFMPEG

This program needs [`ffmpeg`](https://www.ffmpeg.org/download.html). It is a free program that elaborate
video and audio stream. It can be donwload also in the portable `zip` without installation!

**Windows**

To config the `ffmpeg` path you can run the script in a `cmd` shell like this:

```sh
PATH=$PATH:/ffmpeg/bin; yd ZIyyj2FrVI0 video
```

Or more simply run the `yd` command from the directory where ffmpeg is saved:

```sh
cd download/ffmpeg/bin
yd ZIyyj2FrVI0 video
```

**Linux**

You know what to do 👍


### Module

You can use this lib as a module also!

```js
const DownloadYTFile = require('yt-dl-playlist')

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

downloader.getPlaylistInfo(playlistId) : Promise<object>
downloader.getVideoInfo(videoId) : Promise<object>

```

## Test

```
npm test
```
