'use strict';

const ytlist = require('youtube-playlist')

const url = 'https://www.youtube.com/playlist?list=PLBweDmMi-NsOeiKfKKrtcNW1HNy2giuqY';

ytlist(url, 'id').then(res => {
  console.log(res);
  console.log(res.data.playlist.length);
});