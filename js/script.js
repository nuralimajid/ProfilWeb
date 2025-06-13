// main.js
const sections = document.querySelectorAll(".section");

const revealOnScroll = () => {
  const triggerBottom = window.innerHeight * 0.85;

  sections.forEach((section) => {
    const sectionTop = section.getBoundingClientRect().top;
    if (sectionTop < triggerBottom) {
      section.classList.add("visible");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    target.scrollIntoView({ behavior: "smooth" });
  });
});

//carousel Portfolio
const track = document.getElementById("portfolioTrack");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

let currentPosition = 0;
const slideWidth = 300;

function updateButtons() {
  const maxScroll = track.scrollWidth - track.clientWidth;
  prevBtn.style.display = currentPosition > 0 ? "block" : "none";
  nextBtn.style.display = currentPosition < maxScroll ? "block" : "none";
}

nextBtn.addEventListener("click", () => {
  const maxScroll = track.scrollWidth - track.clientWidth;
  if (currentPosition < maxScroll) {
    currentPosition += slideWidth;
    track.style.transform = `translateX(-${currentPosition}px)`;
    updateButtons();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentPosition > 0) {
    currentPosition -= slideWidth;
    track.style.transform = `translateX(-${currentPosition}px)`;
    updateButtons();
  }
});

// Jalankan saat pertama kali
updateButtons();

track.addEventListener("wheel", function (e) {
  e.preventDefault();
  track.scrollLeft += e.deltaY;
});

//modal preview portfolio
const modal = document.getElementById("modalPreview");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const closeModal = document.getElementById("closeModal");

const cards = document.querySelectorAll(".portfolio-card");

cards.forEach((card, index) => {
  card.addEventListener("click", () => {
    const img = card.querySelector("img").src;
    const title = card.querySelector("h3").textContent;
    const desc = card.querySelector("p").textContent;

    modalImg.src = img;
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modal.style.display = "flex";
  });
});

closeModal.onclick = () => {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

//Slider content Blog
const slider = document.querySelector(".blog-slider");
const leftBtn = document.querySelector(".left-btn");
const rightBtn = document.querySelector(".right-btn");

let scrollAmount = 0;
const scrollStep = slider.clientWidth / 2 + 16; // sesuai dengan 2 card dan gap

rightBtn.addEventListener("click", () => {
  slider.scrollBy({ left: scrollStep, behavior: "smooth" });
});

leftBtn.addEventListener("click", () => {
  slider.scrollBy({ left: -scrollStep, behavior: "smooth" });
});

//animasi blog
const blogCards = document.querySelectorAll(".blog-card");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  },
  {
    threshold: 0.3,
  }
);

blogCards.forEach((card) => {
  observer.observe(card);
});

const modalBlog = document.getElementById("blogModal");
const modalTitleBlog = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const closeBtn = document.querySelector(".close-btn");


const blogData = [
  {
    title: "Tips Belajar .NET Lebih Cepat",
    body: "Pelajari langkah-langkah praktis belajar .NET, dari sintaks dasar, struktur proyek, hingga tips debug dan deployment.",
  },
  {
    title: "Integrasi Supabase di Web Static",
    body: "Gunakan Supabase untuk membuat backend ringan dan real-time pada proyek HTML static seperti yang kamu buat sekarang.",
  },
  {
    title: "Manajemen Proyek IT untuk Freelancer",
    body: "Kelola waktu, komunikasi klien, dan alur kerja dengan tools gratis seperti Trello, Notion, dan GitHub.",
  },
];

blogCards.forEach((card, index) => {
  card.addEventListener("click", () => {
    modalTitle.textContent = blogData[index].title;
    modalBody.textContent = blogData[index].body;
    modal.style.display = "flex";
  });
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});
