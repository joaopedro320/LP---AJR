(function () {
  "use strict";

  // Número de WhatsApp (só dígitos, com 55 + DDD). Confirmar com o cliente antes de publicar.
  var WA_NUMBER = "5511948464283";
  var WA_DEFAULT = "Olá! Vim pelo site da AJR Marmoraria e gostaria de um orçamento.";

  // URL do Web App do Google Apps Script (Implantar > Nova implantação > App da Web).
  // Enquanto estiver vazia, o formulário manda a mensagem completa direto pro WhatsApp.
  var SCRIPT_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT";

  window.dataLayer = window.dataLayer || [];
  function track(event, data) {
    var payload = { event: event };
    for (var k in data) payload[k] = data[k];
    window.dataLayer.push(payload);
  }
  function waLink(text) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
  }

  // Links de WhatsApp
  document.querySelectorAll(".js-wa").forEach(function (a) {
    a.href = waLink(WA_DEFAULT);
    a.target = "_blank";
    a.rel = "noopener";
    a.addEventListener("click", function () {
      track("whatsapp_click", { origem: a.getAttribute("data-origem") || "site" });
    });
  });

  // Topbar sólida após rolar
  var bar = document.querySelector(".topbar");
  function onScroll() { bar.classList.toggle("is-solid", window.scrollY > 40); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Parallax leve no hero (desktop)
  var heroImg = document.querySelector(".hero__img");
  if (heroImg && !reduce && window.innerWidth > 820) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight);
        heroImg.style.transform = "scale(1.08) translateY(" + (y * 0.08) + "px)";
        ticking = false;
      });
    }, { passive: true });
  }

  // Barra de progresso de rolagem
  var prog = document.createElement("div");
  prog.className = "scroll-progress";
  prog.setAttribute("aria-hidden", "true");
  document.body.appendChild(prog);
  window.addEventListener("scroll", function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.transform = "scaleX(" + (h > 0 ? window.scrollY / h : 0) + ")";
  }, { passive: true });

  // Contadores do hero
  function countUp(el) {
    var to = parseInt(el.getAttribute("data-to"), 10);
    if (reduce) return;
    var dur = 1600, t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / dur, 1);
      var v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.textContent = v.toLocaleString("pt-BR");
      if (k < 1) requestAnimationFrame(step);
    }
    el.textContent = "0";
    setTimeout(function () { requestAnimationFrame(step); }, 800);
  }
  document.querySelectorAll(".js-count").forEach(countUp);

  // Índice para animação em sequência
  document.querySelectorAll(".stagger").forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty("--i", i); });
  });

  // Scroll reveal
  var items = document.querySelectorAll(".reveal, .stagger");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }

  // Lista de obras: troca a imagem
  var list = document.getElementById("worksList");
  var img = document.getElementById("worksImg");
  var cap = document.getElementById("worksCap");
  if (list && img) {
    var current = list.querySelector(".is-on");
    // pré-carrega as imagens
    list.querySelectorAll("button").forEach(function (b) {
      var p = new Image(); p.src = "assets/img/" + b.dataset.img + ".jpg";
    });
    // Mobile: cada obra ganha a própria foto e aparece ao rolar
    var mq = window.matchMedia("(max-width: 820px)");
    list.querySelectorAll("button").forEach(function (b) {
      var wrap = document.createElement("span");
      wrap.className = "w-img";
      var im = document.createElement("img");
      im.src = "assets/img/" + b.dataset.img + ".jpg";
      im.alt = b.dataset.alt;
      im.loading = "lazy";
      im.width = 800; im.height = 600;
      wrap.appendChild(im);
      b.insertBefore(wrap, b.firstChild);
    });
    var lis = list.querySelectorAll("li");
    if ("IntersectionObserver" in window) {
      var wio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-seen"); wio.unobserve(e.target); } });
      }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });
      lis.forEach(function (li) { wio.observe(li); });
    } else {
      lis.forEach(function (li) { li.classList.add("is-seen"); });
    }
    // Mobile: destaca a obra que está no meio da tela
    var mTick = false;
    window.addEventListener("scroll", function () {
      if (!mq.matches || mTick) return;
      mTick = true;
      requestAnimationFrame(function () {
        var mid = window.innerHeight / 2, best = null, dist = 1e9;
        lis.forEach(function (li) {
          var r = li.getBoundingClientRect();
          var d = Math.abs(r.top + r.height / 2 - mid);
          if (d < dist) { dist = d; best = li; }
        });
        list.querySelectorAll("button").forEach(function (b) { b.classList.toggle("is-on", best && b.parentElement === best); });
        mTick = false;
      });
    }, { passive: true });

    var timer;
    function show(btn) {
      if (mq.matches) return;
      if (btn === current) return;
      if (current) current.classList.remove("is-on");
      btn.classList.add("is-on");
      current = btn;
      clearTimeout(timer);
      img.classList.add("is-swapping");
      timer = setTimeout(function () {
        img.src = "assets/img/" + btn.dataset.img + ".jpg";
        img.alt = btn.dataset.alt;
        cap.textContent = btn.querySelector(".w-name").textContent + ", " + btn.querySelector(".w-meta").textContent.split(",")[0];
        img.onload = function () { img.classList.remove("is-swapping"); };
        if (img.complete) img.classList.remove("is-swapping");
      }, reduce ? 0 : 220);
    }
    list.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("mouseenter", function () { show(b); });
      b.addEventListener("focus", function () { show(b); });
      b.addEventListener("click", function () {
        show(b);
        track("obra_view", { obra: b.querySelector(".w-name").textContent });
      });
    });
  }

  // Formulário -> WhatsApp
  var form = document.getElementById("leadForm");
  if (form) {
    var send = document.getElementById("f-send");
    var note = document.getElementById("f-note");
    var tel = document.getElementById("f-tel");

    tel.addEventListener("input", function () {
      var d = tel.value.replace(/\D/g, "").slice(0, 11);
      var out = d;
      if (d.length > 2) out = "(" + d.slice(0, 2) + ") " + d.slice(2);
      if (d.length > 7) out = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(d.length - 4);
      tel.value = out;
    });
    tel.addEventListener("blur", function () {
      tel.classList.toggle("is-bad", tel.value !== "" && !tel.checkValidity());
    });

    function check() {
      var ok = form.checkValidity();
      send.disabled = !ok;
      note.textContent = ok ? "Tudo certo. Depois do envio você segue para o WhatsApp da AJR." : "Preencha os campos para liberar o envio.";
    }
    form.addEventListener("input", check);
    form.addEventListener("change", check);
    check();

    // Guarda UTMs e gclid da visita
    var qs = new URLSearchParams(window.location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"].forEach(function (key) {
      try { if (qs.get(key)) sessionStorage.setItem(key, qs.get(key)); } catch (e) {}
    });
    function stored(key) { try { return sessionStorage.getItem(key) || ""; } catch (e) { return ""; } }

    var scriptReady = /^https:\/\/script\.google\.com\//.test(SCRIPT_URL);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) { check(); return; }
      var f = form.elements;
      var lead = {
        nome: f.nome.value.trim(),
        telefone: f.telefone.value.trim(),
        local: f.local.value.trim(),
        servico: f.servico.value,
        material: f.material.value,
        mensagem: f.mensagem.value.trim(),
        pagina: window.location.href.split("?")[0],
        utm_source: stored("utm_source"),
        utm_medium: stored("utm_medium"),
        utm_campaign: stored("utm_campaign"),
        utm_term: stored("utm_term"),
        utm_content: stored("utm_content"),
        gclid: stored("gclid")
      };
      track("form_submit", { servico: lead.servico, material: lead.material });

      function fallbackWhatsApp() {
        var msg =
          "Olá! Preenchi o formulário no site da AJR Marmoraria.\n\n" +
          "Nome: " + lead.nome + "\n" +
          "WhatsApp: " + lead.telefone + "\n" +
          "Local da obra: " + lead.local + "\n" +
          "O que preciso: " + lead.servico + "\n" +
          "Material de interesse: " + lead.material +
          (lead.mensagem ? "\nDetalhes: " + lead.mensagem : "");
        window.location.href = waLink(msg);
      }

      if (!scriptReady) { fallbackWhatsApp(); return; }

      send.disabled = true;
      send.classList.add("is-loading");
      send.textContent = "Enviando...";
      note.textContent = "Registrando seu pedido.";

      var done = false;
      var guard = setTimeout(function () { if (!done) { done = true; window.location.href = "obrigado.html"; } }, 6000);
      fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: new URLSearchParams(lead).toString()
      }).then(function () {
        if (done) return;
        done = true; clearTimeout(guard);
        window.location.href = "obrigado.html";
      }).catch(function () {
        if (done) return;
        done = true; clearTimeout(guard);
        fallbackWhatsApp();
      });
    });
  }
})();
