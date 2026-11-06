/**
 * note RSS カード列を軽量カルーセルへ変換する。
 * 以前は子テーマの wp_footer インラインスクリプトにあったものを移設。
 * noteCarouselReady フラグは子テーマ版と共有し、二重初期化を防ぐ。
 */
document.addEventListener('DOMContentLoaded', function () {
  // 1画面の枚数は data-pv / data-pv-sp（note タブの設定）。無ければ従来どおり 3 / 2。
  const perViewOf = (grid) => window.matchMedia('(max-width: 600px)').matches
    ? (parseInt(grid.dataset.pvSp, 10) || 2)
    : (parseInt(grid.dataset.pv, 10) || 3);

  document.querySelectorAll('.note-card-grid').forEach(function (grid) {
    if (grid.dataset.noteCarouselReady === '1') return;
    grid.dataset.noteCarouselReady = '1';

    const cards = Array.from(grid.querySelectorAll('.note-card'));
    const total = cards.length;
    if (!total) return;

    const carousel = document.createElement('div');
    carousel.className = 'note-carousel';

    const track = document.createElement('div');
    track.className = 'note-track';

    grid.parentNode.insertBefore(carousel, grid);
    carousel.appendChild(track);
    track.appendChild(grid);

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'note-nav-btn is-prev';
    prev.innerHTML = '‹';

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'note-nav-btn is-next';
    next.innerHTML = '›';

    carousel.appendChild(prev);
    carousel.appendChild(next);

    let index = 0;
    let step = 0;
    let maxIndex = 0;

    function calc() {
      const pv = perViewOf(grid);

      if (total <= pv) {
        carousel.classList.add('is-few');
        grid.style.transform = 'translate3d(0,0,0)';
        return;
      }

      carousel.classList.remove('is-few');

      const card = grid.querySelector('.note-card');
      const gap = parseFloat(getComputedStyle(grid).gap || 0);

      step = card.getBoundingClientRect().width + gap;
      maxIndex = Math.max(0, total - pv);
      index = Math.min(index, maxIndex);

      apply();
    }

    function apply() {
      grid.style.transform = 'translate3d(' + (-index * step) + 'px,0,0)';
      prev.disabled = index <= 0;
      next.disabled = index >= maxIndex;
    }

    prev.addEventListener('click', function () {
      index = Math.max(0, index - 1);
      apply();
    });

    next.addEventListener('click', function () {
      index = Math.min(maxIndex, index + 1);
      apply();
    });

    window.addEventListener('resize', calc);
    calc();
  });
});
