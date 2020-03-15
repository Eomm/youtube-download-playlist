'use strict'

const { EventEmitter } = require('events')
const path = require('path')
const ytdl = require('ytdl-core') // single video
const ytpl = require('ytpl') // playlist
const ffmpeg = require('fluent-ffmpeg')

// const horizon = require('horizon-youtube-mp3')
// const fue = require('file-utils-easy')

const Rxfrom = require('rxjs').from
const { mergeMap, toArray } = require('rxjs/operators')

const YOUTUBE_URL = 'http://youtube.com/watch?v='

class DownloadYTAudio extends EventEmitter {
  constructor (config = {}) {
    super()
    this.downloadPath = config.outputPath || __dirname
    this.overwrite = config.overwrite || true
    this.nameGenerator = config.fileNameGenerator || (title => `${title.replace(/[\\/:*?"<>|]/g, '')}.mp3`)
    this.maxParallelDownload = config.maxParallelDownload || 10
  }

  set overwriteExistingFiles (overwrite) {
    this.overwrite = overwrite
  }

  /**
   * @param {function} generator the function must return a string, in input there will be the title of the video.
   * This will be called only if the file name of the output file is not set
   */
  set fileNameGenerator (generator) {
    this.nameGenerator = generator
  }

  /**
   *
   * @param {string} id the video from which to extrapolate the sound
   * @param {!string} fileName optinal filename output
   * @returns {Promise<object>} metadata of the mp3 file generated
   */
  download (videoId, inputFileName = null) {
    const url = `${YOUTUBE_URL}${videoId}`
    const videoStream = ytdl(url, {
      quality: 'highestaudio'
    })

    // TODO this.emit('error', { id, fileName, path: this.downloadPath, result: 'already exists' })
    const fileName = 'out.mp3'
    const filePath = path.join(this.downloadPath, fileName)

    const info = {
      id: videoId,
      fileName,
      path: this.downloadPath,
      filePath
      // ref: reference
    }

    let theResolve
    let theReject
    const thePromise = new Promise((resolve, reject) => {
      theResolve = resolve
      theReject = reject
    })

    ffmpeg.setFfmpegPath(path.join(__dirname, '../ffmpeg/bin')) // TODO
    const command = ffmpeg(videoStream)
      .format('mp3')
      .on('start', () => { this.emit('start', info) })
      .on('end', () => {
        this.emit('complete', info)
        if (theResolve) {
          theResolve(info)
          theReject = null
        }
      })
      .on('error', (err) => {
        this.emit('error', err, info)
        if (theReject) {
          theReject(err)
          theResolve = null
        }
      })

    command.on('progress', progress => {
      const update = { ...info, ...progress }
      this.emit('progress', update)
    })
    command.output(filePath)
    command.run()

    return thePromise
  }

  /**
   *
   * @param {string} playlistId the id of the playlist to extract the sounds
   * @returns {Promise<[object]>} the results of the downloading, will contains errors and success
   */
  async downloadPlaylist (playlistId) {
    const playlistInfo = await this.getPlaylistInfo(playlistId)

    const downloadingSongs = async (song) => {
      try {
        const songFileName = this.nameGenerator(song.title)
        const songFile = await this.download(song.id, songFileName)
        songFile.ref = song
        return songFile
      } catch (error) {
        const quiteError = {
          id: song.id,
          ref: song,
          error
        }
        return quiteError
      }
    }

    const videoObservable = Rxfrom(playlistInfo.items)

    return videoObservable
      .pipe(mergeMap(video => downloadingSongs(video), this.maxParallelDownload))
      .pipe(toArray())
      .toPromise()
  }

  getPlaylistInfo (playlistId) {
    return ytpl(playlistId)
  }

  async getVideoInfo (videoId) {
    const url = `${YOUTUBE_URL}${videoId}`
    const advData = await ytdl.getBasicInfo(url)
    return {
      id: advData.video_id,
      url: advData.video_url,
      title: advData.title,
      thumbnail: advData.player_response.videoDetails.thumbnail.thumbnails.reduce(getBigger),
      duration: +(advData.player_response.videoDetails.lengthSeconds),
      author: advData.author,
      raw: advData
    }
  }
}

module.exports = DownloadYTAudio

function getBigger (a, b) {
  return (a.width > b.width) ? a : b
}
