'use strict'

const { EventEmitter } = require('events')
const horizon = require('horizon-youtube-mp3')
const fue = require('file-utils-easy')
const ytpl = require('ytpl')
const path = require('path')

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
  download (id, inputFileName = null) {
    return new Promise((resolve, reject) => {
      let reference

      const resolveFileName = (fileName) => {
        return new Promise((resolve, reject) => {
          if (fileName === null) {
            // Get video id details (if needed)
            this.getVideoInfo(id)
              .then((songInfo) => {
                reference = songInfo
                resolve(this.nameGenerator(songInfo.title))
              })
              .catch(reject)
          } else {
            resolve(fileName)
          }
        })
      }

      resolveFileName(inputFileName)
        .then((fileName) => {
          const savePath = path.join(this.downloadPath, fileName)
          return fue.existFile(savePath)
            .catch(() => { /** the file doesn't exists, all is fine */ })
            .then((filePath) => {
              if (filePath && this.overwrite !== true) {
                this.emit('error', { id, fileName, path: this.downloadPath, result: 'already exists' })
                throw new Error(`The file ${savePath} already exists`)
              }
              return fileName
            })
        })
        .then((fileName) => {
          const info = { id, fileName, path: this.downloadPath, ref: reference }
          this.emit('start', info)

          horizon.downloadToLocal(`${YOUTUBE_URL}${id}`,
            this.downloadPath, fileName, null, null,
            (err, result) => {
              info.result = result
              if (err) {
                this.emit('error', info)
                reject(err)
                return
              }
              this.emit('complete', info)
              resolve(info)
            },
            (percent, timemark, targetSize) => {
              const update = { ...info, percent, timemark, targetSize }
              this.emit('progress', update)
            })
        })
        .catch(reject)
    })
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
    return new Promise((resolve, reject) => {
      ytpl(playlistId, (err, playlist) => {
        if (err) {
          return reject(err)
        }
        resolve(playlist)
      })
    })
  }

  getVideoInfo (videoId) {
    return new Promise((resolve, reject) => {
      horizon.getInfo(`${YOUTUBE_URL}${videoId}`, function (err, info) {
        if (err) {
          reject(new Error(err))
          return
        }

        resolve({
          id: videoId,
          url: info.videoFile,
          url_simple: `${YOUTUBE_URL}${videoId}`,
          title: info.videoName,
          thumbnail: info.videoThumb,
          duration: info.videoTime,
          author: null // TODO: need to improve/contribute to horizon lib
        })
      })
    })
  }
}

module.exports = DownloadYTAudio
