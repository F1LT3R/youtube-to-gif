#!/usr/bin/env node

var fs = require('fs')
  , ytdl = require('ytdl-core')
  , ffmpeg = require('fluent-ffmpeg')
  , sys = require('sys')
  , exec = require('child_process').exec
  , Promise = require('bluebird')
  , ansi = require('ansi')
  , cursor = ansi(process.stdout)
  , program = require('commander')
  , createImageSizeStream = require('image-size-stream')
  , getter = require('pixel-getter')
  , http = require('http')
  , sanitize = require("sanitize-filename")
  ;


// Commandline options
program
  .version('0.0.4')
  .option('-u, --url [type]', 'YouTube video URL you wish to convert.', 'https://www.youtube.com/watch?v=NqxSgp385N0')
  .option('-o, --output [type]', 'The name of the output file. [default = ./output/{video-title}.gif', false)
  .option('-f, --fps [type]', 'Frames per second of the output GIF. [default = 10]', 10)
  .option('-s, --size [type]', 'Dimensions of the output GIF. [default = 320x?]', '320x?')
  .option('-b, --beginTime [type]', 'The offset start of the video. [default = 3]', 3)
  .option('-d, --duration [type]', 'Number of seconds GIF should last. [default = 10]', 10)
  .option('-t, --thumb', 'Display thumbnail of the Youtube video in console.')
  .option('-e, --openexport', 'Opens the export when done.')
  .option('-v, --verbose', 'Displays all the information.')
  .parse(process.argv)
  ;



go();



// Begin!
function go(){
  cursor.fg.rgb(64,128,0).write('Youtube-To-GIF:').reset().write(' ').underline().write(program.url+'\n').reset();
  
  var stream = getYouTubeVid(program.url);
  
  stream.on('info', function(meta){
    if (program.verbose) {
      cursor.write('Meta data loaded\n');
    }
    
    metaReady(meta, stream);
  });
}



// Creates a Youtube Stream to pass to the FFMPEG Converter
function getYouTubeVid(url){
  return ytdl(url);
}



// When the meta is ready, we can start converting the stream
function metaReady(meta, stream){
  var title = meta.title
    , safeTitle = sanitize(title).replace(/ /g, '_')
    ;
  
  if (program.thumb || program.verbose) {
    displayThumbnail(meta.iurlmq, title)
  }
  
  if (!program.output) {
    filename = safeTitle+'.gif';
  } else {
    filename = program.output;
  }

  exportGIF(stream, filename);
};



// Export the stream to GIF as it comes in
function exportGIF(stream, filename){
  if (program.verbose) {
    cursor.write('FFMPEG\'ing video to GIF\n');
  }

  ffmpeg(stream)
    .noAudio()
    .videoCodec('gif')
    .format('gif')
    .size(program.size)
    .fps(program.fps)
    .setStartTime(program.beginTime)
    .duration(program.duration)
    .on('progress', progress)
    .on('error', errorExporting)
    .on('end', function(){ finishedExport(filename); }) 
    .save(filename);
}



function progress(prog){
  cursor.write('.');
}



// When the export has finished
function finishedExport(filename){

  cursor.write('\n').fg.rgb(64,128,0).write('Success:').reset().write(' ')
    .underline().write(filename)
    .reset().write(' \n');

  if(program.openexport){
    cursor.reset();
    console.log('Opening your animated GIF now.');
    function puts(error, stdout, stderr) {
      sys.puts(stdout)
    }
    exec('open '+filename, puts);
  }
  cursor.reset();
}



// Let us know if FFMPEG Fails
function errorExporting(err){
  cursor.fg.rgb(128+64,0,0).write('There was an error exporting to GIF:')
  .reset().write(' '+ err.message);
}




// Get sizes of each image
function getImageSize(url){
  return new Promise(function(resolve, reject){
    var size = createImageSizeStream();

    var request = http.get(url, function(response) {
      response.pipe(size);
    });

    size.on('size', function(dimensions) {
      resolve(dimensions);
      request.abort();
    }).on('error', function(err) {
      reject(err);
    });

  });
}



// Get the RGB pixel values of the image
function getPixelArray(url){
  return new Promise(function(resolve, reject){
    getter.get(url, function(err, pixels) {
      if (err)  return reject(err);
      resolve(pixels);
    });
  });
}



// Image object combines dimension meta with pixel data
function getImage(url){
  return new Promise(function(resolve, reject){
    var image = {size: null, pixels: null, url: url};

    getImageSize(url)
      .then(function(size){
        image.size = size;
        return getPixelArray(url);
      })
      .then(function(pixels){
        image.pixels = pixels[0];
        resolve(image);
      })
      .catch(function(err){
        reject(err);
      })
      ;
  });
};



// Draws the Youtube thumbnail to the screen
function drawThumbnail(image){
  var charWidth = process.stdout.columns/3
    , pixels = image.pixels
    , imageWidth = image.size.width
    , imageHeight = image.size.height
    , aspectRatio = imageWidth/charWidth
    , charHeight = imageHeight/aspectRatio
    , color // The current pixel during the iteration
    , index // The index of the pixel in the image array
    , x // coord during iteration
    , y // coord during iteration
    ;
  

  // Iterate over ary, step by char-to-pixel ratio (x*aspectRatio)
  // y+=2 because chars are generally ~2x high as wide
  for (y = 1; y < charHeight; y+=2) {
    for (x = 1; x < charWidth; x+=1) {
      color = pixels[imageWidth * parseInt(y*aspectRatio) + parseInt(x*aspectRatio)];
      cursor.bg.rgb(color.r, color.g, color.b).write(' ');
    }
    cursor.reset().write('\n');
  }
  cursor.reset();
  cursor.underline();
  cursor.fg.rgb(128,128,128);
  console.log(image.url+'\n\n');
  cursor.reset();
}



// Displays an ASCII thumbnail of the Youtube video thumbnail
function displayThumbnail(url, title){
  console.log(url);
  getImage(url)
    .then(drawThumbnail)
    .catch(function(err){
      console.log('Error display thumbnail in terminal: ', err);
    });
}
