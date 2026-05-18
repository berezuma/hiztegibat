(function () {
  'use strict'

  var ROUND_SIZE = 10

  var raw = document.getElementById('hutsunea-data').textContent
  var data = JSON.parse(raw)
  var ALL = data.questions

  // Aukerak ateratzeko: deklinatutako forma bakarrak (originalForm).
  var FORMS_POOL = (function () {
    var seen = {}
    var out = []
    for (var i = 0; i < ALL.length; i++) {
      var o = ALL[i].o
      if (!seen[o]) { seen[o] = true; out.push(o) }
    }
    return out
  })()

  var questions = []
  var idx = 0
  var score = 0

  function shuffled(arr) {
    var a = arr.slice()
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1))
      var t = a[i]; a[i] = a[j]; a[j] = t
    }
    return a
  }

  function pickDistractors(correctForm) {
    var pool = FORMS_POOL.filter(function (f) { return f !== correctForm })
    return shuffled(pool).slice(0, 3)
  }

  function buildQuoteHtml(maskedText) {
    // Replace `___` with a row of visible underscores wrapped in a styled span.
    var esc = function (s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }
    var parts = maskedText.split('___')
    return esc(parts[0]) + '<span class="blank">__________</span>' + esc(parts.slice(1).join('___'))
  }

  function startRound() {
    questions = shuffled(ALL).slice(0, ROUND_SIZE)
    idx = 0
    score = 0
    document.getElementById('end').hidden = true
    document.getElementById('question').hidden = false
    document.getElementById('options').hidden = false
    showQuestion()
  }

  function updateHeader() {
    document.getElementById('progress-meta').textContent = (idx + 1) + '. galdera.'
    document.getElementById('score-badge').textContent = 'Puntuak: ' + score
    var pct = (idx / questions.length) * 100
    document.getElementById('progress-bar-fill').style.width = pct + '%'
  }

  function showQuestion() {
    if (idx >= questions.length) { showEnd(); return }
    var q = questions[idx]
    document.getElementById('quote').innerHTML = buildQuoteHtml(q.m)
    document.getElementById('song').textContent = '— «' + q.s + '»'

    var opts = shuffled([q.o].concat(pickDistractors(q.o)))
    var optsEl = document.getElementById('options')
    optsEl.innerHTML = ''
    opts.forEach(function (opt) {
      var btn = document.createElement('button')
      btn.textContent = opt
      btn.dataset.form = opt
      btn.addEventListener('click', function () { handleAnswer(opt, q) })
      optsEl.appendChild(btn)
    })

    var fb = document.getElementById('feedback')
    fb.hidden = true
    fb.innerHTML = ''
    fb.classList.remove('is-correct', 'is-wrong')

    updateHeader()
  }

  function handleAnswer(chosen, q) {
    var ok = chosen === q.o
    if (ok) score++

    var btns = document.querySelectorAll('#options button')
    for (var i = 0; i < btns.length; i++) {
      btns[i].disabled = true
      if (btns[i].dataset.form === q.o) btns[i].classList.add('correct')
      else if (btns[i].dataset.form === chosen) btns[i].classList.add('wrong')
    }

    var fb = document.getElementById('feedback')
    fb.hidden = false
    fb.classList.add(ok ? 'is-correct' : 'is-wrong')

    var entryHref = 'berbak/' + q.l + '.html#' + q.h.toLowerCase()

    var status = document.createElement('p')
    status.className = 'fb-status'
    if (ok) {
      status.textContent = '✓ Ondo!'
    } else {
      status.appendChild(document.createTextNode('✗ Oker — erantzun zuzena: '))
      var statusLink = document.createElement('a')
      statusLink.href = entryHref
      statusLink.textContent = q.o
      statusLink.className = 'answer-link'
      status.appendChild(statusLink)
    }
    fb.appendChild(status)

    var reveal = document.createElement('p')
    reveal.className = 'reveal'
    reveal.innerHTML = '«' + q.m.replace('___',
      '<a href="' + entryHref + '" class="answer-link"><strong>' + q.o + '</strong></a>') + '»'
    fb.appendChild(reveal)

    var nextBtn = document.createElement('button')
    nextBtn.className = 'next'
    nextBtn.textContent = idx + 1 === questions.length ? 'Emaitza ikusi' : 'Hurrengoa →'
    nextBtn.addEventListener('click', function () { idx++; showQuestion() })
    fb.appendChild(nextBtn)

    // Eguneratu score-badge berehala
    document.getElementById('score-badge').textContent = 'Puntuak: ' + score
  }

  function showEnd() {
    document.getElementById('question').hidden = true
    document.getElementById('options').hidden = true
    document.getElementById('feedback').hidden = true
    document.getElementById('progress-meta').textContent = 'Bukatuta'
    document.getElementById('progress-bar-fill').style.width = '100%'
    document.getElementById('end').hidden = false
    document.getElementById('final-score').textContent = score + ' / ' + questions.length
  }

  document.getElementById('restart').addEventListener('click', startRound)
  startRound()
})()
