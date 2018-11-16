'use strict';

const yt_playlist = require('youtube-playlist-dl');
 
// Starts the count for the playlist size. 
let j = 1;
 
console.log('--------------------------------------------------------');
console.log('[INFO] GATHERING VIDEOS FROM SELECTED PLAYLIST');
console.log('--------------------------------------------------------');
 
// https://www.youtube.com/playlist?list=PLBweDmMi-NsOeiKfKKrtcNW1HNy2giuqY
const options = {
    playlistUrl : "PLBweDmMi-NsOeiKfKKrtcNW1HNy2giuqY", // The playlist id. url: "playlist?list=..."
    mp4Directory : "./",
    mp3Directory : "./"
}

console.log(yt_playlist);


yt_playlist.retrievePlaylist(options, 1, j);