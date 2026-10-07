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

  var programSelect = document.querySelector("#program");
  if (programSelect && window.URLSearchParams) {
    var wanted = new URLSearchParams(window.location.search).get("program");
    if (wanted) {
      Array.prototype.forEach.call(programSelect.options, function (opt) {
        if (opt.value === wanted) { programSelect.value = wanted; }
      });
    }
  }

  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.querySelector("#name") || {}).value || "";
      var email = (form.querySelector("#email") || {}).value || "";
      var phone = (form.querySelector("#phone") || {}).value || "";
      var dogType = (form.querySelector("#dog-type") || {}).value || "";
      var program = (form.querySelector("#program") || {}).value || "";
      var message = (form.querySelector("#message") || {}).value || "";

      var subject = "Training inquiry from " + name.trim();
      var body = [
        "Name: " + name.trim(),
        "Email: " + email.trim(),
        "Phone: " + (phone.trim() || "(not provided)"),
        "Dog type: " + dogType,
        "Program interest: " + program,
        "",
        "Message:",
        message.trim()
      ].join("\n");

      var mailto =
        "mailto:theryanmckenzie@gmail.com" +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      window.location.href = mailto;
    });
  }
})();
