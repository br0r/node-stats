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
  //global.gc();
  // Should we read already written data from file? Or just store it all in memory?
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

var plot = spawn('python', [path.join(__dirname, '../read_stats.py'), path.join(process.cwd(), 'stats.json')], {stdio: ['pipe', process.stdout, process.stderr]});

plot.on('exit', function() {
  console.error('plot died', arguments);
});

plot.on('data', function(data) {
  console.log('got data');
});

function sendAlarm() {
  plot.kill('SIGUSR1');
}

process.on('SIGINT', function() {
  plot.kill();
  writeStatsFile(function() {
    sendAlarm();
    process.exit(0);
  });
});

setInterval(function() {
  var h = process.memoryUsage().heapUsed;
  heap.push({d: Date.now(), v: h});
  writeStatsFile(sendAlarm);
}, 1000);

var script = path.join(process.cwd(), process.argv[2]);
require(script);
