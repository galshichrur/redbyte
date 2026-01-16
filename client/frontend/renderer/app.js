const $ = (id) => document.getElementById(id)
const show = (id) => {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"))
  $(id).classList.add("active")
}

$("code").addEventListener("input", (e) => {
  const v = e.target.value
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 16)
  e.target.value = v.match(/.{1,4}/g)?.join("-") || ""
  $("error").textContent = ""
})

$("form").addEventListener("submit", async (e) => {
  e.preventDefault()
  const code = $("code").value.replace(/-/g, "")
  if (code.length !== 16) {
    $("error").textContent = "Invalid code"
    return
  }

  const btn = e.target.querySelector("button")
  btn.disabled = true
  btn.textContent = "Connecting..."

  const res = await window.api.enroll(code)
  if (res.success) {
    show("success")
  } else {
    $("error").textContent = res.error
    btn.disabled = false
    btn.textContent = "Connect"
  }
})

$("close").addEventListener("click", () => window.api.close())

window.addEventListener("DOMContentLoaded", async () => {
  const res = await window.api.check()
  setTimeout(() => show(res.enrolled ? "success" : "register"), 600)
})
