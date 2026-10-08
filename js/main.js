(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var TO = "theryanmckenzie@gmail.com";
  var MAX_BODY = 1800;
  var form = document.querySelector("#contact-form");
  var programSelect = document.querySelector("#program");
  var hv = document.querySelector("#home-visit");

  function val(sel) {
    var el = form.querySelector(sel);
    return el && el.value ? el.value.trim() : "";
  }
  function picked(name) {
    var out = [];
    form.querySelectorAll('input[name="' + name + '"]:checked').forEach(function (el) {
      out.push(el.value);
    });
    return out;
  }
  function oneLine(text) {
    return text.replace(/\s*\n+\s*/g, " / ");
  }
  function isHomeVisit() {
    if (!programSelect) { return false; }
    var opt = programSelect.options[programSelect.selectedIndex];
    return !!(opt && opt.getAttribute("data-slug") === "home-visit");
  }

  // Preselect a program from ?program=... (matches the option value or its data-slug)
  if (programSelect && window.URLSearchParams) {
    var wanted = new URLSearchParams(window.location.search).get("program");
    if (wanted) {
      var w = wanted.toLowerCase();
      Array.prototype.forEach.call(programSelect.options, function (opt) {
        if (opt.value.toLowerCase() === w || (opt.getAttribute("data-slug") || "") === w) {
          programSelect.value = opt.value;
        }
      });
    }
  }

  function setHidden(el, hidden) {
    if (!el) { return; }
    if (hidden) { el.setAttribute("hidden", ""); } else { el.removeAttribute("hidden"); }
  }

  function syncBite() {
    if (!hv) { return; }
    var row = form.querySelector("#hv-bite-details-row");
    var box = form.querySelector("#hv-bite-details");
    var yes = picked("hv-bite")[0] === "Yes";
    setHidden(row, !yes);
    if (box) { box.disabled = !yes; box.required = yes; }
  }

  function syncHomeVisit() {
    if (!form || !hv) { return; }
    var on = isHomeVisit();
    setHidden(hv, !on);
    hv.disabled = !on;
    var phone = form.querySelector("#phone");
    if (phone) {
      phone.required = on;
      phone.setAttribute("data-req", "Please add a phone number so we can confirm your visit.");
    }
    setHidden(form.querySelector("#phone-optional"), on);
    setHidden(form.querySelector("#phone-required"), !on);
    var dt = form.querySelector("#dog-type");
    if (dt) { setHidden(dt.closest(".form-row"), on); }
    var msg = form.querySelector("#message");
    if (msg) {
      msg.required = !on;
      msg.placeholder = on ? "Anything else we should know?" : "Breed, age, goals, challenges\u2026";
      if (on) { msg.setAttribute("maxlength", "200"); } else { msg.removeAttribute("maxlength"); }
    }
    var ml = form.querySelector("#message-label");
    if (ml) { ml.textContent = on ? "Anything else?" : "Tell us about your dog"; }
    setHidden(form.querySelector("#message-req"), on);
    setHidden(form.querySelector("#message-opt"), !on);
    var btn = form.querySelector("#submit-btn");
    if (btn) { btn.textContent = on ? "Send Home Visit Request" : "Send Inquiry"; }
    syncBite();
    clearErrors();
  }

  // ---- friendly validation
  function errorId(key) { return "err-" + key; }
  function showError(anchorRow, key, text, focusEl) {
    var id = errorId(key);
    var p = document.getElementById(id);
    if (!p) {
      p = document.createElement("p");
      p.className = "field-error";
      p.id = id;
      anchorRow.appendChild(p);
    }
    p.textContent = text;
    if (focusEl && focusEl.setAttribute) {
      focusEl.setAttribute("aria-invalid", "true");
      var d = focusEl.getAttribute("aria-describedby") || "";
      if (d.indexOf(id) === -1) { focusEl.setAttribute("aria-describedby", (d + " " + id).trim()); }
    }
  }
  function clearErrors() {
    if (!form) { return; }
    form.querySelectorAll(".field-error").forEach(function (p) { p.parentNode.removeChild(p); });
    form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
    form.querySelectorAll(".form-row.has-error").forEach(function (r) { r.classList.remove("has-error"); });
    var st = form.querySelector("#form-status");
    if (st) { st.textContent = ""; setHidden(st, true); }
  }
  function validate() {
    clearErrors();
    var first = null;
    var count = 0;
    function fail(row, key, text, el) {
      row.classList.add("has-error");
      showError(row, key, text, el);
      if (!first) { first = el; }
      count++;
    }
    // plain required fields that are currently active
    form.querySelectorAll("input[required], select[required], textarea[required]").forEach(function (el) {
      if (el.matches(":disabled") || el.type === "radio" || el.type === "checkbox") { return; }
      var row = el.closest(".form-row");
      var v = el.value.trim();
      if (!v) {
        fail(row, el.id, el.getAttribute("data-req") || "Please fill out this field.", el);
      } else if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        fail(row, el.id, "Please enter a valid email address, like name@example.com.", el);
      } else if (el.id === "phone" && v.replace(/\D/g, "").length < 7) {
        fail(row, el.id, "Please enter a phone number we can reach you at.", el);
      }
    });
    // radio / checkbox groups inside the home visit section
    if (isHomeVisit()) {
      hv.querySelectorAll("[data-group]").forEach(function (row) {
        var name = row.getAttribute("data-group");
        var boxes = row.querySelectorAll('input[name="' + name + '"]');
        var n = picked(name).length;
        var ok = row.getAttribute("data-all") ? n === boxes.length : n > 0;
        if (!ok) { fail(row, name, row.getAttribute("data-req"), boxes[0]); }
      });
    }
    if (count) {
      var st = form.querySelector("#form-status");
      if (st) {
        st.textContent = count === 1 ? "One thing still needs your attention. It is highlighted below." : count + " things still need your attention. They are highlighted below.";
        setHidden(st, false);
      }
      if (first && first.focus) { first.focus(); }
      return false;
    }
    return true;
  }

  function fitBody(lines, trimKeys) {
    // Keep the email body within MAX_BODY characters by trimming the longest free text answers.
    var body = lines.join("\n");
    var guard = 0;
    while (body.length > MAX_BODY && guard < 50) {
      guard++;
      var longest = -1, len = 0;
      lines.forEach(function (ln, i) {
        if (trimKeys[i] && ln.length > len) { longest = i; len = ln.length; }
      });
      if (longest < 0) { break; }
      var over = body.length - MAX_BODY;
      var keep = Math.max(40, lines[longest].length - over - 20);
      lines[longest] = lines[longest].slice(0, keep).replace(/\s+\S*$/, "") + "... (more by phone)";
      trimKeys[longest] = false;
      body = lines.join("\n");
    }
    return body;
  }

  function buildHomeVisit() {
    var lines = [], trim = [];
    function add(label, value, canTrim) {
      lines.push(label ? label + ": " + value : value);
      trim.push(!!canTrim);
    }
    var bite = picked("hv-bite")[0] || "";
    var concerns = picked("hv-concerns");
    var tools = picked("hv-tools");
    var fixed = val("#hv-fixed");
    add("", "HOME VISIT REQUEST");
    add("Name", val("#name"));
    add("Phone", val("#phone"));
    add("Email", val("#email"));
    add("Community", val("#hv-community"));
    add("Address", val("#hv-address"));
    add("Best times", val("#hv-times"));
    add("", "");
    add("", "DOG");
    add("Name", val("#hv-dog-name"));
    add("Breed", val("#hv-breed"));
    add("Age", val("#hv-age"));
    add("Sex", val("#hv-sex") + (fixed ? ", fixed: " + fixed : ""));
    if (val("#hv-weight")) { add("Weight", val("#hv-weight")); }
    if (val("#hv-history")) { add("Had for/from", val("#hv-history")); }
    add("Vaccines", picked("hv-vacc")[0] || "");
    add("Bite/aggression", bite);
    if (bite === "Yes") { add("Details", oneLine(val("#hv-bite-details")), true); }
    add("", "");
    add("", "CONCERNS");
    add("Main", concerns.join(", "));
    add("Problem", oneLine(val("#hv-problem")), true);
    add("Goal", oneLine(val("#hv-goals")), true);
    add("", "");
    add("", "HOME");
    var hh = [];
    if (val("#hv-adults")) { hh.push(val("#hv-adults") + " adult(s)"); }
    if (val("#hv-kids")) { hh.push("kids: " + val("#hv-kids")); }
    if (val("#hv-pets")) { hh.push("pets: " + val("#hv-pets")); }
    add("Household", hh.length ? hh.join("; ") : "(not given)");
    var setup = [];
    if (val("#hv-yard")) { setup.push("fenced yard: " + val("#hv-yard")); }
    if (val("#hv-stairs")) { setup.push("stairs: " + val("#hv-stairs")); }
    if (setup.length) { add("Setup", setup.join("; ")); }
    if (val("#hv-arrival")) { add("On arrival", oneLine(val("#hv-arrival")), true); }
    add("Equipment", tools.length ? tools.join(", ") : "(not given)");
    if (val("#hv-vet")) { add("Vet", val("#hv-vet")); }
    if (val("#message")) {
      add("", "");
      add("Other", oneLine(val("#message")), true);
    }
    add("", "");
    add("Confirmed", picked("hv-ack").join(", "));
    return {
      subject: "Home visit request: " + val("#hv-dog-name") + ", " + val("#hv-community"),
      body: fitBody(lines, trim)
    };
  }

  function buildInquiry() {
    var name = val("#name");
    var body = [
      "Name: " + name,
      "Email: " + val("#email"),
      "Phone: " + (val("#phone") || "(not provided)"),
      "Dog type: " + val("#dog-type"),
      "Program interest: " + val("#program"),
      "",
      "Message:",
      val("#message")
    ].join("\n");
    return { subject: "Training inquiry from " + name, body: body };
  }

  if (form) {
    form.setAttribute("novalidate", "");
    if (programSelect) { programSelect.addEventListener("change", syncHomeVisit); }
    form.querySelectorAll('input[name="hv-bite"]').forEach(function (r) {
      r.addEventListener("change", syncBite);
    });
    // "None" equipment clears the others, and vice versa
    form.querySelectorAll('input[name="hv-tools"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        if (!cb.checked) { return; }
        form.querySelectorAll('input[name="hv-tools"]').forEach(function (o) {
          if (o !== cb && (cb.value === "None" || o.value === "None")) { o.checked = false; }
        });
      });
    });
    // clear a field's error as soon as it is fixed
    form.addEventListener("input", function (e) {
      var row = e.target.closest && e.target.closest(".form-row.has-error");
      if (row) {
        row.classList.remove("has-error");
        row.querySelectorAll(".field-error").forEach(function (p) { p.parentNode.removeChild(p); });
        row.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
      }
    });
    form.addEventListener("change", function (e) {
      if (e.target && (e.target.type === "radio" || e.target.type === "checkbox" || e.target.tagName === "SELECT")) {
        var row = e.target.closest(".form-row.has-error");
        if (row) {
          row.classList.remove("has-error");
          row.querySelectorAll(".field-error").forEach(function (p) { p.parentNode.removeChild(p); });
          row.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
        }
      }
    });
    syncHomeVisit();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) { return; }
      var msg = isHomeVisit() ? buildHomeVisit() : buildInquiry();
      var mailto = "mailto:" + TO +
        "?subject=" + encodeURIComponent(msg.subject) +
        "&body=" + encodeURIComponent(msg.body);
      form.setAttribute("data-last-mailto", mailto);
      window.location.href = mailto;
    });
  }
})();
