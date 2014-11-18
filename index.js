var fs = require('fs')
  , ytdl = require('ytdl-core')
  , ffmpeg = require('fluent-ffmpeg')
  , sys = require('sys')
  , exec = require('child_process').exec
  ;


var youtubeLink = 'http://www.youtube.com/watch?v=A02s8omM_hI'
  , size = '320x?'
  , framesPerSecond = 10
  , startTime = '0:02' // start 2 seconds in 
  , duration = 2 // finish 2 seconds after startTime
  ;

ytdl(youtubeLink)
  .pipe(
    fs.createWriteStream('./output/downloaded.flv')
    .on('finish', function(data){
      console.log('Youtube video downloaded.');
      console.log('Beginning animated GIF conversion.');

      var proc = ffmpeg('./output/downloaded.flv')
        .videoCodec('gif')
        .size(size)
        .setStartTime(startTime)
        .duration(duration)
        .fps(framesPerSecond)
        .noAudio()
        .format('gif')
        .on('end', function() {
          console.log('Your youtube video has been converted to GIF succesfully.');
          console.log('Opening your animated GIF now.');
          function puts(error, stdout, stderr) {
            sys.puts(stdout)
          }

          exec("open ./output/converted.gif", puts);
        })
        .on('error', function(err) {
          console.log('an error happened: ' + err.message);
        })
        .save('./output/converted.gif');
    })
  );



