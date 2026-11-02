/* Insights search and topic filter. To add an article, add one card with data-tags (space separated tag ids) and data-keywords. */
(function () {
  var input = document.getElementById('insight-search');
  var chips = document.querySelectorAll('.tag-chip');
  var cards = document.querySelectorAll('.insight-card');
  var empty = document.getElementById('insight-empty');
  var count = document.getElementById('insight-count');
  if (!input || !cards.length) return;
  var active = 'all';
  function norm(t) { return (t || '').toLowerCase().replace(/[-\u2019']/g, ' ').replace(/\s+/g, ' '); }
  var index = Array.prototype.map.call(cards, function (c) {
    return norm(c.textContent + ' ' + (c.getAttribute('data-keywords') || '') + ' ' + (c.getAttribute('data-tags') || ''));
  });
  function apply(push) {
    var words = norm(input.value).trim().split(' ').filter(Boolean);
    var shown = 0;
    cards.forEach(function (c, i) {
      var tags = (c.getAttribute('data-tags') || '').split(/\s+/);
      var ok = (active === 'all' || tags.indexOf(active) > -1) &&
        words.every(function (w) { return index[i].indexOf(w) > -1; });
      c.hidden = !ok;
      if (ok) shown++;
    });
    empty.hidden = shown > 0;
    count.textContent = shown + (shown === 1 ? ' article' : ' articles');
    chips.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-tag') === active ? 'true' : 'false'); });
    if (push && window.history.replaceState) {
      var p = new URLSearchParams();
      if (active !== 'all') p.set('tag', active);
      if (input.value.trim()) p.set('q', input.value.trim());
      var qs = p.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
    }
  }
  chips.forEach(function (b) { b.addEventListener('click', function () { active = b.getAttribute('data-tag'); apply(true); }); });
  input.addEventListener('input', function () { apply(true); });
  var params = new URLSearchParams(location.search);
  var t = (params.get('tag') || '').toLowerCase();
  if (t && document.querySelector('.tag-chip[data-tag="' + t.replace(/[^a-z]/g, '') + '"]')) active = t;
  if (params.get('q')) input.value = params.get('q');
  apply(false);
})();
