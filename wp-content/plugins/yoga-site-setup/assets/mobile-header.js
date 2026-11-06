/**
 * モバイルヘッダー：下スクロールで隠す／上スクロールで戻す。
 * ハンバーガーでスライドインメニューを開閉（ESC・オーバーレイ・Close で閉じる）。
 * パネルは常に DOM にあり、is-open クラスの付け外しだけで動く（タイマー・rAF 不使用）。
 */
(function () {
  'use strict';

  var header = document.querySelector('.yss-mheader');
  var nav = document.getElementById('yss-mnav');
  if (!header) return;

  /* ---- スクロールで表示 / 非表示 ----
     rAF スロットルは使わない（バックグラウンドタブ等で rAF が止まるとフラグが
     戻らず固まるため）。class の付け外しだけなので直接処理で十分軽い。 */
  var lastY = window.pageYOffset || document.documentElement.scrollTop || 0;
  window.addEventListener('scroll', function () {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (y > lastY && y > 80) header.classList.add('is-hidden');
    else if (y < lastY || y <= 80) header.classList.remove('is-hidden');
    lastY = y;
  }, { passive: true });

  /* ---- スライドインメニュー ---- */
  if (!nav) return;
  nav.hidden = false; // JS が動いたら DOM に載せる（CSS で画面外に待機）
  var toggle = document.querySelector('.yss-mheader__toggle');

  function open() {
    nav.classList.add('is-open');
    document.body.classList.add('yss-mnav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    var f = nav.querySelector('.yss-mnav__close, .yss-mnav__list a');
    if (f) f.focus();
    document.addEventListener('keydown', onKey);
  }

  function close() {
    nav.classList.remove('is-open');
    document.body.classList.remove('yss-mnav-open');
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    var f = nav.querySelectorAll('a[href], button:not([disabled])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      nav.classList.contains('is-open') ? close() : open();
    });
  }
  nav.querySelectorAll('[data-yss-mnav-close]').forEach(function (el) {
    el.addEventListener('click', close);
  });
  nav.querySelectorAll('.yss-mnav__list a').forEach(function (a) {
    a.addEventListener('click', close);
  });
})();
