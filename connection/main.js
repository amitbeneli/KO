/* ============================================================
   CONTENT — edit here
   ============================================================ */
const CONFIG = {
  // Booking address. The form opens the visitor's mail app addressed to this.
  bookingEmail: "K.O@sako-mgmt.com",
  // Instagram profile links (an empty one is hidden on the page)
  instagram: {
    connection: "https://www.instagram.com/connection__community/",
    makesense: "https://www.instagram.com/wearemakesense/",
    euforia: "https://www.instagram.com/euforia_offical/",
  },
};

// Make Sense 2026 lineup, headliner first
const MAKE_SENSE_LINEUP = [
  "Adam Ten", "Yamagucci", "Darco", "Broken Hill", "K.O", "Mishell",
  "Itayga", "Dor Danino", "Bonafique", "Jenia Tarsol", "Out Of Orbit",
];

// Everyone who has played Connection / Make Sense / Euforia
const ARTISTS = [
  "Adam Ten", "Darco", "Rafael", "Tim Engelhardt", "Yamagucci", "Jenia Tarsol",
  "Club De Combat", "Sean Doron", "Omri Smadar (Live)", "Omer Keinan", "T-Puse",
  "Broken Hill", "Assaf Michael", "Out Of Orbit", "Rising Dust", "K.O", "Mishell",
  "Freedom Fighters", "Itayga", "Astral Projection", "Dor Danino", "Bonafique",
];

// Vertical clips in the Moments section (files in media/reels/)
const REELS = [
  { file: "bonafique-jenia-tarsol", artist: "Bonafique b2b Jenia Tarsol", label: "Make Sense / Daylight" },
  { file: "adam-ten", artist: "Adam Ten", label: "Make Sense / Golden hour" },
  { file: "ko-broken-hill", artist: "K.O b2b Broken Hill", label: "Make Sense / After dark" },
  { file: "darco-yamagucci", artist: "Darco b2b Yamagucci", label: "Make Sense / Peak time" },
  { file: "itayga-dor-danino", artist: "Itayga b2b Dor Danino", label: "Make Sense / Night" },
  { file: "sean-doron", artist: "Sean Doron", label: "Connection" },
];

/* ============================================================ */

document.documentElement.classList.add("js");

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// hero video: vertical cut on phones, wide cut on desktop; poster only with reduced motion
const heroVideo = $("#heroVideo");
if (heroVideo && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const mobile = window.matchMedia("(max-width: 640px)").matches;
  if (mobile) heroVideo.poster = "media/hero-mobile-poster.jpg";
  heroVideo.src = mobile ? heroVideo.dataset.mobile : heroVideo.dataset.desktop;
  heroVideo.play().catch(() => {});
} else if (heroVideo && window.matchMedia("(max-width: 640px)").matches) {
  heroVideo.poster = "media/hero-mobile-poster.jpg";
}

// Make Sense background: vertical frame on phones (the clip itself is attached by motion.js)
const msVideo = $("#msVideo");
if (msVideo && window.matchMedia("(max-width: 640px)").matches) msVideo.poster = msVideo.dataset.mobilePoster;

// lists
$("#msLineup").innerHTML = MAKE_SENSE_LINEUP.map((a) => `<li>${esc(a)}</li>`).join("");
$("#artistWall").innerHTML = ARTISTS.map((a) => `<li>${esc(a)}</li>`).join("");

// marquee: two identical halves so the -50% loop is seamless
const half = ARTISTS.map((a) => `<span>${esc(a)}</span><b>✦</b>`).join("");
$("#marquee").innerHTML = half + half;

// socials: hide any link that has no URL yet
[["#igConnection", "connection"], ["#igMakesense", "makesense"], ["#igEuforia", "euforia"]].forEach(([sel, key]) => {
  const a = $(sel);
  const url = CONFIG.instagram[key];
  if (url) a.href = url; else a.closest("li").hidden = true;
});
if (!Object.values(CONFIG.instagram).some(Boolean)) $(".socials").hidden = true;

$("#year").textContent = new Date().getFullYear();

// nav background after scrolling past the top
const nav = $("#nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// count-up numbers
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function countUp(el) {
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || "";
  if (reduced) { el.textContent = target.toLocaleString("en-US") + suffix; return; }
  const dur = 1600;
  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    e.target.querySelectorAll("[data-count]").forEach(countUp);
    if (e.target.matches("[data-count]")) countUp(e.target);
    io.unobserve(e.target);
  });
}, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// booking form -> opens the visitor's mail app with everything filled in
const form = $("#bookingForm");
const note = $("#formNote");
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  let ok = true;
  form.querySelectorAll("[required]").forEach((f) => {
    const bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
    f.setAttribute("aria-invalid", bad);
    if (bad) ok = false;
  });
  if (!ok) { note.textContent = "Please add your name and a valid email."; return; }

  const d = Object.fromEntries(new FormData(form));
  const subject = `Booking / Collaboration — ${d.name}`;
  const body = [
    `From: ${d.name}`,
    `Email: ${d.email}`,
    "",
    d.message,
  ].join("\n");
  window.location.href = `mailto:${CONFIG.bookingEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  note.textContent = "Opening your email app…";
});

// moments: vertical clips. Muted autoplay while on screen; tap toggles sound (one at a time).
const reelsEl = $("#reels");
if (!REELS.length) $("#moments").hidden = true;
reelsEl.innerHTML = REELS.map((r) => `
  <div class="reel" role="button" tabindex="0" aria-label="${esc(r.artist)} clip. Tap for sound">
    <video muted loop playsinline preload="none" poster="media/reels/${r.file}.jpg">
      <source src="media/reels/${r.file}.mp4" type="video/mp4">
    </video>
    <span class="reel-sound">Sound off</span>
    <p class="reel-cap"><small>${esc(r.label)}</small>${esc(r.artist)}</p>
  </div>`).join("");
const reelEls = [...reelsEl.querySelectorAll(".reel")];
const setSound = (el, on) => {
  const v = el.querySelector("video");
  v.muted = !on; el.classList.toggle("unmuted", on);
  el.querySelector(".reel-sound").textContent = on ? "Sound on" : "Sound off";
};
reelEls.forEach((el) => {
  const toggle = () => {
    const on = !el.classList.contains("unmuted");
    reelEls.forEach((o) => o !== el && setSound(o, false));
    setSound(el, on);
    el.querySelector("video").play().catch(() => {});
  };
  el.addEventListener("click", toggle);
  el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
});
const vio = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    const v = e.target.querySelector("video");
    if (e.isIntersecting && !reduced) v.play().catch(() => {});
    else { v.pause(); setSound(e.target, false); }
  });
}, { threshold: 0.35 });
reelEls.forEach((el) => vio.observe(el));

// gallery arrows
const film = $("#film");
document.querySelectorAll(".film-btn").forEach((b) => b.addEventListener("click", () => {
  film.scrollBy({ left: +b.dataset.dir * film.clientWidth * 0.7, behavior: reduced ? "auto" : "smooth" });
}));
