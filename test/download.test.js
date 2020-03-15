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

t.test('get video info error', async t => {
  try {
    const downloader = new DownloadYTAudio({ outputPath: OUT_DIR })
    await downloader.getVideoInfo('abcdefg8761')
    t.fail('shold now succede')
  } catch (err) {
    t.ok(err)
    t.like(err.message, 'This video is unavailable')
  }
})

t.test('get playlist info', async t => {
  const downloader = new DownloadYTAudio({ outputPath: OUT_DIR })
  const info = await downloader.getPlaylistInfo(TEST_PLAYLIST.hundredSongs.id)

  t.equals(info.id, TEST_PLAYLIST.hundredSongs.id)
  t.equals(info.items.length, TEST_PLAYLIST.hundredSongs.length)
  info.items.forEach((i) => {
    t.ok(i.id)
    t.ok(i.title)
  })
})

t.test('get playlist info error', async t => {
  try {
    const downloader = new DownloadYTAudio({ outputPath: OUT_DIR })
    await downloader.getPlaylistInfo('abcdefg8761')
    t.fail('shold now succede')
  } catch (err) {
    t.ok(err)
    t.like(err.message, 'Unable to find a id in abcdefg8761')
  }
})

t.test('download single song', async t => {
  let startEvents = 0
  let progressEvents = 0
  let completeEvents = 0
  let errorEvents = 0

  const downloader = new DownloadYTAudio({ outputPath: OUT_DIR })
  downloader.on('start', () => startEvents++)
  downloader.on('progress', () => progressEvents++)
  downloader.on('complete', () => completeEvents++)
  downloader.on('error', () => errorEvents++)

  const result = await downloader.download(TEST_PLAYLIST.singleSong.id)

  t.like(result, { id: TEST_PLAYLIST.singleSong.id, path: OUT_DIR, result: 'conversionFileComplete' })
  t.equals(result.fileName, `${result.ref.title}.mp3`)
  t.equals(startEvents, TEST_PLAYLIST.singleSong.length)
  t.equals(completeEvents, TEST_PLAYLIST.singleSong.length)
  t.ok(progressEvents >= TEST_PLAYLIST.singleSong.length)
  t.equals(errorEvents, 0)
})
