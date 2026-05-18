/* "Partekatu" — Web Share API, esteka kopiatzeko ordezkoarekin.
   Kanpoko script edo jarraipenik gabe. */
(function () {
  var el = document.getElementById('partekatu');
  if (!el) return;

  el.addEventListener('click', function (e) {
    e.preventDefault();
    var url = window.location.href;
    var title = document.title;

    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(function () {});
      return;
    }

    function flash() {
      var prev = el.textContent;
      el.textContent = 'Kopiatua!';
      setTimeout(function () { el.textContent = prev; }, 1800);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(flash).catch(function () {
        window.prompt('Kopiatu esteka:', url);
      });
    } else {
      window.prompt('Kopiatu esteka:', url);
    }
  });
})();
