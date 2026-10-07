// ===== Configura tus datos de contacto =====
const EMAIL = "ideaviva3d@icloud.com";               // <- tu correo real
const $ = s => document.querySelectorAll(s);

// Títulos: cada letra entra con rebote, en cascada
$(".split").forEach(h => {
  const words = h.textContent.trim().split(" ");
  h.innerHTML = words.map(w => `<span style="display:inline-block;white-space:nowrap">${[...w].map(c => `<span class="ch">${c}</span>`).join("")}</span>`).join(" ");
  h.querySelectorAll(".ch").forEach((c, i) => c.style.transitionDelay = i * 28 + "ms");
});
// Pie: nombre gigante con letras que flotan
const big = document.querySelector(".big");
big.innerHTML = [..."Idea Viva 3D"].map((c, i) => `<span style="animation-delay:${i * .15}s">${c === " " ? "&nbsp;" : c}</span>`).join("");

// Entrada al hacer scroll + contadores
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("on"); io.unobserve(e.target);
  const n = e.target.querySelector("[data-to]");
  if (n) { const to = +n.dataset.to, t0 = performance.now();
    (function f(t) { const p = Math.min((t - t0) / 1400, 1); n.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0); }
}), { threshold: .15 });
$(".rv,.split").forEach((el, i) => { if (el.classList.contains("rv")) el.style.transitionDelay = (i % 3) * 90 + "ms"; io.observe(el); });

// Progreso de "impresión"
const fill = document.getElementById("barFill"), now = document.getElementById("layerNow");
function progress() { const m = document.documentElement.scrollHeight - innerHeight, p = m > 0 ? Math.min(scrollY / m, 1) : 0;
  fill.style.height = p * 100 + "%"; now.textContent = String(Math.round(p * 240)).padStart(3, "0"); }
addEventListener("scroll", progress, { passive: true }); progress();

// Brillo que sigue al mouse
const glow = document.querySelector(".glow");
addEventListener("pointermove", e => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; });

// Tarjetas con inclinación 3D
$(".tilt").forEach(el => {
  el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-6px)`; });
  el.addEventListener("pointerleave", () => el.style.transform = "");
});
// Botones magnéticos
$(".magnet").forEach(b => {
  b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; });
  b.addEventListener("pointerleave", () => b.style.transform = "");
});

// Formulario: abre tu correo con el pedido escrito
document.getElementById("form").addEventListener("submit", e => { e.preventDefault(); const d = new FormData(e.target);
  location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Pedido: " + d.get("tipo"))}&body=${encodeURIComponent(`Hola, soy ${d.get("nombre")}.\n\nQuiero: ${d.get("tipo")}\n\n${d.get("msg")}`)}`; });
document.getElementById("yr").textContent = new Date().getFullYear();

// ===== Cuenta (modo demostración, solo en este navegador) =====
(() => {
  const dlg = document.getElementById("auth"), btn = document.getElementById("navAuth"), f = document.getElementById("authForm"),
        msg = document.getElementById("authMsg"), go = document.getElementById("authGo"), tabs = dlg.querySelector(".tabs");
  let mode = "login";
  const get = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const hash = async (p, s) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s + p)))].map(x => x.toString(16).padStart(2, "0")).join("");
  function moveTab() { const on = tabs.querySelector("button.on"); tabs.style.setProperty("--x", on.offsetLeft + "px"); tabs.style.setProperty("--w", on.offsetWidth + "px"); }
  function setMode(m) { mode = m; f.classList.toggle("signup", m === "signup"); go.textContent = m === "signup" ? "Crear cuenta" : "Entrar"; msg.textContent = "";
    tabs.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.t === m)); moveTab();
    f.pass.autocomplete = m === "signup" ? "new-password" : "current-password"; }
  function render() { const s = get("iv3d_session"); btn.textContent = s ? "Salir · " + s.nombre.split(" ")[0] : "Entrar";
    if (s) { const n = document.querySelector('#form [name=nombre]'); if (n && !n.value) n.value = s.nombre; } }
  btn.onclick = () => { if (get("iv3d_session")) { try { localStorage.removeItem("iv3d_session"); } catch (e) {} render(); } else { dlg.showModal(); setMode(mode); } };
  document.getElementById("authX").onclick = () => dlg.close();
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  tabs.querySelectorAll("button").forEach(b => b.onclick = () => setMode(b.dataset.t));
  f.addEventListener("submit", async e => {
    e.preventDefault(); msg.className = ""; const email = f.email.value.trim().toLowerCase(), users = get("iv3d_users") || {};
    if (mode === "signup") {
      if (!f.nombre.value.trim()) { msg.textContent = "Escribe tu nombre."; return; }
      if (users[email]) { msg.textContent = "Ese correo ya tiene cuenta. Inicia sesión."; return; }
      const salt = crypto.getRandomValues(new Uint32Array(2)).join("");
      users[email] = { nombre: f.nombre.value.trim(), salt, h: await hash(f.pass.value, salt) };
      if (!set("iv3d_users", users)) { msg.textContent = "Tu navegador no deja guardar la cuenta."; return; }
    } else {
      const u = users[email];
      if (!u || u.h !== await hash(f.pass.value, u.salt)) { msg.textContent = "Correo o contraseña incorrectos."; return; }
    }
    set("iv3d_session", { nombre: users[email].nombre, email }); msg.className = "ok"; msg.textContent = "¡Listo, " + users[email].nombre.split(" ")[0] + "!";
    f.reset(); render(); setTimeout(() => dlg.close(), 900);
  });
  render();
})();
