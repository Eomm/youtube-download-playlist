'use strict'

// run with:
// npm run cli PLAv2aQ9JgGbVcUtDpuiTB9WgaMljCUpa_

const DownloadYTFile = require('./lib/download-audio')

const downloader = new DownloadYTFile()

downloader.on('progress', console.log)

const playlist = process.argv[2]
console.log(`Downloading ${playlist}`)
downloader.downloadPlaylist(playlist)
  .then((res) => { console.log('Done', res) })
  .catch(console.log)
