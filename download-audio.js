'use strict';

const horizon = require('horizon-youtube-mp3');
const path = require('path');
const downloadPath = path.join(__dirname);

function onConvertVideoProgress(percent, timemark, targetSize) {
  console.log('Progress:', percent, 'Timemark:', timemark, 'Target Size:', targetSize);
  // Will return...
  // Progress: 90.45518257038955 Timemark: 00:02:20.04 Target Size: 2189
  // Progress: 93.73001672942894 Timemark: 00:02:25.11 Target Size: 2268
  // Progress: 100.0083970106642 Timemark: 00:02:34.83 Target Size: 2420
}






class DownloadYTFile {
  constructor() {

  }

  download(id) {
    return new Promise((resolve, reject) => {
      horizon.downloadToLocal(`http://youtube.com/watch?v=${id}`,
        downloadPath, null, null, null,
        (err, result) => {
          console.log(err, result);
          // Will return...
          //null, conversionFileComplete
          if (err) {
            return reject(err);
          }
          resolve(result);
        },
        null);

    });
  }

}

module.exports = DownloadYTFile;
