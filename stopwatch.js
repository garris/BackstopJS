/**
 *  Stopwatch
 *  @param {str} [labels] stopwatch instance
 *  @param {int} [resolution] integer sets sub-milisecond accuracy level e.g. 1 = 0.0, 2 = 0.00, 3 = 0.000
 *  @param {bool} [autoStart] defaults to true. if set to false will not autoStart when initalized
 */

function Stopwatch(label, resolution, autoStart) {
  var defaultLabel = 'stopwatch';
  var defaultLapLabel = 'lap';
  var defaultLapAvgLabel = "\u03bc";
  var defaultVarianceLabel = 'variance';
  var defaultStdDevLabel = "\u03c3";
  var defaultLapAvgPerSecLabel = 'avg/sec';
  var msLabel = 'ms';

  if (!resolution) {
    resolution = 0;
  }
  resolution = Math.pow(10, resolution);

  if (!label) {
    label = defaultLabel;
  }

  this.label = label;

  function getRounded(x) {
    return Math.round(x * resolution) / resolution;
  }

  function getRoundedDelta(a, b) {
    return getRounded(a - b);
  }

  this.getTime = function() {
    return getRounded(window.performance.now());
  };

  this._isRunning = false;

  this.isRunning = function() {
    return this._isRunning;
  }
  this.hasPausedLap = false;
  this.laps = [];

  this.reset = function(isRunning) {
    this.start();
    this.laps.length = 0;
    this._isRunning = isRunning || false;
  };

  this.start = function() {
    if (!this.hasPausedLap) {
      this.laps.length = 0;
    }
    this.lastLapTime = 0;
    this.startTime = 0;
    this.stopTime = 0;
    this.selfTime = 0;
    this.startTime = this.getTime();
    this._isRunning = true;
  };

  this.continue = this.start;

  this.stop = function(toConsole, pushLap) {
    this.stopTime = this.getTime();
    this.selfTime = getRoundedDelta(this.stopTime, this.startTime);
    if (toConsole) {
      console.log(label + ' ' + this.selfTime + "ms")
    }
    this._isRunning = false;
    if (pushLap) {
      this.hasPausedLap = true;
      this.lap(null, false, this.selfTime)
    }
    return this.selfTime;
  };

  this.getStopTime = function(toConsole) {
    if (toConsole) {
      console.log(label + ' last stop time: ' + this.selfTime + "ms")
    }
    return this.selfTime;
  };

  this.stopLap = function(toConsole) {
    this.stop(toConsole, true);
  };

  this.lap = function(lapLabel, toConsole, selfTime) {
    var lapTime, lapSelfTime, runningTime;

    lapTime = this.getTime();

    if (!this.lastLapTime) {
      this.lastLapTime = this.startTime;
    }

    if (selfTime) {
      lapSelfTime = selfTime;
    } else {
      lapSelfTime = getRoundedDelta(lapTime, this.lastLapTime);
    }


    if (!lapLabel) {
      lapLabel = defaultLapLabel;
    }

    runningTime = getRoundedDelta(lapTime, this.startTime);
    this.laps.push({
      id: this.laps.length,
      label: lapLabel,
      time: runningTime,
      self: lapSelfTime
    });
    this.lastLapTime = lapTime;
    if (toConsole) {
      console.log(lapLabel + ' ' + lapSelfTime + "ms")
    }
    return runningTime;
  };


  this.getLaps = function(pluckTime) {
    if (pluckTime === true || pluckTime === 'self') {
      return this.laps.map(function(o) {
        return o.self;
      })
    } else if (pluckTime === 'running') {
      return this.laps.map(function(o) {
        return o.time;
      })
    } else {
      return this.laps;
    }
  }

  /**
   * getAvgLapTime returns avg of lap times
   * @param  {bool} toConsole logs result to console when true
   * @param  {int} slice will only average the n last laps
   * @return {float} avg of lap times
   */
  this.getAvgLapTime = function(toConsole, slice) {
    var lapArr = this.getLaps('self');
    if (!lapArr) {
      return;
    }
    if (!lapArr.length) {
      return;
    }
    if (!slice) {
      slice = 0;
    }
    var sliced = lapArr.slice(-slice);


    var avg = !sliced.length || getRounded(sliced.reduce(function(a, b){return a + b}, 0) / sliced.length);
    if (toConsole) {
      console.log(defaultLapAvgLabel + ' ' + avg + msLabel)
    }
    return avg;
  };

  this.getLapMean = this.getAvgLapTime;

  this.getLapVariance = function(toConsole, slice) {
    var lapArr = this.getLaps('self');
    if (!lapArr) {
      return undefined;
    }
    if (!lapArr.length) {
      return undefined;
    }
    if (!slice) {
      slice = 0;
    }
    var sliced = lapArr.slice(-slice);

    var mean = this.getLapMean(false, slice);
    var lapArr_vals_less_mean_squared = sliced.map(function(val) {
      return Math.pow(val - mean, 2);
    });
    var variance = !sliced.length || getRounded(lapArr_vals_less_mean_squared.reduce(function(a, b) {return a + b}) / sliced.length);

    if (toConsole) {
      console.log(defaultVarianceLabel + ' ' + variance + msLabel)
    }
    return variance;
  };


  this.getLapStdDev = function(toConsole, slice) {
    var variance = this.getLapVariance(false, slice);
    if (variance === false) {
      return undefined;
    }

    var stdDev = getRounded(Math.sqrt(variance))

    if (toConsole) {
      console.log(defaultStdDevLabel + ' ' + stdDev + msLabel)
    }
    return stdDev;
  }

  this.getAvgLapsPerSec = function(toConsole, slice) {
    var avg = 1000 / this.getAvgLapTime(false, slice);
    if (toConsole) {
      console.log(defaultLapAvgPerSecLabel + ' ' + avg + msLabel)
    }
  }

  if(autoStart !== false) {
    this.start();
  } else {
    this.reset();
  }

}
