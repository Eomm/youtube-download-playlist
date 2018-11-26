'use strict';

const { EventEmitter } = require('events');
const horizon = require('horizon-youtube-mp3');
const fue = require('file-utils-easy');
const ytpl = require('ytpl');
const path = require('path');

const YOUTUBE_URL = 'http://youtube.com/watch?v=';


class DownloadYTFile extends EventEmitter {
  constructor(config = {}) {
    super();
    this.downloadPath = config.outputPath || path.join(__dirname);
    this.override = config.override || true;
    this.nameGenerator = config.fileNameGenerator || (title => title.substr(0, 10));
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

      // TODO get video id details (if needed)

      horizon.downloadToLocal(`${YOUTUBE_URL}${id}`,
        this.downloadPath, fileName, null, null,
        (err, result) => {
          const info = { id, fileName, path: this.downloadPath, result };
          this.emit('complete', info);

          if (err) {
            return reject(err);
          }
          resolve(info);
        },
        (percent, timemark, targetSize) => {
          const info = {
            id, fileName, percent, timemark, targetSize,
          };
          this.emit('progress', info);
        });
    });
  }

  async downloadPlaylist(playlistId) {
    const playlistoInfo = await this.playlistInfo(playlistId);

    // TODO limit the parallel download and conversion
    const downloadingSongs = playlistoInfo.items.map(async (song) => {
      try {
        const songFileName = `${this.nameGenerator(song.title)}.mp3`;
        if (this.override !== true) {
          await fue.existFile(songFileName);
        }
        const songFile = await this.download(song.id, songFileName);
        songFile.ref = song;
        return songFile;
      } catch (error) {
        const quiteError = {
          id: song.id,
          ref: song,
          error,
        };
        return quiteError;
      }
    });

    return await Promise.all(downloadingSongs);
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
