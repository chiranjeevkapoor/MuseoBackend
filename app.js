require('dotenv').config()
const express = require("express");
const fs = require("fs");
const app = express();
const path = require("path");
const cors = require("cors");
var music = "./assets/Current Joys - A Different Age.mp3"; // filepath
var stat = fs.statSync(music);

const PORT = process.env.PORT || 8800;

var readStream;
app.use(
  cors({
    origin: "*",
  })
);

//this function get the list of all the files in the assets directory
app.get("/list", (req, res, next) => {
  const list = fs.readdirSync("./assets");
  console.log(list);
  res.send(list);
});

app.get("/music/:music_name", (req, res) => {
  music = `./assets/${req.params.music_name}`;
  var range = req.headers.range;
  // console.log(range);
  // console.log(req.params);
  if (range !== undefined) {
    var parts = range.replace(/bytes=/, "").split("-");
    var partial_start = parts[0];
    var partial_end = parts[1];

    if (
      (isNaN(partial_start) && partial_start.length > 1) ||
      (isNaN(partial_end) && partial_end.length > 1)
    ) {
      return res.sendStatus(500);
    }
    var start = parseInt(partial_start, 10);
    var end = partial_end ? parseInt(partial_end, 10) : stat.size - 1;

    var content_length = end - start + 1;

    res.status(206).header({
      "Content-Type": "audio/mp3",
      "Content-Length": content_length,
      "Content-Range": "bytes " + start + "-" + end + "/" + stat.size,
    });
    readStream = fs.createReadStream(music, { start: start, end: end });
  } else {
    res.header({
      "Content-Type": "audio/mp3",
      "Content-Length": stat.size,
    });
    readStream = fs.createReadStream(music);
  }
  readStream.pipe(res);
});

app.listen(PORT,()=>{
  console.log(`running on ${PORT}`)
});
