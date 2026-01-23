function $(id) { return document.getElementById(id); }

function show(id) {
  document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await window.api.check();
    show(res.success ? "success" : "register");
  } catch (e) {
    console.error("Backend not responding", e);
    show("register");
  }
});

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button");
  btn.disabled = true;

  try {
    const code = $("code").value.replace(/-/g, "");
    const res = await window.api.enroll(code);
    if (res.success) show("success");
    else $("error").textContent = "Failed";
  } catch (e) {
    $("error").textContent = "Connection error";
  } finally {
    btn.disabled = false;
  }
});
