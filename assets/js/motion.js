(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var vh = window.innerHeight;
  window.addEventListener("resize", function () { vh = window.innerHeight; layoutSteps(); });

  // ---------- Títulos: quebra em palavras ----------
  function split(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span class="wi" style="--wi:' + i + '">' + w + "</span></span>";
    }).join(" ");
    el.classList.add("split");
  }
  var h1 = document.querySelector(".hero h1");
  if (h1) {
    split(h1);
    h1.style.setProperty("--wd", "150ms");
    requestAnimationFrame(function () { requestAnimationFrame(function () { h1.classList.add("is-in"); }); });
  }
  var heads = document.querySelectorAll("main h2");
  heads.forEach(split);
  if ("IntersectionObserver" in window && !reduce) {
    var hio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); hio.unobserve(e.target); } });
    }, { threshold: 0.4 });
    heads.forEach(function (h) { hio.observe(h); });
  } else {
    heads.forEach(function (h) { h.classList.add("is-in"); });
  }

  // ---------- Citação: palavras acendem com a rolagem ----------
  var quote = document.querySelector(".js-quote");
  var qWords = [];
  if (quote) {
    quote.innerHTML = quote.textContent.trim().split(/\s+/).map(function (w) {
      return '<span class="qw">' + w + "</span>";
    }).join(" ");
    qWords = quote.querySelectorAll(".qw");
  }

  // ---------- Linha das etapas ----------
  var steps = document.getElementById("steps");
  var stepLine = steps && steps.querySelector(".steps__line");
  var stepItems = steps ? steps.querySelectorAll("li") : [];
  function layoutSteps() {
    if (!stepLine || !stepItems.length) return;
    var first = stepItems[0], last = stepItems[stepItems.length - 1];
    var base = first.offsetTop + first.offsetParent.offsetTop;
    stepLine.style.top = (base + 29) + "px";
    stepLine.style.bottom = "auto";
    stepLine.style.height = Math.max(0, last.offsetTop - first.offsetTop) + "px";
  }
  layoutSteps();
  window.addEventListener("load", layoutSteps);

  if (reduce) {
    qWords.forEach && qWords.forEach(function (w) { w.classList.add("on"); });
    stepItems.forEach && stepItems.forEach(function (li) { li.classList.add("is-lit"); });
    return;
  }

  // ---------- Loop de rolagem ----------
  var parallax = document.querySelectorAll(".piece img, .detail__img img");
  var bands = document.querySelectorAll(".band__row");
  var storyLogo = document.querySelector(".story__logo");
  var bar = document.querySelector(".topbar");
  var lastY = window.scrollY, velocity = 0, bandX = 0, ticking = false;

  function progress(el) {
    var r = el.getBoundingClientRect();
    return (vh - r.top) / (vh + r.height); // 0 entrando por baixo, 1 saindo por cima
  }

  function frame() {
    var y = window.scrollY;
    var dy = y - lastY;
    lastY = y;
    velocity += (dy - velocity) * 0.2;

    // header some ao descer
    if (bar) bar.classList.toggle("is-hidden", y > 400 && dy > 4);
    if (bar && dy < -4) bar.classList.remove("is-hidden");

    parallax.forEach(function (img) {
      var p = progress(img.parentElement);
      if (p < -0.2 || p > 1.2) return;
      img.style.setProperty("--py", ((p - 0.5) * -60).toFixed(1) + "px");
    });

    if (storyLogo) {
      var sp = Math.min(1, Math.max(0, progress(storyLogo)));
      storyLogo.style.setProperty("--rot", ((sp - 0.5) * 40).toFixed(1) + "deg");
    }

    if (steps) {
      var r = steps.getBoundingClientRect();
      var k = Math.min(1, Math.max(0, (vh * 0.65 - r.top) / (r.height * 0.85)));
      steps.style.setProperty("--sp", k.toFixed(3));
      stepItems.forEach(function (li, i) {
        var on = k >= i / stepItems.length;
        li.classList.toggle("is-lit", on);
        li.classList.toggle("is-dim", !on);
      });
    }

    if (qWords.length) {
      var qp = Math.min(1, Math.max(0, (vh * 0.85 - quote.getBoundingClientRect().top) / (vh * 0.45)));
      var lit = Math.round(qp * qWords.length);
      for (var i = 0; i < qWords.length; i++) qWords[i].classList.toggle("on", i < lit);
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }, { passive: true });
  frame();

  // Faixas de materiais: andam sozinhas e aceleram com a rolagem
  function bandLoop() {
    velocity *= 0.95;
    bandX -= 0.6 + Math.min(Math.abs(velocity), 60) * 0.35;
    bands.forEach(function (row) {
      var half = row.scrollWidth / 2;
      var dir = parseFloat(row.getAttribute("data-dir")) || 1;
      var x = ((bandX % half) + half) % half;
      var skew = Math.max(-8, Math.min(8, velocity * 0.25));
      row.style.transform = "translate3d(" + (dir > 0 ? -x : x - half) + "px,0,0) skewX(" + (-skew * dir).toFixed(2) + "deg)";
    });
    requestAnimationFrame(bandLoop);
  }
  if (bands.length) requestAnimationFrame(bandLoop);

  if (!fine) return;

  // ---------- Luz que segue o mouse no hero ----------
  var hero = document.getElementById("hero");
  var glow = hero && hero.querySelector(".hero__glow");
  if (hero && glow) {
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      glow.style.setProperty("--mx", (e.clientX - r.left) + "px");
      glow.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  }

  // ---------- Tilt 3D nos cards ----------
  document.querySelectorAll(".piece").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transition = "transform .15s linear, box-shadow .5s";
      card.style.transform = "perspective(900px) rotateX(" + (-py * 7).toFixed(2) + "deg) rotateY(" + (px * 9).toFixed(2) + "deg) translateY(-6px)";
    });
    card.addEventListener("mouseleave", function () {
      card.style.transition = "transform .6s cubic-bezier(.2,.7,.2,1), box-shadow .5s";
      card.style.transform = "";
    });
  });

  // ---------- Botões magnéticos ----------
  document.querySelectorAll(".btn--stone, .btn--navy, .btn--ghost, .wa-float").forEach(function (b) {
    b.classList.add("magnet");
    b.addEventListener("mousemove", function (e) {
      if (b.disabled) return;
      var r = b.getBoundingClientRect();
      var x = e.clientX - r.left - r.width / 2;
      var y = e.clientY - r.top - r.height / 2;
      b.style.transform = "translate(" + (x * 0.22).toFixed(1) + "px," + (y * 0.32).toFixed(1) + "px)";
    });
    b.addEventListener("mouseleave", function () { b.style.transform = ""; });
  });
})();
