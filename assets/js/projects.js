(function () {
  "use strict";
  var sec = document.getElementById("projetos");
  if (!sec) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = sec.querySelectorAll(".proj");
  var more = document.getElementById("projMore");

  // Cada foto abre de cima pra baixo quando entra na tela, em cascata
  function watch(list) {
    if (reduce || !("IntersectionObserver" in window)) {
      list.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      var k = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty("--d", (k++ * 90) + "ms");
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    list.forEach(function (el) { io.observe(el); });
  }
  watch(Array.prototype.filter.call(items, function (el) { return !el.classList.contains("is-extra"); }));

  if (more) {
    more.addEventListener("click", function () {
      sec.classList.add("is-open");
      more.setAttribute("aria-expanded", "true");
      var extra = Array.prototype.slice.call(sec.querySelectorAll(".proj.is-extra"));
      watch(extra);
      if (extra[0]) extra[0].querySelector("img").setAttribute("tabindex", "-1");
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "ver_mais_projetos" });
    });
  }
})();
