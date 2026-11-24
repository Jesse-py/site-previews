// Open-now status from their posted hours (Eastern time, closed Wednesdays), today's hours row,
// menu search, and the section chip that matches what's on screen.
(function () {
  var HOURS = window.HOURS || [];
  var DAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Current day (0 = Monday) and minutes since midnight in New Paltz, NY.
  function easternNow(d) {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(d || new Date());
    var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
    return { day: DAY.indexOf(get('weekday')), min: (+get('hour') % 24) * 60 + (+get('minute')) };
  }
  function mins(t) { var a = t.split(':'); return +a[0] * 60 + +a[1]; }
  function fmt(t) { var m = mins(t), h = Math.floor(m / 60) % 24, mm = m % 60; return ((h + 11) % 12 + 1) + (mm ? ':' + String(mm).padStart(2, '0') : '') + (h >= 12 ? ' PM' : ' AM'); }

  // Returns { open: bool, text } for a given moment. Exposed for test.js.
  function status(now) {
    var h = HOURS[now.day];
    if (h && now.min < mins(h[0])) return { open: false, text: 'Closed now · opens today at ' + fmt(h[0]) };
    if (h && now.min < mins(h[1])) return { open: true, text: 'Open now · until ' + fmt(h[1]) };
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7, n = HOURS[d];
      if (n) return { open: false, text: 'Closed now · opens ' + (i === 1 ? 'tomorrow' : DAY[d]) + ' at ' + fmt(n[0]) };
    }
    return { open: false, text: '' };
  }
  window.BoxMenu = { status: status, easternNow: easternNow };

  var now = easternNow();
  var s = status(now), el = document.getElementById('status');
  if (el && s.text) { el.className = 'status' + (s.open ? ' open' : ''); el.innerHTML = '<span class="dot" aria-hidden="true"></span>' + s.text; }
  var row = document.querySelector('.hours tr[data-day="' + now.day + '"]');
  if (row) row.classList.add('today-row');

  // Search: hide items (and whole sections) that don't match every typed word.
  var q = document.getElementById('q'), none = document.getElementById('none');
  var secs = [].slice.call(document.querySelectorAll('main .sec[id]'));
  var photos = document.querySelector('.photos');
  function filter() {
    var words = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean), any = false;
    secs.forEach(function (sec) {
      var hits = 0;
      sec.querySelectorAll('[data-s]').forEach(function (it) {
        var ok = words.every(function (w) { return it.getAttribute('data-s').indexOf(w) !== -1; });
        it.hidden = !ok; if (ok) hits++;
      });
      var extra = sec.querySelectorAll('[data-s]').length === 0;
      sec.hidden = words.length > 0 && (extra || hits === 0);
      if (!sec.hidden && hits) any = true;
    });
    if (photos) photos.hidden = words.length > 0;
    none.hidden = !(words.length && !any);
  }
  q.addEventListener('input', filter);
  document.getElementById('dock-search').addEventListener('click', function (ev) { ev.preventDefault(); q.focus(); scrollTo(0, document.getElementById('menu').offsetTop); });

  // Highlight the chip for the section in view and keep it visible in the chip row.
  var chips = {};
  document.querySelectorAll('.chips a').forEach(function (a) { chips[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(chips).forEach(function (k) { chips[k].classList.toggle('on', k === en.target.id); });
        var c = chips[en.target.id];
        if (!c) return;  // hours has no chip
        var row = c.parentNode;
        row.scrollTo({ left: c.offsetLeft - row.clientWidth / 2 + c.clientWidth / 2, behavior: 'auto' });
      });
    }, { rootMargin: '-130px 0px -65% 0px' });
    secs.forEach(function (s) { io.observe(s); });
  }
})();
