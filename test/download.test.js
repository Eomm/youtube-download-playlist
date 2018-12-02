'use strict'

const DownloadYTAudio = require('../lib/download-audio')
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
    downloader = new DownloadYTAudio({ outputPath: OUT_DIR })
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
    let errorEvents = 0

    downloader.on('start', () => startEvents++)
    downloader.on('progress', () => progressEvents++)
    downloader.on('complete', () => completeEvents++)
    downloader.on('error', () => errorEvents++)

    const result = await downloader.downloadPlaylist(TEST_PLAYLIST.twoSongs.id)

    expect(result).toHaveLength(TEST_PLAYLIST.twoSongs.length)
    expect(startEvents).toEqual(TEST_PLAYLIST.twoSongs.length)
    expect(completeEvents).toEqual(TEST_PLAYLIST.twoSongs.length)
    expect(progressEvents).toBeGreaterThanOrEqual(1) // high speed network, less progress event
    expect(errorEvents).toEqual(0)

    result.forEach((song) => {
      expect(song.id).toBeDefined()
      expect(song.fileName).toBeDefined()
      expect(song.path).toEqual(OUT_DIR)
      expect(song.ref).toBeDefined()
    })
  }, 120000)

  it.skip('download huge playlist', async () => {
    // TODO implement
    expect(true).toEqual(false)
  })

  it('download single song', async () => {
    let startEvents = 0
    let progressEvents = 0
    let completeEvents = 0
    let errorEvents = 0

    downloader.on('start', () => startEvents++)
    downloader.on('progress', () => progressEvents++)
    downloader.on('complete', () => completeEvents++)
    downloader.on('error', () => errorEvents++)

    const result = await downloader.download(TEST_PLAYLIST.singleSong.id)

    expect(result).toMatchObject({ id: TEST_PLAYLIST.singleSong.id, path: OUT_DIR, result: 'conversionFileComplete' })
    expect(result.fileName).toMatch(`${result.ref.title}.mp3`)
    expect(startEvents).toEqual(TEST_PLAYLIST.singleSong.length)
    expect(completeEvents).toEqual(TEST_PLAYLIST.singleSong.length)
    expect(progressEvents).toBeGreaterThanOrEqual(TEST_PLAYLIST.singleSong.length)
    expect(errorEvents).toEqual(0)
  }, 120000)

  it('get video info', async () => {
    const info = await downloader.getVideoInfo(TEST_PLAYLIST.singleSong.id)
    const compareTo = { id: 'ZIyyj2FrVI0',
      url_simple: 'http://youtube.com/watch?v=ZIyyj2FrVI0',
      title: '[No Copyright Music] Cloudy - KODOMOi',
      duration: '3:24',
      author: null }
    expect(info).toMatchObject(compareTo)
    expect(info.url).toBeDefined()
    expect(info.thumbnail).toBeDefined()
  })

  it('get video info error', async () => {
    let error
    try {
      await downloader.getVideoInfo('error')
    } catch (err) {
      error = err
    }
    expect(error).toBeDefined()
  })

  it('get playlist info', async () => {
    const info = await downloader.getPlaylistInfo(TEST_PLAYLIST.hundredSongs.id)
    expect(info.id).toEqual(TEST_PLAYLIST.hundredSongs.id)
    expect(info.items).toHaveLength(TEST_PLAYLIST.hundredSongs.length)
    info.items.forEach((i) => {
      expect(i.id).toBeDefined()
      expect(i.title).toBeDefined()
    })
  })

  it('get playlist info error', async () => {
    let error
    try {
      await downloader.getPlaylistInfo('error')
    } catch (err) {
      error = err
    }
    expect(error).toBeDefined()
  })

  it('overwrite configuration', async () => {
    let startEvents = 0
    let progressEvents = 0
    let completeEvents = 0
    let errorEvents = 0

    downloader.on('start', () => startEvents++)
    downloader.on('progress', () => progressEvents++)
    downloader.on('complete', () => completeEvents++)
    downloader.on('error', () => errorEvents++)

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
    expect(errorEvents).toEqual(1)
    expect(progressEvents).toBeGreaterThanOrEqual(1) // high speed network, less progress event
  }, 120000)

  it.skip('ffmpeg controls', async () => {
    // TODO implement
    expect(true).toEqual(false)
  })
})
