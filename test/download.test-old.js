'use strict'

const DownloadYTAudio = require('../lib/download-audio')
const fue = require('file-utils-easy')
const path = require('path')

const OUT_DIR = 'test/out'
const TEST_PLAYLIST = {
  singleSong: { id: 'ZIyyj2FrVI0', length: 1 },
  twoSongs: { id: 'PLAv2aQ9JgGbVcUtDpuiTB9WgaMljCUpa_', length: 2 },
  twoSongsDuplicated: { id: 'PLAv2aQ9JgGbVEzvdzyoigNgnJcvOtMmU0', length: 2 },
  hundredSongs: { id: 'PLzCxunOM5WFKZuBXTe8EobD6Dwi4qV-kO', length: 100 }
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

  async function downloadPlaylist (testPlaylist) {
    let startEvents = 0
    let progressEvents = 0
    let completeEvents = 0
    let errorEvents = 0

    downloader.on('start', () => startEvents++)
    downloader.on('progress', () => progressEvents++)
    downloader.on('complete', () => completeEvents++)
    downloader.on('error', () => errorEvents++)

    const result = await downloader.downloadPlaylist(testPlaylist.id)

    expect(result).toHaveLength(testPlaylist.length)
    expect(startEvents).toEqual(testPlaylist.length)
    expect(completeEvents + errorEvents).toEqual(testPlaylist.length)
    expect(progressEvents).toBeGreaterThanOrEqual(1) // high speed network, less progress event

    result.forEach((song) => {
      expect(song.id).toBeDefined()
      expect(song.fileName || song.error).toBeDefined()
      expect(song.ref).toBeDefined()
      if (song.path) {
        expect(song.path).toEqual(OUT_DIR)
      }
    })
  }

  it('download small playlist', () => downloadPlaylist(TEST_PLAYLIST.twoSongs), 120000)

  // TODO: should mock in order to don't download "the world"
  it.skip('download huge playlist', () => downloadPlaylist(TEST_PLAYLIST.hundredSongs), 1800000)

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
  }, 10000)

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

    const mockCustomFilename = jest.fn((title) => {
      return 'overwrite.mp3'
    })

    downloader.overwriteExistingFiles = false
    downloader.fileNameGenerator = mockCustomFilename
    const result = await downloader.download(TEST_PLAYLIST.singleSong.id)

    let overwriteError
    try {
      await downloader.download(TEST_PLAYLIST.singleSong.id)
    } catch (error) {
      overwriteError = error
    }
    expect(overwriteError).toBeDefined()
    expect(mockCustomFilename).toHaveBeenCalledTimes(2)
    expect(result).toMatchObject({ fileName: mockCustomFilename(), id: TEST_PLAYLIST.singleSong.id, path: OUT_DIR, result: 'conversionFileComplete' })
    expect(startEvents).toEqual(TEST_PLAYLIST.singleSong.length)
    expect(completeEvents).toEqual(TEST_PLAYLIST.singleSong.length)
    expect(errorEvents).toEqual(1)
    expect(progressEvents).toBeGreaterThanOrEqual(1) // high speed network, less progress event
  }, 120000)

  it('download playlist with errors', async () => {
    let startEvents = 0
    let progressEvents = 0
    let completeEvents = 0
    let errorEvents = 0

    downloader.on('start', () => startEvents++)
    downloader.on('progress', () => progressEvents++)
    downloader.on('complete', () => completeEvents++)
    downloader.on('error', () => errorEvents++)

    const mockCustomFilename = jest.fn(() => 'error-test.mp3')
    downloader.overwriteExistingFiles = false
    downloader.fileNameGenerator = mockCustomFilename
    await fue.writeToFile('', path.join(OUT_DIR, 'error-test.mp3'))
    const result = await downloader.downloadPlaylist(TEST_PLAYLIST.twoSongsDuplicated.id)

    expect(result).toHaveLength(TEST_PLAYLIST.twoSongsDuplicated.length)
    expect(startEvents).toEqual(0)
    expect(completeEvents).toEqual(0)
    expect(errorEvents).toEqual(2)
    expect(result.find((song) => song.error !== undefined)).toBeDefined()
  }, 120000)

  it('ffmpeg error', async () => {
    process.env.PATH = ``
    let errorEvents = 0
    downloader.on('error', (errorEvent) => {
      errorEvents++
      expect(errorEvent.result).toBeDefined()
    })

    let conversionError
    try {
      await downloader.download(TEST_PLAYLIST.singleSong.id)
    } catch (error) {
      conversionError = error
    }
    expect(errorEvents).toEqual(1)
    expect(conversionError).toBeDefined()
    expect(conversionError.result).toEqual('internalServerErrorOnProcessingVideo.')
  }, 15000)
})
