const fs = require('fs-extra');
const tmp = require('tmp');
const archiver = require('archiver');
const shellpromise = require('shellpromise');

module.exports = {
  archive,
  gitFetchTags,
  gitSetTag,
  gitRemoveTag,
};

async function gitFetchTags() {
  await shellpromise('git fetch --tags');
  
  return shellpromise(`git tag --contains HEAD`).catch(data => false).then(data => data.split('\n'));
}

async function gitSetTag(tagName) {
  await shellpromise('git fetch --tags');
  await shellpromise(`git tag -d ${tagName}`).catch(() => {});
  await shellpromise(`git push origin :${tagName}`).catch(() => {});
  await shellpromise(`git tag ${tagName}`);
  await shellpromise(`git push origin ${tagName}`);
  return tagName;
}

async function gitRemoveTag(tagName) {
  await shellpromise('git fetch --tags');
  await shellpromise(`git tag -d ${tagName}`).catch(() => {});
  await shellpromise(`git push origin :${tagName}`).catch(() => {});
  return tagName;
}

async function archive(dir) {
  // takes a direcory zips it up and puts it in the tmp dir
  return new Promise((resolve, reject) => {
    const tmpFilename = tmp.fileSync().name;
    const output = fs.createWriteStream(tmpFilename);
    
    const archive = archiver('zip', {
      gzip: true,
      zlib: { level: 9 },
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log('Archiver has been finalized and the output file descriptor has closed.');
      resolve(tmpFilename);
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
    archive.directory(dir, false);
    archive.finalize();
  });
}