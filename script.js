// =========================================================
// CAM HÒA LẠC — script tương tác
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Chấm tròn theo con trỏ chuột ---------- */
  const cursorDot = document.getElementById('cursorDot');
  if (cursorDot && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, .product-card').forEach((el) => {
      el.addEventListener('mouseenter', () => cursorDot.classList.add('active'));
      el.addEventListener('mouseleave', () => cursorDot.classList.remove('active'));
    });
  }

  /* ---------- 2. Header đổi nền khi cuộn ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. Menu mobile ---------- */
  const burger = document.getElementById('burgerBtn');
  const nav = document.getElementById('mainNav');
  burger?.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  /* ---------- 4. Ly nước cam "rót đầy" khi cuộn tới hero ---------- */
  const juiceFill = document.getElementById('juiceFill');
  if (juiceFill) {
    // Bắt đầu ở trạng thái vơi, sau đó rót đầy để tạo cảm giác "vừa vắt xong"
    juiceFill.setAttribute('y', '360');
    juiceFill.setAttribute('height', '40');
    requestAnimationFrame(() => {
      setTimeout(() => {
        juiceFill.setAttribute('y', '140');
        juiceFill.setAttribute('height', '260');
      }, 400);
    });
  }

  /* ---------- 5. Ly nước nghiêng nhẹ theo chuyển động chuột (parallax) ---------- */
  const glassWrap = document.getElementById('glassWrap');
  const hero = document.querySelector('.hero');
  if (glassWrap && hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      glassWrap.style.transform = `rotate(${relX * 8}deg) translateY(${relY * 10}px)`;
    });
    hero.addEventListener('mouseleave', () => {
      glassWrap.style.transform = 'rotate(0deg) translateY(0px)';
    });
  }

  /* ---------- 6. Hiệu ứng xuất hiện khi cuộn tới (chỉ áp dụng có chọn lọc) ---------- */
  const revealTargets = document.querySelectorAll('.bento-item, .product-card, .testi-card');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = entry.target.style.transform.replace('translateY(24px)', '');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transition = `opacity .6s var(--ease) ${i % 4 * 0.08}s, transform .6s var(--ease) ${i % 4 * 0.08}s`;
    el.style.transform += ' translateY(24px)';
    io.observe(el);
  });

});

/* ===== FEEDBACK: chấm sao + mở/đóng popup + gửi email qua EmailJS ===== */

// ⚠️ THAY "YOUR_PUBLIC_KEY" bằng Public Key thật ở EmailJS > Account > General
emailjs.init("YOUR_PUBLIC_KEY");

let selectedRating = 0;

document.querySelectorAll("#starRow .star").forEach(function (starEl) {
  starEl.addEventListener("click", function () {
    selectedRating = parseInt(starEl.getAttribute("data-v"));
    document.getElementById("fb-rating").value = selectedRating;

    document.querySelectorAll("#starRow .star").forEach(function (s) {
      const v = parseInt(s.getAttribute("data-v"));
      s.classList.toggle("active", v <= selectedRating);
    });

    document.getElementById("star-error").textContent = "";
  });
});

function openFeedbackModal() {
  document.getElementById("feedbackModal").classList.add("active");
}

function closeFeedbackModal() {
  document.getElementById("feedbackModal").classList.remove("active");
}

function sendFeedback(event) {
  event.preventDefault();

  const btn = document.getElementById("fb-submit-btn");
  const status = document.getElementById("fb-status");
  const starError = document.getElementById("star-error");

  if (selectedRating === 0) {
    starError.textContent = "Bạn chấm sao trước nhé";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Đang gửi...";
  status.textContent = "";
  status.className = "feedback-status";

  // ⚠️ THAY "YOUR_SERVICE_ID" và "YOUR_TEMPLATE_ID" bằng ID thật từ EmailJS
  emailjs
    .sendForm("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", "#feedbackForm")
    .then(function () {
      status.textContent = "Gửi thành công! Cảm ơn góp ý của bạn 🎉";
      status.classList.add("success");
      document.getElementById("feedbackForm").reset();

      selectedRating = 0;
      document.getElementById("fb-rating").value = 0;
      document.querySelectorAll("#starRow .star").forEach(function (s) {
        s.classList.remove("active");
      });

      btn.disabled = false;
      btn.textContent = "Gửi khảo sát";
      setTimeout(closeFeedbackModal, 2000);
    })
    .catch(function (err) {
      status.textContent = "Gửi thất bại, vui lòng thử lại sau.";
      status.classList.add("error");
      btn.disabled = false;
      btn.textContent = "Gửi khảo sát";
      console.error("Lỗi gửi email:", err);
    });
}