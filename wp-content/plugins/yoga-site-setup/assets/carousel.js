/**
 * yss-carousel — 汎用の横スクロール型カルーセル。
 *
 * フロント側で `[data-yss-carousel]` の直下要素をトラック化する。
 * ブロックエディタ上は素の縦積みのまま編集でき、表示側だけカルーセルになる。
 *
 * data 属性:
 *   data-per-view      PC の表示件数（既定 3）
 *   data-per-view-sp   スマホ（600px 以下）の表示件数（既定 1）
 *   data-autoplay      "1" で自動送り
 *   data-interval      自動送り間隔 ms（既定 6000、最小 2000）
 */
(function () {
  'use strict';

  function build(root) {
    if (root.dataset.yssCarouselReady === '1') return;
    root.dataset.yssCarouselReady = '1';

    var items = Array.prototype.filter.call(root.children, function (el) {
      return el.nodeType === 1;
    });
    if (items.length < 2) return;

    // `.yoga-reviews` / `.yoga-schedule` get sensible defaults without needing
    // data-* attributes on the group block (which the editor cannot round-trip).
    var isReviews = root.classList.contains('yoga-reviews');
    var isSchedule = root.classList.contains('yoga-schedule');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var autoplay = (root.dataset.autoplay === '1' || (isReviews && root.dataset.autoplay !== '0')) && !reduce;
    var interval = Math.max(2000, parseInt(root.dataset.interval || '6000', 10));
    // お客様の声は矢印を出さない（カード文と重なるため）。ドットは出す。
    // data-nav="0" で矢印・ドットとも無効化できる。
    var showNav = root.dataset.nav !== '0';
    var showArrows = showNav && !isReviews;
    var showDots = showNav;

    // viewport（矢印・ドットの基準）＞ clip（トラックを切り抜く）＞ track
    // clip に overflow:hidden を持たせないと、横並びのトラックがビューポート外へ
    // はみ出してページ全体に横スクロールが生まれ、position:fixed のヘッダー／
    // フッターバーがずれて出たり消えたりする。
    var viewport = document.createElement('div');
    viewport.className = 'yss-carousel__viewport';
    var clip = document.createElement('div');
    clip.className = 'yss-carousel__clip';
    root.parentNode.insertBefore(viewport, root);
    clip.appendChild(root);
    viewport.appendChild(clip);
    root.classList.add('yss-carousel__track');
    items.forEach(function (el) { el.classList.add('yss-carousel__item'); });

    var prev = control('prev', '前へ', '‹');
    var next = control('next', '次へ', '›');
    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'yss-carousel__dots';
    if (showArrows) {
      viewport.appendChild(prev);
      viewport.appendChild(next);
    }
    if (showDots) {
      viewport.appendChild(dotsWrap);
    }

    var index = 0, step = 0, maxIndex = 0, timer = null, startX = 0;

    function perView() {
      var pcDefault = (isSchedule || root.classList.contains('yoga-reviews--2up')) ? '2' : '3';
      var sp = parseInt(root.dataset.perViewSp || '1', 10);
      var pc = parseInt(root.dataset.perView || pcDefault, 10);
      return window.matchMedia('(max-width: 600px)').matches ? sp : pc;
    }

    function control(dir, label, glyph) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'yss-carousel__arrow is-' + dir;
      b.setAttribute('aria-label', label);
      b.innerHTML = glyph;
      b.addEventListener('click', function () { go(dir === 'next' ? index + 1 : index - 1); restart(); });
      return b;
    }

    function calc() {
      var pv = perView();
      viewport.style.setProperty('--yss-per-view', pv);
      var gap = parseFloat(getComputedStyle(root).gap || '0') || 0;
      step = items[0].getBoundingClientRect().width + gap;
      maxIndex = Math.max(0, items.length - pv);
      viewport.classList.toggle('is-static', items.length <= pv);
      if (index > maxIndex) index = maxIndex;
      renderDots(maxIndex);
      apply();
    }

    function renderDots(max) {
      dotsWrap.innerHTML = '';
      for (var i = 0; i <= max; i++) {
        (function (i) {
          var d = document.createElement('button');
          d.type = 'button';
          d.className = 'yss-carousel__dot';
          d.setAttribute('aria-label', (i + 1) + '番目へ');
          d.addEventListener('click', function () { go(i); restart(); });
          dotsWrap.appendChild(d);
        })(i);
      }
    }

    function go(n) {
      index = n < 0 ? maxIndex : (n > maxIndex ? 0 : n);
      apply();
    }

    function apply() {
      root.style.transform = 'translate3d(' + (-index * step) + 'px,0,0)';
      prev.disabled = !autoplay && index <= 0;
      next.disabled = !autoplay && index >= maxIndex;
      Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }

    function play() {
      stop();
      if (autoplay && maxIndex > 0) timer = window.setInterval(function () { go(index + 1); }, interval);
    }
    function stop() { if (timer) window.clearInterval(timer); timer = null; }
    function restart() { play(); }

    viewport.addEventListener('mouseenter', stop);
    viewport.addEventListener('mouseleave', play);
    viewport.addEventListener('focusin', stop);
    viewport.addEventListener('focusout', play);
    root.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) { go(index + (dx < 0 ? 1 : -1)); restart(); }
    }, { passive: true });
    window.addEventListener('resize', calc);

    calc();
    play();
  }

  function ready() {
    document.querySelectorAll('[data-yss-carousel], .yoga-reviews, .yoga-schedule').forEach(build);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }

  window.yssCarousel = build;
})();
