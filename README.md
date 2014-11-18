#youtube-to-gif

Creates an animated GIF from a YouTube URL.

##Prerequisites

You will need ffmpeg to use this package. Assuming you are using OS X, ffmpeg can be installed very easily with Brew.

```bash
brew install ffmpeg
```

##Installation

```bash
npm install youtube-to-gif -g
```

##Usage

This following command will create an animated GIF from a Youtube Video of Neo fighting Morpheus in the film: The Matrix.

```bash
youtube-to-gif -u https://www.youtube.com/watch\?v\=NqxSgp385N0 -b 30 -d 5
```

The -b flag specifies the seconds at which to begin converting the video file. The -d flag specifies the duration of clip you want to convert to an animated GIF. After typing the above command, your terminal output should look something like this:

![Terminal Output](http://i.imgur.com/eyR89nx.png)

And here is the final output:

![Output Example](http://i.imgur.com/uRuUVG3.gif)


##Options

    -u, --url [type]        YouTube video URL you wish to convert.
    -o, --output [type]     The name of the output file. [default = ./output/{video-title}.gif
    -f, --fps [type]        Frames per second of the output GIF. [default = 10]
    -s, --size [type]       Dimensions of the output GIF. [default = 320x?]
    -b, --beginTime [type]  The offset start of the video. [default = 3]
    -d, --duration [type]   Number of seconds GIF should last. [default = 10]
    -t, --thumb             Display thumbnail of the Youtube video in console.
    -e, --openexport        Opens the export when done.
    -v, --verbose           Displays all the information.


