'use strict'

const t = require('tap')

const DownloadYTAudio = require('../lib/download-audio')

const OUT_DIR = 'test/out'
const TEST_PLAYLIST = {
  singleSong: { id: 'ZIyyj2FrVI0', length: 1 },
  twoSongs: { id: 'PLAv2aQ9JgGbVcUtDpuiTB9WgaMljCUpa_', length: 2 },
  twoSongsDuplicated: { id: 'PLAv2aQ9JgGbVEzvdzyoigNgnJcvOtMmU0', length: 2 },
  hundredSongs: { id: 'PLzCxunOM5WFKZuBXTe8EobD6Dwi4qV-kO', length: 100 }
}

t.test('get video info', async t => {
  const downloader = new DownloadYTAudio({ outputPath: OUT_DIR })
  const info = await downloader.getVideoInfo(TEST_PLAYLIST.singleSong.id)
  const compareTo = {
    id: 'ZIyyj2FrVI0',
    title: 'Cloudy - KODOMOi [Vlog No Copyright Music]',
    duration: 204,
    author: {
      name: 'Audio Library — Music for content creators'
    }
  }
  t.like(info, compareTo)
  t.ok(info.url)
  t.ok(info.thumbnail)
  t.ok(info.raw)
})
