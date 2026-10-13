(function () {
  var cfg = window.LANDING_CONFIG || {};
  var waBase = "https://wa.me/" + cfg.whatsapp + "?text=";

  // ---- Meta Pixel (solo si hay ID) ----
  if (cfg.metaPixelId) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', cfg.metaPixelId);
    fbq('track', 'PageView');
    fbq('track', 'ViewContent', { content_name: cfg.propiedad, value: cfg.precio, currency: 'MXN' });
  }
  function track(event, params) {
    if (window.fbq) fbq('track', event, Object.assign({ content_name: cfg.propiedad }, params || {}));
  }

  // ---- Botones de WhatsApp ----
  var waMsg = "Hola, me interesa el departamento de Gabriel Mancera en Del Valle Centro ($5,300,000). ¿Me pueden dar más información?";
  document.querySelectorAll(".js-wa").forEach(function (a) {
    a.href = waBase + encodeURIComponent(waMsg);
    a.target = "_blank";
    a.rel = "noopener";
    a.addEventListener("click", function () {
      track("Contact", { method: "whatsapp", placement: a.getAttribute("data-wa") || "" });
    });
  });

  // ---- Formulario: valida, registra Lead y abre WhatsApp con los datos ----
  var form = document.getElementById("lead-form");
  var err = document.getElementById("form-error");
  var done = document.getElementById("form-done");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nombre = form.nombre.value.trim();
    var tel = form.telefono.value.trim();
    var digits = tel.replace(/\D/g, "");
    form.nombre.removeAttribute("aria-invalid");
    form.telefono.removeAttribute("aria-invalid");

    if (!nombre) {
      return showError(form.nombre, "Escribe tu nombre para saber cómo dirigirnos a ti.");
    }
    if (digits.length < 10) {
      return showError(form.telefono, "Revisa tu teléfono: debe tener al menos 10 dígitos.");
    }
    err.hidden = true;

    var datos = {
      nombre: nombre,
      telefono: tel,
      cuando: form.cuando.value,
      pago: form.pago.value,
      propiedad: cfg.propiedad
    };

    track("Lead", { value: cfg.precio, currency: "MXN" });

    if (cfg.formspreeId) {
      try {
        var body = JSON.stringify(datos);
        if (navigator.sendBeacon) {
          navigator.sendBeacon("https://formspree.io/f/" + cfg.formspreeId, new Blob([body], { type: "application/json" }));
        } else {
          fetch("https://formspree.io/f/" + cfg.formspreeId, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: body, keepalive: true });
        }
      } catch (x) {}
    }

    var msg = "Hola, soy " + nombre + ". Me interesa el departamento de Gabriel Mancera en Del Valle Centro ($5,300,000).\n" +
      "Me gustaría visitarlo: " + datos.cuando + ".\n" +
      "Planeo comprar con: " + datos.pago + ".\n" +
      "Mi teléfono: " + tel;
    done.hidden = false;
    window.location.href = waBase + encodeURIComponent(msg);
  });

  function showError(input, text) {
    input.setAttribute("aria-invalid", "true");
    err.textContent = text;
    err.hidden = false;
    input.focus();
  }
})();
