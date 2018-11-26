'use strict';

const DownloadYTFile = require('../lib/download-audio');
const fue = require('file-utils-easy');

const OUT_DIR = 'test/out';
const TEST_PLAYLIST = {
  twoSong: { id: 'PLAv2aQ9JgGbVcUtDpuiTB9WgaMljCUpa_', length: 2 },
};

describe('Core lib', () => {
  beforeEach(() => {
    return fue.deleteDirectoryFiles(OUT_DIR);
  });

  it('download small playlist', async () => {
    const downloader = new DownloadYTFile({ outputPath: OUT_DIR });

    let progressEvents = 0;
    let completeEvents = 0;
    downloader.on('progress', () => progressEvents++);
    downloader.on('complete', () => completeEvents++);

    const result = await downloader.downloadPlaylist(TEST_PLAYLIST.twoSong.id);

    // TODO more check on output
    expect(result).toHaveLength(TEST_PLAYLIST.twoSong.length);
    expect(completeEvents).toEqual(TEST_PLAYLIST.twoSong.length);
    expect(progressEvents).toBeGreaterThanOrEqual(TEST_PLAYLIST.twoSong.lengthF);
  }, 120000);
});
