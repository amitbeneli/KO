/* ============================================================
   CONTENT — edit here
   ============================================================ */
const CONFIG = {
  // TODO: real booking address. The form opens the visitor's mail app addressed to this.
  bookingEmail: "K.O@sako-mgmt.com",
  // TODO: real Instagram profile links
  instagram: {
    connection: "",
    makesense: "",
    euforia: "",
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

/* ============================================================ */

document.documentElement.classList.add("js");

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

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
  if (!ok) { note.textContent = "Please fill in your name, artist / agency and a valid email."; return; }

  const d = Object.fromEntries(new FormData(form));
  const subject = `Booking / Collaboration — ${d.artist}`;
  const body = [
    `Name: ${d.name}`,
    `Artist / Agency: ${d.artist}`,
    `Email: ${d.email}`,
    `I am: ${d.role}`,
    "",
    d.message,
  ].join("\n");
  window.location.href = `mailto:${CONFIG.bookingEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  note.textContent = "Opening your email app…";
});
