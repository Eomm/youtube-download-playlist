'use strict';

const EventEmitter = require('events').EventEmitter;
const horizon = require('horizon-youtube-mp3');
const fue = require('file-utils-easy');
const ytpl = require('ytpl');
const path = require('path');

const YOUTUBE_URL = 'http://youtube.com/watch?v=';


class DownloadYTFile extends EventEmitter {
  constructor(config = {}) {
    super();
    this.downloadPath = config.outputPath || path.join(__dirname);
    // this.override = config.override || true;
  }

  download(id, fileName = null) {
    return new Promise((resolve, reject) => {

      // videoURL:String,
      // directory:String,
      // optionalName?:String,
      // cropParams?:Object,
      // maxTimeAllowed?:Number,
      // callback?:Function,
      // onProgress?:Function


      // const cropParams = { start: '02:15', end: '02:20' };

      horizon.downloadToLocal(`${YOUTUBE_URL}${id}`,
        this.downloadPath, fileName, null, null,
        (err, result) => {
          const info = { id, fileName };
          this.emit('complete', info);

          if (err) {
            return reject(err);
          }
          resolve(result);
        },
        (percent, timemark, targetSize) => {
          const info = {
            id, fileName, percent, timemark, targetSize
          };
          this.emit('progress', info);
        });
    });
  }

  async downloadPlaylist(playlistId) {
    const playlistoInfo = await this.playlistInfo(playlistId);

    const sequentialDownload = async (array) => {
      for (let i = 0; i < array.length; i++) {
        const song = array[i];
        try {
          try {
            // TODO check override setting
            await fue.existFile(`${song.title}.mp3`);
          } catch (error) {
            await this.download(song.id, song.title.substr(0, 3));
            console.log('Downloaded', song.id);
          }
        } catch (error) {
          console.log('Error downloading', song.title, error);
        }
      }
    };

    await sequentialDownload(playlistoInfo.items);
    return true;
  }

  playlistInfo(playlistId) {
    return new Promise((resolve, reject) => {
      ytpl(playlistId, (err, playlist) => {
        if (err) {
          return reject(err);
        }
        resolve(playlist);
      });
    });
  }
}

module.exports = DownloadYTFile;
