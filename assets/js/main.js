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

  /* ---------- scroll progress + scrollspy ---------- */
  var progressBar = document.getElementById("progressBar");
  var spyLinks = document.querySelectorAll(".nav__links a[data-spy]");
  var spySections = [];
  spyLinks.forEach(function (a) {
    var sec = document.querySelector(a.getAttribute("href"));
    if (sec) spySections.push({ link: a, sec: sec });
  });

  var onScroll = function () {
    var doc = document.documentElement;
    var max = doc.scrollHeight - innerHeight;
    progressBar.style.transform = "scaleX(" + (max > 0 ? scrollY / max : 0) + ")";

    var pos = scrollY + 120;
    var active = null;
    spySections.forEach(function (s) {
      if (s.sec.offsetTop <= pos && (!active || s.sec.offsetTop > active.sec.offsetTop)) active = s;
    });
    spySections.forEach(function (s) {
      s.link.classList.toggle("is-active", s === active);
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  var ioBroken = false;
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
    setTimeout(function () {
      if (!ioFired) { ioBroken = true; revealAll(); initGlobe(); }
    }, 1200);
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
    var prefix = (el.getAttribute("data-prefix") || "").replace("&lt;", "<");
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

  var formatJson = function (obj) { return JSON.stringify(obj, null, 2); };

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

  /* ============================================================
     COVERAGE GLOBE
     Lazy-loads globe.gl + world topology from CDN when the
     section approaches the viewport. Hover a country → response
     times (simulated unless overridden in latency-data.js).
     ============================================================ */

  var GLOBE_LIB = "https://cdn.jsdelivr.net/npm/globe.gl@2.34.5/dist/globe.gl.min.js";
  var TOPO_LIB = "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js";
  var WORLD_DATA = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";

  var POPS = [
    { code: "EU-WEST", lat: 52.37, lng: 4.9 },
    { code: "US-EAST", lat: 39.04, lng: -77.49 },
    { code: "AP-SOUTH", lat: 1.35, lng: 103.82 }
  ];

  var globeWrap = document.getElementById("globeWrap");
  var globeEl = document.getElementById("globeViz");
  var globeStarted = false;
  var globeInstance = null;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("failed: " + src)); };
      document.head.appendChild(s);
    });
  }

  function hashStr(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }

  // rough centroid of a country's largest ring
  function centroidOf(feature) {
    var g = feature.geometry;
    var rings = g.type === "Polygon" ? [g.coordinates[0]] :
      g.coordinates.map(function (p) { return p[0]; });
    var best = rings[0];
    rings.forEach(function (r) { if (r.length > best.length) best = r; });
    var lat = 0, lng = 0;
    best.forEach(function (pt) { lng += pt[0]; lat += pt[1]; });
    return { lat: lat / best.length, lng: lng / best.length };
  }

  function distKm(a, b) {
    var rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad;
    var dLng = (b.lng - a.lng) * rad;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.lat * rad) * Math.cos(b.lat * rad) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 6371 * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  }

  function nearestPop(c) {
    var best = POPS[0], bestD = Infinity;
    POPS.forEach(function (p) {
      var d = distKm(c, p);
      if (d < bestD) { bestD = d; best = p; }
    });
    return { pop: best, km: bestD };
  }

  // Stable per-country response times. Real values from
  // latency-data.js (window.NUMID_LATENCY) take precedence;
  // everything else gets a plausible simulated figure derived
  // from distance to the nearest PoP, kept inside the
  // advertised p95 envelopes (<300ms MNP, <800ms HLR).
  function latencyFor(feature) {
    var name = feature.properties.name;
    var c = centroidOf(feature);
    var near = nearestPop(c);
    var override = (window.NUMID_LATENCY || {})[name];
    if (override && override.mnp && override.hlr) {
      return { name: name, mnp: override.mnp, hlr: override.hlr, pop: near.pop.code, real: true };
    }
    var h = hashStr(name);
    var mnp = Math.round(85 + near.km * 0.009 + (h % 55));
    mnp = Math.min(mnp, 290);
    var hlr = Math.round(mnp * 1.9 + 160 + (h % 180));
    hlr = Math.min(hlr, 780);
    return { name: name, mnp: mnp, hlr: hlr, pop: near.pop.code, real: false };
  }

  function showGlobeFallback() {
    document.getElementById("globeFallback").hidden = false;
  }

  function initGlobe() {
    if (globeStarted || !globeEl) return;
    globeStarted = true;

    Promise.all([loadScript(GLOBE_LIB), loadScript(TOPO_LIB)])
      .then(function () { return fetch(WORLD_DATA); })
      .then(function (r) {
        if (!r.ok) throw new Error("world data " + r.status);
        return r.json();
      })
      .then(function (world) { buildGlobe(world); })
      .catch(function () { showGlobeFallback(); });
  }

  function buildGlobe(world) {
    var countries = window.topojson
      .feature(world, world.objects.countries)
      .features.filter(function (f) { return f.properties.name !== "Antarctica"; });

    var covTitle = document.getElementById("covTitle");
    var covDefault = document.getElementById("covDefault");
    var covCountry = document.getElementById("covCountry");
    var covMnp = document.getElementById("covMnp");
    var covHlr = document.getElementById("covHlr");
    var covPop = document.getElementById("covPop");

    var CAP_IDLE = "rgba(245, 245, 242, 0.08)";
    var CAP_HOT = "#f2df00";
    var hovered = null;

    var globe = window.Globe()(globeEl)
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .atmosphereColor("#f2df00")
      .atmosphereAltitude(0.12)
      .polygonsData(countries)
      .polygonCapColor(function (d) { return d === hovered ? CAP_HOT : CAP_IDLE; })
      .polygonSideColor(function () { return "rgba(242, 223, 0, 0.03)"; })
      .polygonStrokeColor(function () { return "rgba(245, 245, 242, 0.3)"; })
      .polygonAltitude(function (d) { return d === hovered ? 0.045 : 0.008; })
      .polygonsTransitionDuration(200)
      .polygonLabel(function (d) {
        var L = latencyFor(d);
        return '<div class="tt-name">' + L.name + "</div>" +
          '<div class="tt-row"><span>MNP</span> ' + L.mnp + "ms · <span>HLR</span> " + L.hlr + "ms</div>" +
          '<div class="tt-row"><span>PoP</span> ' + L.pop + "</div>";
      })
      .onPolygonHover(function (d) {
        hovered = d;
        globe.polygonAltitude(function (p) { return p === hovered ? 0.045 : 0.008; })
          .polygonCapColor(function (p) { return p === hovered ? CAP_HOT : CAP_IDLE; });
        if (d) {
          var L = latencyFor(d);
          covTitle.textContent = L.name.toUpperCase();
          covMnp.textContent = L.mnp + " ms";
          covHlr.textContent = L.hlr + " ms";
          covPop.textContent = L.pop;
          covDefault.hidden = true;
          covCountry.hidden = false;
        } else {
          covTitle.textContent = "GLOBAL NETWORK";
          covDefault.hidden = false;
          covCountry.hidden = true;
        }
      })
      .pointsData(POPS)
      .pointLat("lat").pointLng("lng")
      .pointColor(function () { return "#f2df00"; })
      .pointAltitude(0.02)
      .pointRadius(0.55)
      .labelsData(POPS)
      .labelLat("lat").labelLng("lng")
      .labelText("code")
      .labelSize(1.1)
      .labelDotRadius(0)
      .labelColor(function () { return "#f2df00"; })
      .labelAltitude(0.035);

    // demo traffic arcs: a few countries → their nearest PoP
    var arcSources = ["United States of America", "Brazil", "Germany", "Spain",
      "Nigeria", "India", "Japan", "Australia", "United Kingdom", "Mexico"];
    var arcs = [];
    countries.forEach(function (f) {
      if (arcSources.indexOf(f.properties.name) === -1) return;
      var c = centroidOf(f);
      var near = nearestPop(c);
      arcs.push({ startLat: c.lat, startLng: c.lng, endLat: near.pop.lat, endLng: near.pop.lng });
    });
    globe.arcsData(arcs)
      .arcColor(function () { return ["rgba(242,223,0,0)", "rgba(242,223,0,0.55)"]; })
      .arcStroke(0.28)
      .arcAltitudeAutoScale(0.4)
      .arcDashLength(0.35)
      .arcDashGap(2.2)
      .arcDashAnimateTime(reducedMotion ? 0 : 3200);

    // dark globe surface
    var mat = globe.globeMaterial();
    mat.color.set("#0c0c0c");
    mat.emissive.set("#0a0a08");
    mat.shininess = 4;

    var controls = globe.controls();
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.55;
    controls.enableZoom = false;

    globe.pointOfView({ lat: 24, lng: 5, altitude: 2.1 });

    var size = function () {
      globe.width(globeWrap.clientWidth).height(globeWrap.clientHeight);
    };
    size();
    addEventListener("resize", size);

    globeInstance = globe;
  }

  // lazy-init when the coverage section approaches the viewport
  if ("IntersectionObserver" in window) {
    var globeIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            initGlobe();
            globeIo.disconnect();
          }
        });
      },
      { rootMargin: "1200px 0px" }
    );
    if (globeWrap) globeIo.observe(globeWrap);
  } else if (globeWrap) {
    initGlobe();
  }

  // exposed for testing / future tweaks
  window.__numid = { latencyFor: latencyFor, initGlobe: initGlobe, globe: function () { return globeInstance; } };
})();
