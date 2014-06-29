var color = require("colors");
var moment = require("moment");
var _ = require("lodash");
var dico = {
  "info":    {color: color.green,  output: "[ info  ]"},
  "warning": {color: color.yellow, output: "[ warn  ]"},
  "error":   {color: color.red,    output: "[ error ]"},
  "debug":   {color: color.cyan,   output: "[ debug ]"},
  "input":   {color: color.blue,   output: "[ input ]"}
};

var log = function (options) {
  var defaults = {
    displayTime: true,
    timeFormat: 'MM/DD/YYYY hh:mm:ss'
  };
  this.settings = _.extend(defaults, options);
};

log.prototype.changeOptions = function (options) {
  _.extend(this.settings, options);
};

log.prototype.info = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  var suffix = generateSuffix("info", args, this.settings);
  this.logIt(args);
};

log.prototype.warning = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  var suffix = generateSuffix("warning", args, this.settings);
  this.logIt(args);
};

log.prototype.error = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  var suffix = generateSuffix("error", args, this.settings);
  this.logIt(args);
};

log.prototype.debug = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  var suffix = generateSuffix("debug", args, this.settings);
  this.logIt(args);
  console.log(getCaller());
};

log.prototype.input = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  var suffix = generateSuffix("input", args, this.settings);
  this.logIt(args);
};

log.prototype.logIt = function (args) {
  console.log.apply(this, args);
};

function generateSuffix(typeName, args, settings) {
  var type = dico[typeName];
  var suffix = type.color(type.output);
  if (settings.displayTime) {
    suffix += " " + color.grey(moment().format(settings.timeFormat));
  }
  args.unshift(suffix);
}

function getCaller() {
  var firstStackLine = getStack().split('\n')[0];
  var callerFuncPattern = /.*at.*\/(.*\.js)\:([0-9]+)\:([0-9]+).*/;
  var tab = callerFuncPattern.exec(firstStackLine);
  var caller = "\t" + tab[1].grey.underline + " ";
  caller += "[l".grey + tab[2] + ";c".grey + tab[3] + "]".grey;

  return caller;
}

function getStack() {
  var stack = new Error().stack;
  var logFuncPattern = /.*at [getStack|log\.debug].*\/log\.js\:[0-9]+\:[0-9]+.*/;
  var nodeFuncPattern = /.*at.*[node|module]\.js\:[0-9]+\:[0-9]+.*/;
  tab = stack.split('\n');
  _.remove(tab, function (line) {
    return line === "Error" || logFuncPattern.test(line) || nodeFuncPattern.test(line);
  });
  stack = tab.join('\n');
  stack = color.grey(stack);

  return stack;
}

module.exports = log;
