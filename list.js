const ytpl = require('ytpl');
const DownloadYTFile = require('./download-audio');
const fue = require('file-utils-easy');


// https://www.youtube.com/playlist?list=PLAv2aQ9JgGbXJQvONGorCeLZLmAP-BqwZ
ytpl('PLBweDmMi-NsOeiKfKKrtcNW1HNy2giuqY', function (err, playlist) {
  if (err) throw err;
  console.log(playlist);
  console.log(playlist.items.length);

  sequentialDownload(playlist.items)
    .then(() => {
      console.log('finito');
    })
});


async function sequentialDownload(array) {
  const d = new DownloadYTFile();
  for (let i = 0; i < array.length; i++) {
    const song = array[i];
    try {
      try {
        await fue.existFile(`${song.title}.mp3`);
      } catch (error) {
        await d.download(song.id);
        console.log('scaricato', song.id);
      }
    } catch (error) {
      console.log('error for', song.title);
    }
  }
}