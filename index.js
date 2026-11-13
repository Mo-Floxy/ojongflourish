document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("site-header");
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  const sections = [...document.querySelectorAll(".section-target")];
  const revealElements = document.querySelectorAll(".reveal");
  const year = document.getElementById("year");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (year) year.textContent = new Date().getFullYear();

  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav.classList.toggle("is-open", open);
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    const desktopQuery = window.matchMedia("(min-width: 681px)");
    desktopQuery.addEventListener?.("change", () => setMenu(false));
  }

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

    revealElements.forEach((element) => revealObserver.observe(element));

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { threshold: 0, rootMargin: "-40% 0px -55% 0px" });

    sections.forEach((section) => sectionObserver.observe(section));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  if (reducedMotion) revealElements.forEach((element) => element.classList.add("is-visible"));

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const status = document.getElementById("cf-status");
    const submitBtn = document.getElementById("cf-submit");
    const fields = {
      name: document.getElementById("cf-name"),
      email: document.getElementById("cf-email"),
      message: document.getElementById("cf-message"),
    };
    const errors = {
      name: document.getElementById("cf-name-error"),
      email: document.getElementById("cf-email-error"),
      message: document.getElementById("cf-message-error"),
    };

    const setStatus = (text, kind) => {
      status.textContent = text || "";
      status.className = "form-status" + (kind ? " is-" + kind : "");
    };
    const setError = (key, text) => {
      if (errors[key]) errors[key].textContent = text || "";
      if (fields[key]) {
        if (text) fields[key].setAttribute("aria-invalid", "true");
        else fields[key].removeAttribute("aria-invalid");
      }
    };

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setStatus("", "");
      Object.keys(fields).forEach((key) => setError(key, ""));

      const name = fields.name.value.trim();
      const email = fields.email.value.trim();
      const message = fields.message.value.trim();
      let valid = true;
      if (!name) { setError("name", "Please tell me your name."); valid = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("email", "Please enter a valid email so I can reply."); valid = false; }
      if (message.length < 10) { setError("message", "A few more words would help — at least 10 characters."); valid = false; }
      if (!valid) return;

      const accessKey = (document.getElementById("cf-access-key")?.value || "").trim();
      if (!accessKey) {
        console.warn("[contact] Web3Forms access key missing — paste it into the hidden access_key input in index.html.");
        setStatus("Opening your email app instead — or write to me directly at ojongflourish14@gmail.com.");
        const subject = encodeURIComponent("Portfolio message from " + name);
        const body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
        window.location.href = "mailto:ojongflourish14@gmail.com?subject=" + subject + "&body=" + body;
        return;
      }

      submitBtn.disabled = true;
      setStatus("Sending your message…");
      try {
        const response = await fetch(contactForm.action, { method: "POST", body: new FormData(contactForm) });
        const result = await response.json().catch(() => ({}));
        if (response.ok && result.success) {
          contactForm.reset();
          setStatus("Message sent — I'll reply from ojongflourish14@gmail.com soon.", "success");
        } else {
          setStatus((result.message ? "Couldn't send (" + result.message + "). " : "Couldn't send the message. ") + "Please try again, or email me directly.", "error");
        }
      } catch {
        setStatus("Network error — please try again, or email me directly.", "error");
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
});

/* Ambient background: aurora blobs + rising particles + cursor glow */
(() => {
  const canvas = document.getElementById("bg-canvas");
  const glow = document.getElementById("cursor-glow");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canvas || reducedMotion) {
    if (canvas) canvas.remove();
    if (glow) glow.remove();
    return;
  }

  const ctx = canvas.getContext("2d");
  const blobCanvas = document.createElement("canvas");
  const blobCtx = blobCanvas.getContext("2d");
  const BLOB_SCALE = 1 / 8;
  const COLORS = ["255,143,196", "240,86,156", "167,139,250", "242,242,248"];

  let w = 0, h = 0, dpr = 1;
  let particles = [];
  let blobs = [];
  let raf = null;
  let running = false;
  let tick = 0;

  let glowActive = false;
  let glowX = 0, glowY = 0, targetX = 0, targetY = 0;

  const initScene = () => {
    const count = Math.max(24, Math.min(85, Math.round((w * h) / 22000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.8 + Math.random() * 1.7,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(0.05 + Math.random() * 0.18),
      alpha: 0.1 + Math.random() * 0.32,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.008 + Math.random() * 0.02,
    }));
    blobs = [
      { x: 0.24, y: 0.34, r: 0.34, color: "240,86,156", alpha: 0.055, sx: 0.11, sy: 0.09, phase: 0 },
      { x: 0.76, y: 0.62, r: 0.3, color: "167,139,250", alpha: 0.045, sx: 0.13, sy: 0.1, phase: 2.1 },
      { x: 0.5, y: 0.88, r: 0.26, color: "255,143,196", alpha: 0.035, sx: 0.1, sy: 0.08, phase: 4.2 },
    ];
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    blobCanvas.width = Math.max(1, Math.round(w * BLOB_SCALE));
    blobCanvas.height = Math.max(1, Math.round(h * BLOB_SCALE));
    initScene();
  };

  const drawBlobs = () => {
    const bw = blobCanvas.width, bh = blobCanvas.height;
    blobCtx.clearRect(0, 0, bw, bh);
    for (const b of blobs) {
      const bx = (b.x + Math.sin(tick * 0.0016 + b.phase) * b.sx) * bw;
      const by = (b.y + Math.cos(tick * 0.0013 + b.phase) * b.sy) * bh;
      const br = b.r * Math.max(bw, bh);
      const g = blobCtx.createRadialGradient(bx, by, 0, bx, by, br);
      g.addColorStop(0, `rgba(${b.color},${b.alpha})`);
      g.addColorStop(1, `rgba(${b.color},0)`);
      blobCtx.fillStyle = g;
      blobCtx.fillRect(0, 0, bw, bh);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(blobCanvas, 0, 0, w, h);
  };

  const drawParticles = () => {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.phase += p.twinkleSpeed;
      if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w; }
      if (p.x < -12) p.x = w + 12;
      else if (p.x > w + 12) p.x = -12;
      const a = p.alpha * (0.55 + 0.45 * Math.sin(p.phase));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${a.toFixed(3)})`;
      ctx.fill();
    }
  };

  const frame = () => {
    if (!running) return;
    if (canvas.width === 0 && window.innerWidth > 0) resize();
    tick++;
    ctx.clearRect(0, 0, w, h);
    drawBlobs();
    drawParticles();
    if (glow && glowActive) {
      glowX += (targetX - glowX) * 0.08;
      glowY += (targetY - glowY) * 0.08;
      glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
    }
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    running = false;
    if (raf) cancelAnimationFrame(raf);
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });
  start();

  if (glow && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!glowActive) {
        glowActive = true;
        glowX = targetX;
        glowY = targetY;
        glow.classList.add("is-active");
      }
    }, { passive: true });
    window.addEventListener("pointerleave", () => {
      glowActive = false;
      glow.classList.remove("is-active");
    });
  } else if (glow) {
    glow.remove();
  }
})();
