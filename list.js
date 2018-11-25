const ytpl = require('ytpl');
const DownloadYTFile = require('./download-audio');

const downloader = new DownloadYTFile();

downloader.on('progress', console.log)

// https://www.youtube.com/playlist?list=PLAv2aQ9JgGbVcUtDpuiTB9WgaMljCUpa_
// https://www.youtube.com/playlist?list=PLAv2aQ9JgGbXJQvONGorCeLZLmAP-BqwZ
// ytpl('PLBweDmMi-NsOeiKfKKrtcNW1HNy2giuqY', function (err, playlist) {
downloader.downloadPlaylist('PLAv2aQ9JgGbVcUtDpuiTB9WgaMljCUpa_')
  .then((res) => { console.log('Done', res) })
  .catch(console.log);
