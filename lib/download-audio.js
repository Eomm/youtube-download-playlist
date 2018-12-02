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
    this.nameGenerator = config.fileNameGenerator || (title => title.replace(/[\\/:*?"<>|]/g, ''))
  }

  set overwriteExistingFiles (overwrite) {
    this.overwrite = overwrite
  }

  download (id, inputFileName = null) {
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

      const resolveFileName = (fileName) => {
        return new Promise((resolve, reject) => {
          if (fileName === null) {
            this.getVideoInfo(id)
              .then((songInfo) => {
                reference = songInfo
                resolve(`${this.nameGenerator(songInfo.title)}.mp3`)
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

  async downloadPlaylist (playlistId) {
    const playlistInfo = await this.getPlaylistInfo(playlistId)

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
