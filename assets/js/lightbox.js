(function () {
  "use strict";
  // Fotos que abrem em tela cheia ao clicar
  var SELECTOR = ".hero__img, .piece img, .detail__img img, .works__view img, .w-img img";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Monta o visualizador
  var lb = document.createElement("div");
  lb.className = "lb";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Foto em tela cheia");
  lb.hidden = true;
  lb.innerHTML =
    '<button type="button" class="lb__close" aria-label="Fechar foto">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
    '<button type="button" class="lb__nav lb__prev" aria-label="Foto anterior">' +
      '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
    '<figure class="lb__stage"><img class="lb__img" alt=""><figcaption class="lb__cap"></figcaption></figure>' +
    '<button type="button" class="lb__nav lb__next" aria-label="Próxima foto">' +
      '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
    '<p class="lb__count" aria-live="polite"></p>';
  document.body.appendChild(lb);

  var img = lb.querySelector(".lb__img");
  var cap = lb.querySelector(".lb__cap");
  var count = lb.querySelector(".lb__count");
  var list = [], idx = 0, lastFocus = null;

  function visible(el) { return el.offsetParent !== null || el.getClientRects().length > 0; }

  function collect() {
    var seen = {}, out = [];
    document.querySelectorAll(SELECTOR).forEach(function (el) {
      if (!visible(el)) return;
      var src = el.currentSrc || el.src;
      if (seen[src]) return;
      seen[src] = 1;
      out.push({ src: src, alt: el.alt || "" });
    });
    // No computador a vitrine de obras mostra uma foto por vez: inclui todas na galeria
    var view = document.querySelector(".works__view");
    if (view && visible(view)) {
      document.querySelectorAll("#worksList button[data-img]").forEach(function (b) {
        var a = document.createElement("a");
        a.href = "assets/img/" + b.dataset.img + ".jpg";
        if (seen[a.href]) return;
        seen[a.href] = 1;
        out.push({ src: a.href, alt: b.dataset.alt || "" });
      });
    }
    return out;
  }

  function render(dir) {
    var it = list[idx];
    if (!it) return;
    img.classList.remove("is-in", "from-l", "from-r");
    if (dir) img.classList.add(dir > 0 ? "from-r" : "from-l");
    img.src = it.src;
    img.alt = it.alt;
    cap.textContent = it.alt;
    count.textContent = (idx + 1) + " de " + list.length;
    var go = function () { requestAnimationFrame(function () { img.classList.add("is-in"); }); };
    if (img.complete) go(); else img.onload = go;
    var multi = list.length > 1;
    lb.querySelector(".lb__prev").hidden = !multi;
    lb.querySelector(".lb__next").hidden = !multi;
    count.hidden = !multi;
  }

  function open(el) {
    list = collect();
    var src = el.currentSrc || el.src;
    idx = Math.max(0, list.findIndex(function (it) { return it.src === src; }));
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.documentElement.classList.add("lb-open");
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    render(0);
    lb.querySelector(".lb__close").focus();
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "foto_fullscreen", foto: list[idx] ? list[idx].alt : "" });
  }

  function close() {
    lb.classList.remove("is-open");
    document.documentElement.classList.remove("lb-open");
    setTimeout(function () { lb.hidden = true; img.removeAttribute("src"); }, reduce ? 0 : 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function step(d) {
    if (list.length < 2) return;
    idx = (idx + d + list.length) % list.length;
    render(d);
  }

  // Clique nas fotos (delegado, funciona também nas fotos criadas por script)
  document.addEventListener("click", function (e) {
    if (!lb.hidden) return;
    var t = e.target;
    var card = t.closest && t.closest(".piece:not(.piece--cta)");
    var target = null;
    if (t.matches && t.matches(SELECTOR)) target = t;
    else if (card && !t.closest("a, button")) target = card.querySelector("img");
    else if (t.closest && t.closest(".works__view, .hero__media, .detail__img")) target = t.closest(".works__view, .hero__media, .detail__img").querySelector("img");
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    open(target);
  }, true);

  lb.querySelector(".lb__close").addEventListener("click", close);
  lb.querySelector(".lb__prev").addEventListener("click", function () { step(-1); });
  lb.querySelector(".lb__next").addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb__stage")) close(); });

  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "Tab") {
      var f = Array.prototype.filter.call(lb.querySelectorAll("button"), function (b) { return !b.hidden; });
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  // Arrastar para o lado no celular
  var x0 = null, y0 = null;
  lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
    x0 = y0 = null;
  });
})();
