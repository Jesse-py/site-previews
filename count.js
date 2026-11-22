// Visit counter for previews (GoatCounter, no cookies). Does nothing until CODE is set.
(function () {
  var CODE = 'jessepreviews';
  if (!CODE || location.hostname !== 'jesse-py.github.io') return;
  try { if (localStorage.getItem('skipgc') === 't') return; } catch (e) {}
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', 'https://' + CODE + '.goatcounter.com/count');
  document.head.appendChild(s);
})();
