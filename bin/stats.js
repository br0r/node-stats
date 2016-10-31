#!/usr/bin/env node --expose-gc
var fs = require('fs');
var blocked = require('blocked');
var path = require('path');
var spawn = require('child_process').spawn;

var block = [];
var heap = [];

blocked(function(ms) {
  console.warn('Got block', ms);
  block.push({d: Date.now(), v: ms});
});

function writeStatsFile(cb) {
  fs.writeFile('stats.json', JSON.stringify({heap: heap, block: block}), function(err) {
    if (err) {
      console.error('Failed to write stats.json', err);
      process.exit(1);
    } else {
      if (typeof cb === 'function') {
        cb();
      }
    }
  });
}

var plot;

function createPlot() {
  var scriptPath = path.join(__dirname, '../read_stats.py');
  var statsFile = path.join(process.cwd(), 'stats.json');
  plot = spawn('python', [scriptPath, statsFile],  {stdio: ['pipe', process.stdout, process.stderr]});

  plot.on('exit', function() {
    i += 1;
    console.error('plot died', arguments);
    // Restart plot max 5 times
    // Tmp fix until solved dying issues.
    if (i < 5) {
      createPlot();
    }
  });
}

createPlot();
var i = 0;

function sendAlarm() {
  plot.kill('SIGUSR1');
}

process.on('SIGINT', function() {
  writeStatsFile(function() {
    sendAlarm();
    process.exit(0);
  });
});

process.on('exit', function() {
  plot.kill();
});

setInterval(function() {
  var h = process.memoryUsage().heapUsed;
  heap.push({d: Date.now(), v: h});
  writeStatsFile(sendAlarm);
}, 1000);

var script = path.join(process.cwd(), process.argv[2]);
require(script);
