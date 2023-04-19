var archiver = require('archiver');
var fs = require('fs');
var chalk = require("chalk")
var util = require('util'),
exec = require('child_process').exec;
const color = (text, color) => {
  return !color ? chalk.green(text) : chalk.keyword(color)(text);
};
const moment = require('moment-timezone')
const jam = moment().tz('Asia/Jakarta').format('HH:mm:ss')

module.exports= (file,io,data)=>{
var output = fs.createWriteStream("./public/sites/" +file+ '.zip');
var archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});
 
// listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
output.on('close', function() {
  console.log(color(`[ • ${jam} - https://${file} | ${bytesToSize(archive.pointer())} • ]` ,'white'))
  io.emit(data.token,{progress:"Completed",file})
  exec(`rm -rf ${file}`);
  exec(`rm -rf ./public/sites/.zip`);
});
 
// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
output.on('end', function() {
  console.log('Data has been drained');
});
 
// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    // log warning
  } else {
    // throw error
    throw err;
  }
});
 
// good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});
 
// pipe archive data to the file
archive.pipe(output);

// append files from a sub-directory and naming it `new-subdir` within the archive

archive.directory('./'+file,false);

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
archive.finalize();

 
}
function bytesToSize(bytes, decimals = 2) {
if (bytes === 0) return '0 Bytes';
const k = 1024;
const dm = decimals < 0 ? 0 : decimals;
const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const i = Math.floor(Math.log(bytes) / Math.log(k));
return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}