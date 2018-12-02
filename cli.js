'use strict'

// run with:
// npm run cli PLAv2aQ9JgGbVcUtDpuiTB9WgaMljCUpa_
// NB: this is only a simple utility, use with caution

const DownloadYTFile = require('./lib/download-audio')

const id = process.argv[2]
const command = process.argv[3] || 'playlist'

const validCommand = new Map([
  ['playlist', 'downloadPlaylist'],
  ['video', 'download'],
  ['info-video', 'getVideoInfo'],
  ['info-playlist', 'getPlaylistInfo']
])

if (!validCommand.has(command)) {
  console.log(`The command ${command} is not valid, use one of: ${Array.from(validCommand.keys())}`)
  process.exit(-1)
}

console.log(`Executing ${command} - ${id}`)
const commandExecution = validCommand.get(command)

const downloader = new DownloadYTFile({ outputPath: __dirname })

downloader.on('start', console.log)
downloader.on('progress', (_) => console.log(_.percent))
downloader.on('error', console.log)

downloader[commandExecution](id)
  .then((res) => { console.log('Done', res) })
  .catch(console.log)
