'use strict'

const DownloadYTFile = require('../lib/download-audio')
const fue = require('file-utils-easy')

const OUT_DIR = 'test/out'
const TEST_PLAYLIST = {
  singleSong: { id: 'ZIyyj2FrVI0', length: 1 },
  twoSongs: { id: 'PLAv2aQ9JgGbVcUtDpuiTB9WgaMljCUpa_', length: 2 },
  hundredSongs: { id: 'PLBweDmMi-NsOeiKfKKrtcNW1HNy2giuqY', length: 100 }
}

describe('Core lib', () => {
  let downloader

  beforeAll(() => {
    downloader = new DownloadYTFile({ outputPath: OUT_DIR })
    return fue.deleteDirectoryFiles(OUT_DIR)
  })
  afterAll(() => {
    downloader.removeAllListeners()
    return fue.deleteDirectoryFiles(OUT_DIR)
  })

  it('download small playlist', async () => {
    let startEvents = 0
    let progressEvents = 0
    let completeEvents = 0

    downloader.on('start', () => startEvents++)
    downloader.on('progress', () => progressEvents++)
    downloader.on('complete', () => completeEvents++)

    const result = await downloader.downloadPlaylist(TEST_PLAYLIST.twoSongs.id)

    // TODO more check on output
    expect(result).toHaveLength(TEST_PLAYLIST.twoSongs.length)
    expect(startEvents).toEqual(TEST_PLAYLIST.twoSongs.length)
    expect(completeEvents).toEqual(TEST_PLAYLIST.twoSongs.length)
    expect(progressEvents).toBeGreaterThanOrEqual(1) // high speed network, less progress event
  }, 120000)

  it('download huge playlist', async () => {
    // TODO implement
    expect(true).toEqual(false)
  })

  it('download single song', async () => {
    let startEvents = 0
    let progressEvents = 0
    let completeEvents = 0

    downloader.on('start', () => startEvents++)
    downloader.on('progress', () => progressEvents++)
    downloader.on('complete', () => completeEvents++)

    const customFilename = 'new-name.mp3'
    const result = await downloader.download(TEST_PLAYLIST.singleSong.id, customFilename)

    expect(result).toMatchObject({ fileName: customFilename, id: TEST_PLAYLIST.singleSong.id, path: OUT_DIR, result: 'conversionFileComplete' })
    expect(startEvents).toEqual(TEST_PLAYLIST.singleSong.length)
    expect(completeEvents).toEqual(TEST_PLAYLIST.singleSong.length)
    expect(progressEvents).toBeGreaterThanOrEqual(TEST_PLAYLIST.singleSong.length)
  }, 120000)

  it('get playlist info', async () => {
    // TODO implement
    expect(true).toEqual(false)
  })

  it('overwrite configuration', async () => {
    let startEvents = 0
    let progressEvents = 0
    let completeEvents = 0

    downloader.on('start', () => startEvents++)
    downloader.on('progress', () => progressEvents++)
    downloader.on('complete', () => completeEvents++)

    downloader.overwriteExistingFiles = false
    const customFilename = 'overwrite.mp3'
    const result = await downloader.download(TEST_PLAYLIST.singleSong.id, customFilename)

    let overwriteError
    try {
      await downloader.download(TEST_PLAYLIST.singleSong.id, customFilename)
    } catch (error) {
      overwriteError = error
    }
    expect(overwriteError).toBeDefined()

    expect(result).toMatchObject({ fileName: customFilename, id: TEST_PLAYLIST.singleSong.id, path: OUT_DIR, result: 'conversionFileComplete' })
    expect(startEvents).toEqual(TEST_PLAYLIST.singleSong.length)
    expect(completeEvents).toEqual(TEST_PLAYLIST.singleSong.length)
    expect(progressEvents).toBeGreaterThanOrEqual(1) // high speed network, less progress event
  }, 120000)

  it('ffmpeg controls', async () => {
    // TODO implement
    expect(true).toEqual(false)
  })
})
