/**
 * 詳細ブロック（FAQ・開閉ボタン）の開け閉めを、高さのアニメーションでなめらかにする。
 * 動きを減らす設定の端末ではアニメーションしない（通常の開閉のまま）。
 */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !Element.prototype.animate) return;
  var EASE = 'cubic-bezier(.22,.8,.3,1)';
  document.querySelectorAll('details.wp-block-details').forEach(function (d) {
    var s = d.querySelector(':scope > summary');
    if (!s) return;
    var anim = null;
    s.addEventListener('click', function (e) {
      e.preventDefault();
      var start = d.getBoundingClientRect().height;
      if (anim) { anim.cancel(); anim = null; }
      d.style.overflow = 'hidden';
      var opening = !d.open || d.classList.contains('is-closing');
      d.classList.remove('is-closing');
      var end;
      if (opening) {
        d.open = true;
        d.style.height = 'auto';
        end = d.getBoundingClientRect().height;
      } else {
        var frame = d.getBoundingClientRect().height - d.clientHeight; // 枠線の分
        end = s.getBoundingClientRect().height + frame;
        d.classList.add('is-closing');
      }
      d.style.height = '';
      anim = d.animate({ height: [start + 'px', end + 'px'] }, { duration: opening ? 420 : 360, easing: EASE });
      d.querySelectorAll(':scope > :not(summary)').forEach(function (c) {
        c.animate({ opacity: opening ? [0, 1] : [1, 0], transform: opening ? ['translateY(-6px)', 'none'] : ['none', 'translateY(-4px)'] }, { duration: opening ? 420 : 260, easing: EASE, fill: 'none' });
      });
      anim.onfinish = function () {
        if (!opening) d.open = false;
        d.classList.remove('is-closing');
        d.style.overflow = '';
        anim = null;
      };
    });
  });
})();
