/* num-iD — interactions */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById("navBurger");
  var links = document.getElementById("navLinks");

  burger.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });

  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      links.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  var revealAll = function () {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  };
  if ("IntersectionObserver" in window && !reducedMotion) {
    var ioFired = false;
    var io = new IntersectionObserver(
      function (entries) {
        ioFired = true;
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
    // safety net: if the observer never fires (odd embed/renderer), show everything
    setTimeout(function () { if (!ioFired) revealAll(); }, 1200);
  } else {
    revealAll();
  }

  /* ---------- hero terminal loop ---------- */
  var steps = document.querySelectorAll("#heroTerminal .tstep");
  if (steps.length && !reducedMotion) {
    var current = 0;
    var cycle = function () {
      if (current > steps.length) {
        steps.forEach(function (s) { s.classList.remove("is-on"); });
        current = 0;
      } else {
        for (var i = 0; i < current; i++) steps[i].classList.add("is-on");
      }
      current++;
      setTimeout(cycle, current > steps.length ? 1600 : 900);
    };
    cycle();
  } else {
    steps.forEach(function (s) { s.classList.add("is-on"); });
  }

  /* ---------- stats count-up ---------- */
  var statEls = document.querySelectorAll(".stat__num[data-count]");
  var animateStat = function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    prefix = prefix.replace("&lt;", "<");
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = (String(el.getAttribute("data-count")).split(".")[1] || "").length;
    var t0 = Date.now();
    var dur = 1400;
    var timer = setInterval(function () {
      var p = Math.min((Date.now() - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p >= 1) clearInterval(timer);
    }, 24);
  };

  if ("IntersectionObserver" in window && !reducedMotion) {
    var statIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateStat(entry.target);
            statIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statEls.forEach(function (el) { statIo.observe(el); });
  }

  /* ---------- API demo ---------- */
  var service = "mnp";
  var tabs = document.querySelectorAll(".demo__tab");
  var msisdnInput = document.getElementById("demoMsisdn");
  var curlMsisdn = document.getElementById("curlMsisdn");
  var curlService = document.getElementById("curlService");
  var runBtn = document.getElementById("demoRun");
  var authEl = document.getElementById("demoAuth");
  var metaEl = document.getElementById("demoMeta");
  var jsonEl = document.getElementById("demoJson");
  var copyBtn = document.getElementById("demoCopy");

  var responses = {
    mnp: function (tn) {
      return {
        tn: tn, oc: "ES", mcc: "214", mnc: "07",
        on: "TELEFÓNICA MÓVILES ESPAÑA", od: "87240034",
        nt: "wireless", pdi: true, pi: false, rc: "1-00"
      };
    },
    hlr: function (tn) {
      return {
        tn: tn, oc: "ES", mcc: "214", mnc: "07",
        on: "TELEFÓNICA MÓVILES ESPAÑA",
        vn: "214-07", sn: "reachable", roaming: false, rc: "1-00"
      };
    }
  };

  var formatJson = function (obj) {
    return JSON.stringify(obj, null, 2);
  };

  var sanitizeMsisdn = function () {
    var v = msisdnInput.value.replace(/[^\d]/g, "").slice(0, 15);
    msisdnInput.value = v;
    return v || "34630081191";
  };

  var syncCurl = function () {
    curlMsisdn.textContent = sanitizeMsisdn();
    curlService.textContent = service;
  };

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      service = tab.getAttribute("data-service");
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      syncCurl();
      jsonEl.textContent = formatJson(responses[service](sanitizeMsisdn()));
    });
  });

  msisdnInput.addEventListener("input", syncCurl);

  var typeJson = function (text, done) {
    if (reducedMotion) {
      jsonEl.textContent = text;
      if (done) done();
      return;
    }
    jsonEl.textContent = "";
    var i = 0;
    var timer = setInterval(function () {
      // type in chunks for speed
      i = Math.min(i + 6, text.length);
      jsonEl.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(timer);
        if (done) done();
      }
    }, 16);
  };

  var running = false;
  runBtn.addEventListener("click", function () {
    if (running) return;
    running = true;
    var tn = sanitizeMsisdn();
    syncCurl();
    metaEl.classList.remove("is-visible");
    authEl.classList.add("is-live");
    authEl.textContent = "AUTH · SOURCE IP ✓";
    jsonEl.textContent = "…";
    var latency = 150 + Math.floor(Math.random() * 120);
    setTimeout(function () {
      metaEl.querySelector(".demo__ms").textContent = latency + "ms";
      metaEl.classList.add("is-visible");
      typeJson(formatJson(responses[service](tn)), function () {
        running = false;
        setTimeout(function () {
          authEl.classList.remove("is-live");
          authEl.textContent = "AUTH · SOURCE IP";
        }, 1200);
      });
    }, reducedMotion ? 0 : 450);
  });

  copyBtn.addEventListener("click", function () {
    var text = jsonEl.textContent;
    var flash = function () {
      copyBtn.textContent = "Copied ✓";
      setTimeout(function () { copyBtn.textContent = "Copy JSON"; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(flash, flash);
    } else {
      flash();
    }
  });

  /* ---------- use-case matrix ---------- */
  var audBtns = document.querySelectorAll(".matrix__aud");
  var caseEls = document.querySelectorAll(".matrix__case");

  var selectAud = function (aud) {
    audBtns.forEach(function (b) {
      var active = b.getAttribute("data-aud") === aud;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
    caseEls.forEach(function (c) {
      var list = (c.getAttribute("data-for") || "").split(/\s+/);
      c.classList.toggle("is-on", list.indexOf(aud) !== -1);
    });
  };

  audBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      selectAud(b.getAttribute("data-aud"));
    });
  });

  selectAud("carriers");
})();
