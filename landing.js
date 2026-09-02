let reveals = document.querySelectorAll(".reveal");
function revealonscroll(){
for (let i = 0; i < reveals.length; i++) {
  let windowHeight = window.innerHeight;
  let elementTop = reveals[i].getBoundingClientRect().top;
  let elementVisible = 150;
  if (elementTop < windowHeight - elementVisible) {
    reveals[i].classList.add("active");
  }
}
}
window.addEventListener("scroll", revealonscroll);
revealonscroll();