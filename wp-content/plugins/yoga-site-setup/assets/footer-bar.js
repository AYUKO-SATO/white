/**
 * モバイル固定フッターバー：下スクロールで隠す／上スクロールで戻す。
 * ヘッダー（mobile-header.js）と同じ挙動。
 *
 * このスクリプトはフッター（wp_print_footer_scripts, priority 20）で読まれるが、
 * バー本体の HTML は wp_footer priority 99 で出力されるため、実行時点では
 * まだ DOM に無い。DOMContentLoaded を待ってから初期化する。
 */
(function () {
  'use strict';

  function init() {
    var bar = document.querySelector('.yss-fbar');
    if (!bar) return;

    // ヘッダー（mobile-header.js）と同じロジック。rAF スロットルは使わない。
    var lastY = window.pageYOffset || document.documentElement.scrollTop || 0;
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      // 下スクロールかつ 80px 以上 → 隠す。上スクロール or 先頭付近 → 戻す。
      if (y > lastY && y > 80) bar.classList.add('is-hidden');
      else if (y < lastY || y <= 80) bar.classList.remove('is-hidden');
      lastY = y;
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
