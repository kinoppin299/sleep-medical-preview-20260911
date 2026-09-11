(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.treatment-video video').forEach(function (video) {
    var manuallyPaused = false;
    var inView = false;
    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.controls = true;
    function attemptPlay() {
      if (reduced.matches || !inView || document.hidden || manuallyPaused || !video.paused) return;
      var request = video.play();
      if (request) request.catch(function () {
        // Native controls remain usable when a device blocks autoplay.
        video.dataset.autoplayState = 'blocked';
      });
    }
    video.addEventListener('playing', function () {
      manuallyPaused = false;
      video.dataset.autoplayState = 'playing';
    });
    video.addEventListener('pause', function () {
      if (!reduced.matches && !document.hidden && inView && !video.ended) manuallyPaused = true;
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
    document.addEventListener('pointerdown', function (event) {
      if (event.target !== video) attemptPlay();
    }, { passive: true });
    function motionPreferenceChanged() {
      video.autoplay = !reduced.matches;
      if (reduced.matches) video.pause();
      else { manuallyPaused = false; attemptPlay(); }
    }
    reduced.addEventListener('change', motionPreferenceChanged);
    motionPreferenceChanged();
  });
}());
