(function () {
  var grid = document.getElementById("shop-grid");
  if (!grid) return;
  var items = Array.prototype.slice.call(grid.querySelectorAll(".shop-item"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".shop-cat"));
  var q = document.getElementById("shop-q");
  var sort = document.getElementById("shop-sort");
  var pmin = document.getElementById("price-min");
  var pmax = document.getElementById("price-max");
  var count = document.getElementById("shop-count");
  var empty = document.getElementById("shop-empty");
  var valid = { all: 1 };
  chips.forEach(function (c) { valid[c.getAttribute("data-cat")] = 1; });
  document.querySelectorAll("[data-js-only]").forEach(function (el) { el.hidden = false; });

  var state = { cat: "all", q: "", sort: "featured", min: "", max: "" };

  function readUrl() {
    var p = new URLSearchParams(window.location.search);
    var cat = p.get("category") || (window.location.hash || "").replace("#", "");
    state.cat = valid[cat] ? cat : "all";
    state.q = p.get("q") || "";
    var s = p.get("sort");
    state.sort = ["featured", "price-asc", "price-desc", "name-asc"].indexOf(s) > -1 ? s : "featured";
    state.min = p.get("min") || "";
    state.max = p.get("max") || "";
    q.value = state.q; sort.value = state.sort; pmin.value = state.min; pmax.value = state.max;
  }

  function writeUrl() {
    var p = new URLSearchParams();
    if (state.cat !== "all") p.set("category", state.cat);
    if (state.q) p.set("q", state.q);
    if (state.sort !== "featured") p.set("sort", state.sort);
    if (state.min) p.set("min", state.min);
    if (state.max) p.set("max", state.max);
    var s = p.toString();
    history.replaceState(null, "", window.location.pathname + (s ? "?" + s : ""));
  }

  function price(el) {
    var v = el.getAttribute("data-price");
    return v === null ? null : parseFloat(v);
  }

  function render() {
    var term = state.q.trim().toLowerCase();
    var min = state.min === "" ? null : parseFloat(state.min);
    var max = state.max === "" ? null : parseFloat(state.max);
    var shown = 0;
    items.forEach(function (el) {
      var ok = state.cat === "all" || el.getAttribute("data-cat") === state.cat;
      if (ok && term) ok = el.textContent.toLowerCase().indexOf(term) > -1;
      if (ok && (min !== null || max !== null)) {
        var p = price(el);
        ok = p !== null && (min === null || p >= min) && (max === null || p <= max);
      }
      el.hidden = !ok;
      if (ok) shown++;
    });
    var sorted = items.slice().sort(function (a, b) {
      var pa = price(a), pb = price(b);
      if (state.sort === "price-asc" || state.sort === "price-desc") {
        if (pa === null && pb === null) return a.getAttribute("data-featured") - b.getAttribute("data-featured");
        if (pa === null) return 1;
        if (pb === null) return -1;
        return state.sort === "price-asc" ? pa - pb : pb - pa;
      }
      if (state.sort === "name-asc") return a.getAttribute("data-name").localeCompare(b.getAttribute("data-name"));
      return a.getAttribute("data-featured") - b.getAttribute("data-featured");
    });
    sorted.forEach(function (el) { grid.appendChild(el); });
    chips.forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-cat") === state.cat ? "true" : "false"); });
    count.textContent = "Showing " + shown + (shown === 1 ? " item" : " items");
    empty.hidden = shown !== 0;
  }

  function update() { writeUrl(); render(); }

  chips.forEach(function (c) {
    c.addEventListener("click", function () { state.cat = c.getAttribute("data-cat"); update(); });
  });
  q.addEventListener("input", function () { state.q = q.value; update(); });
  sort.addEventListener("change", function () { state.sort = sort.value; update(); });
  pmin.addEventListener("input", function () { state.min = pmin.value; update(); });
  pmax.addEventListener("input", function () { state.max = pmax.value; update(); });
  function reset() {
    state = { cat: "all", q: "", sort: "featured", min: "", max: "" };
    q.value = ""; sort.value = "featured"; pmin.value = ""; pmax.value = "";
    update();
  }
  document.getElementById("shop-reset").addEventListener("click", reset);
  document.getElementById("shop-empty-reset").addEventListener("click", reset);
  window.addEventListener("popstate", function () { readUrl(); render(); });
  window.addEventListener("hashchange", function () { readUrl(); update(); });

  var mq = window.matchMedia("(max-width: 860px)");
  var filters = document.querySelector(".shop-filters");
  function syncFilters() { if (filters) filters.open = !mq.matches; }
  syncFilters();
  if (mq.addEventListener) mq.addEventListener("change", syncFilters);

  readUrl();
  if (state.min || state.max) { if (filters) filters.open = true; }
  render();
})();
