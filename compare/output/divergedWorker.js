importScripts('diff.js');
importScripts('diverged.js');
self.addEventListener('message', function(e) {
  self.postMessage(diverged(...e.data.divergedInput));
  self.close();
}, false);
