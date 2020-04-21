const fs = require('fs-extra');
// const tmp = require('tmp');
const archiver = require('archiver');

const _archiveBuild = async(config, currentBuild, appName, buildKey) => {

  // Skip if...
  if (currentBuild.buildKey) {
    console.log('... skipped as there is already a build associated with the current HEAD');
    return;
  }

  // make sure directory exists
  fs.mkdirpSync(`${__dirname}/../.temp`);

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(`${__dirname}/../.temp/${appName}_${buildKey}_build.zip`);
  
    const archive = archiver('zip', {
      gzip: true,
      zlib: { level: 9 },
    });
  
    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log('Archiver has been finalized and the output file descriptor has closed.');
      resolve('this is a test');
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', () => {
      console.log('Data has been drained');
    });
  
    archive.on('error', (err) => {
      reject(err);
    });
  
    archive.pipe(output);
  
    const localDirectoryToCopy = `${__dirname}/../../build/${appName}/${buildKey}`;
    archive.directory(localDirectoryToCopy, false);
  
    archive.finalize();
  });
};

module.exports = _archiveBuild;
