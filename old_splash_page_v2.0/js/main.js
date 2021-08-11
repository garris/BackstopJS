$('button').click(function () {
  window.location.href = 'https://github.com/garris/BackstopJS';
});

// TODO:  modify this for v2.0 content vvvvv

const READY_LAG_MS = 10000;
const READY_TAG = '_the_lemur_is_ready_to_see_you';
const LEMUR_CLASS_ACTION = 'hideLemur';
const COOKIE_TEST = /cookie/i;
const CLICK_TEST = /click/i;
const DELAY_TEST = /delay/i;

if (COOKIE_TEST.test(window.location.search)) {
  showCookies();
}
if (CLICK_TEST.test(window.location.search)) {
  modifyLemurBehavior();
}
if (DELAY_TEST.test(window.location.search)) {
  delayLemurification();
}

function modifyLemurBehavior () {
  document.body.addEventListener('click', evt => {
    if (evt.target.id === 'theLemur') {
      containTheLemur();
      evt.preventDefault();
    } else {
      releaseTheLemur();
    }
  });
  console.log('lemur behavior is modified');
}

function showCookies () {
  document.getElementsByClassName('logoBlock')[0].innerText = 'cookies > ' + document.cookie;
}

function setReadyFlags () {
  console.log(READY_TAG);
  document.body.classList.add(READY_TAG);
}

function releaseTheLemur () {
  document.body.classList.remove(LEMUR_CLASS_ACTION);
}

function containTheLemur () {
  document.body.classList.add(LEMUR_CLASS_ACTION);
}

function delayLemurification () {
  containTheLemur();
  setTimeout(releaseTheLemur, READY_LAG_MS);
  setTimeout(setReadyFlags, READY_LAG_MS + 1000);
}
