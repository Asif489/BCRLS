/*
 * BCRLS Home Promo Video
 * YouTube embed: https://youtu.be/DWcjBr2Hk64
 * Keeps the player on the home page and pauses it when scrolled away.
 */
(function () {
    'use strict';

    function pauseYouTube(iframe) {
        if (!iframe || !iframe.contentWindow) return;
        iframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'pauseVideo',
            args: []
        }), 'https://www.youtube.com');
    }

    function initHomePromoVideo() {
        var frame = document.querySelector('#overview-video .video-frame');
        var iframe = document.querySelector('#overview-video .video-frame iframe[data-video-src]');
        if (!frame || !iframe) return;

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting || entry.intersectionRatio < 0.05) {
                        pauseYouTube(iframe);
                    }
                });
            }, {
                threshold: [0, 0.05, 0.25, 0.5],
                rootMargin: '0px 0px -3% 0px'
            });
            observer.observe(frame);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHomePromoVideo);
    } else {
        initHomePromoVideo();
    }
})();
