'use strict';

const ytlist = require('youtube-playlist')

const url = 'https://www.youtube.com/playlist?list=PLAv2aQ9JgGbXJQvONGorCeLZLmAP-BqwZ';

ytlist(url, 'url').then(res => {
  console.log(res);
});