/*
 * BCRLS Home Promo Video
 * One-click embedded Google Drive player.
 * The visitor sees one clear play button. Clicking it loads the Drive
 * preview with autoplay enabled in the same page (no redirect/new tab).
 * The player is unloaded when the section is scrolled out of view.
 */
(function () {
    'use strict';

    function initHomePromoVideo() {
        var frame = document.querySelector('#overview-video .video-frame');
        var iframe = document.querySelector('#overview-video .video-frame iframe[data-video-src]');
        var playButton = document.getElementById('promoPlayButton');
        if (!frame || !iframe) return;

        var videoUrl = iframe.getAttribute('data-video-src');
        if (!videoUrl) return;

        var active = false;
        var loading = false;
        var playedByUser = false;

        function showPlayButton(show) {
            if (!playButton) return;
            playButton.hidden = !show;
            playButton.setAttribute('aria-hidden', show ? 'false' : 'true');
            playButton.classList.remove('is-loading');
        }

        function autoplayUrl(url) {
            var separator = url.indexOf('?') === -1 ? '?' : '&';
            return url + separator + 'autoplay=1';
        }

        function loadPlayer(fromUser) {
            if (active || loading) return;
            loading = true;
            playedByUser = !!fromUser;

            // The click itself is the user gesture. Loading the Drive preview
            // with autoplay lets the single visible button start the video.
            iframe.setAttribute('src', autoplayUrl(videoUrl));
            active = true;

            // The custom button disappears once the embedded player has loaded.
            window.setTimeout(function () {
                loading = false;
                showPlayButton(false);
            }, 500);
        }

        function userOpenVideo(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            loadPlayer(true);
        }

        function stopVideo() {
            if (!active && !loading) {
                showPlayButton(true);
                return;
            }
            active = false;
            loading = false;
            playedByUser = false;
            iframe.setAttribute('src', 'about:blank');
            showPlayButton(true);
        }

        if (playButton) {
            showPlayButton(true);
            // Use click only. On touch devices touchend + click can otherwise
            // trigger the action twice.
            playButton.addEventListener('click', userOpenVideo, false);
        }

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting || entry.intersectionRatio < 0.05) {
                        stopVideo();
                    }
                    // Do not automatically load the player here. The visible
                    // play button is the single user action that starts it.
                });
            }, {
                threshold: [0, 0.05, 0.20, 0.50],
                rootMargin: '0px 0px -3% 0px'
            });
            observer.observe(frame);
        }

        showPlayButton(true);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHomePromoVideo);
    } else {
        initHomePromoVideo();
    }
})();
