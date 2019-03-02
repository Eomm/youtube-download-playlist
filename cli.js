#!/usr/bin/env node

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

console.log(`Executing [${command}] command on id: ${id}`)
const commandExecution = validCommand.get(command)

const downloader = new DownloadYTFile({ outputPath: process.cwd() })

downloader.on('start', (item) => console.log(`Starting download of ${item.fileName} in directory ${item.path}`))
downloader.on('progress', (item) => console.log(`Converting ${item.fileName} ${item.percent}`))
downloader.on('error', (item) => console.error(`Error converting ${item.fileName}`))

downloader[commandExecution](id)
  .then((res) => { console.log('Execution completed') })
  .catch((error) => {
    console.error('Fatal error', error.result || error)
  })
