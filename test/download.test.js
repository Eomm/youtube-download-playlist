'use strict'

const DownloadYTFile = require('../lib/download-audio')
const fue = require('file-utils-easy')

const OUT_DIR = 'test/out'
const TEST_PLAYLIST = {
  twoSongs: { id: 'PLAv2aQ9JgGbVcUtDpuiTB9WgaMljCUpa_', length: 2 },
  hundredSongs: { id: 'PLBweDmMi-NsOeiKfKKrtcNW1HNy2giuqY', length: 100 }
}

describe('Core lib', () => {
  beforeAll(() => fue.deleteDirectoryFiles(OUT_DIR))
  afterAll(() => fue.deleteDirectoryFiles(OUT_DIR))

  it('download small playlist', async () => {
    const downloader = new DownloadYTFile({ outputPath: OUT_DIR })

    let progressEvents = 0
    let completeEvents = 0
    downloader.on('progress', () => progressEvents++)
    downloader.on('complete', () => completeEvents++)

    const result = await downloader.downloadPlaylist(TEST_PLAYLIST.twoSongs.id)

    // TODO more check on output
    expect(result).toHaveLength(TEST_PLAYLIST.twoSongs.length)
    expect(completeEvents).toEqual(TEST_PLAYLIST.twoSongs.length)
    expect(progressEvents).toBeGreaterThanOrEqual(TEST_PLAYLIST.twoSongs.length)
  }, 120000)

  it('download huge playlist', async () => {
    // TODO implement
    expect(true).toEqual(false)
  })

  it('download single song', async () => {
    // TODO implement
    expect(true).toEqual(false)
  })

  it('get playlist info', async () => {
    // TODO implement
    expect(true).toEqual(false)
  })

  it('override parameter test', async () => {
    // TODO implement
    expect(true).toEqual(false)
  })

  it('ffmpeg controls', async () => {
    // TODO implement
    expect(true).toEqual(false)
  })
})
