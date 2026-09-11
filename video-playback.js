(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.treatment-video video').forEach(function (video) {
    var inView = false;
    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.controls = false;
    video.removeAttribute('controls');
    video.disablePictureInPicture = true;
    function attemptPlay() {
      if (reduced.matches || !inView || document.hidden || !video.paused) return;
      var request = video.play();
      if (request) request.catch(function () {
        // Retry after a page gesture when a device initially blocks autoplay.
        video.dataset.autoplayState = 'blocked';
      });
    }
    video.addEventListener('playing', function () {
      video.dataset.autoplayState = 'playing';
    });
    video.addEventListener('canplay', attemptPlay);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) attemptPlay();
      }, { threshold: 0.15 }).observe(video);
    } else {
      inView = true;
      attemptPlay();
    }
    document.addEventListener('visibilitychange', attemptPlay);
    document.addEventListener('pointerdown', function () {
      attemptPlay();
    }, { passive: true });
    function motionPreferenceChanged() {
      video.autoplay = !reduced.matches;
      if (reduced.matches) video.pause();
      else attemptPlay();
    }
    reduced.addEventListener('change', motionPreferenceChanged);
    motionPreferenceChanged();
  });
}());
