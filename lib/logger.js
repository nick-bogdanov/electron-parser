let log = require('electron-log')

log.transports.file.level = 'info'
log.transports.file.format = '{h}:{i}:{s}:{ms} {text}'

// Set approximate maximum log size in bytes. When it exceeds, 
// the archived log will be saved as the log.old.log file 
log.transports.file.maxSize = 5 * 1024 * 1024

// Write to this file, must be set before first logging 
log.transports.file.file = filesDir + '/log.txt'

// fs.createWriteStream options, must be set before first logging 
log.transports.file.streamConfig = { flags: 'w' }

// set existed file stream 
log.transports.file.stream = fs.createWriteStream(filesDir + '/log.txt')

module.exports = log