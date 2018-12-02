'use strict'

const { EventEmitter } = require('events')
const horizon = require('horizon-youtube-mp3')
const fue = require('file-utils-easy')
const ytpl = require('ytpl')
const path = require('path')

const YOUTUBE_URL = 'http://youtube.com/watch?v='

class DownloadYTFile extends EventEmitter {
  constructor (config = {}) {
    super()
    this.downloadPath = config.outputPath || path.join(__dirname)
    this.overwrite = config.overwrite || true
    this.nameGenerator = config.fileNameGenerator || (title => title) // TODO clean bad char for filesystem
  }

  set overwriteExistingFiles (overwrite) {
    this.overwrite = overwrite
  }

  download (id, fileName = null) {
    return new Promise((resolve, reject) => {
      // videoURL:String,
      // directory:String,
      // optionalName?:String,
      // cropParams?:Object,
      // maxTimeAllowed?:Number,
      // callback?:Function,
      // onProgress?:Function

      // const cropParams = { start: '02:15', end: '02:20' };

      // Get video id details (if needed)
      let reference

      const resolveFileName = () => {
        return new Promise((resolve, reject) => {
          if (fileName === null) {
            this.videoInfo(id)
              .then((songInfo) => {
                reference = songInfo
                resolve(path.join(this.downloadPath, `${this.nameGenerator(songInfo.title)}.mp3`))
              })
              .catch(reject)
          }
          resolve(path.join(this.downloadPath, fileName))
        })
      }

      resolveFileName()
        .then((savePath) => {
          return fue.existFile(savePath)
            .catch(() => { /** the file doesn't exists, all is fine */ })
            .then((filePath) => {
              if (filePath && this.overwrite !== true) {
                throw new Error(`The file ${savePath} already exists`)
              }
            })
        })
        .then(() => {
          const info = { id, fileName, path: this.downloadPath, ref: reference }
          this.emit('start', info)

          horizon.downloadToLocal(`${YOUTUBE_URL}${id}`,
            this.downloadPath, fileName, null, null,
            (err, result) => {
              info.result = result
              this.emit('complete', info)

              if (err) {
                reject(err)
                return
              }
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

  async downloadPlaylist (playlistId) {
    const playlistInfo = await this.playlistInfo(playlistId)

    // TODO limit the parallel download and conversion
    const downloadingSongs = playlistInfo.items.map(async (song) => {
      try {
        const songFileName = `${this.nameGenerator(song.title)}.mp3`
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
    })

    return Promise.all(downloadingSongs)
  }

  playlistInfo (playlistId) {
    return new Promise((resolve, reject) => {
      ytpl(playlistId, (err, playlist) => {
        if (err) {
          return reject(err)
        }
        resolve(playlist)
      })
    })
  }

  videoInfo (videoId) {
    return new Promise((resolve, reject) => {
      horizon.getInfo(`${YOUTUBE_URL}${videoId}`, function (err, info) {
        if (err) {
          reject(err)
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

module.exports = DownloadYTFile
