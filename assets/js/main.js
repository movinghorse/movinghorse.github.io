(() => {
  const canvas = document.getElementById("particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  // 移动端减少粒子数量以提高性能
  const isMobile = window.innerWidth <= 768;
  const particleCount = isMobile 
    ? Math.min(60, Math.floor((width * height) / 18000))
    : Math.min(120, Math.floor((width * height) / 12000));
  const particles = [];
  const TAU = Math.PI * 2;

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticle() {
    const speedBase = randomRange(0.18, 0.6);
    const angle = Math.random() * TAU;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speedBase,
      vy: Math.sin(angle) * speedBase,
      radius: randomRange(0.4, 1.6),
      alpha: randomRange(0.3, 0.9),
      flicker: randomRange(0.008, 0.022),
    };
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle());
  }

  let mouseX = width / 2;
  let mouseY = height / 2;
  let hasMouse = false;
  let hasTouch = false;

  // 鼠标事件
  window.addEventListener("mousemove", (e) => {
    hasMouse = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener("mouseleave", () => {
    hasMouse = false;
  });

  // 触摸事件支持（移动端）
  window.addEventListener("touchstart", (e) => {
    hasTouch = true;
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  });

  window.addEventListener("touchmove", (e) => {
    e.preventDefault(); // 防止页面滚动
    hasTouch = true;
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  });

  window.addEventListener("touchend", () => {
    hasTouch = false;
  });

  window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    // 重新计算粒子数量以适应新的屏幕尺寸
    const newIsMobile = width <= 768;
    const newParticleCount = newIsMobile 
      ? Math.min(60, Math.floor((width * height) / 18000))
      : Math.min(120, Math.floor((width * height) / 12000));
    
    // 调整粒子数组大小
    while (particles.length < newParticleCount) {
      particles.push(createParticle());
    }
    while (particles.length > newParticleCount) {
      particles.pop();
    }
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createRadialGradient(
      width * 0.1,
      height * 0.1,
      0,
      width * 0.1,
      height * 0.1,
      width * 0.8
    );
    gradient.addColorStop(0, "rgba(56, 189, 248, 0.25)");
    gradient.addColorStop(0.4, "rgba(37, 99, 235, 0.12)");
    gradient.addColorStop(1, "rgba(15, 23, 42, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const linkDistance = isMobile 
      ? Math.min(120, Math.max(70, width / 14))
      : Math.min(160, Math.max(90, width / 12));

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      p.alpha += (Math.random() - 0.5) * p.flicker;
      p.alpha = Math.max(0.18, Math.min(0.95, p.alpha));

      let influence = 0;
      if (hasMouse || hasTouch) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist2 = dx * dx + dy * dy;
        const maxDist = isMobile ? 180 : 220; // 移动端减小影响范围
        if (dist2 < maxDist * maxDist) {
          influence = 1 - dist2 / (maxDist * maxDist);
        }
      }

      const radius = p.radius + influence * 1.2;

      ctx.beginPath();
      ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
      ctx.arc(p.x, p.y, radius, 0, TAU);
      ctx.fill();
    }

    ctx.lineWidth = 0.7;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > linkDistance) continue;

        let alpha = 1 - dist / linkDistance;
        alpha = alpha * alpha;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(59, 130, 246, ${alpha * 0.32})`;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);

  const toggle = document.getElementById("aiPulseToggle");
  const modeLabel = document.getElementById("modeLabel");
  let pulseOn = true;

  if (toggle && modeLabel) {
    const modes = ["NEURAL FOCUS", "IDLE SCAN", "DEEP GENERATION"];
    let index = 0;

    toggle.addEventListener("click", () => {
      pulseOn = !pulseOn;
      document.body.style.animationPlayState = pulseOn ? "running" : "paused";
      const gradientLayer = document.querySelector(".gradient-layer");
      const orbits = document.querySelectorAll(".orbits span");

      const state = pulseOn ? "running" : "paused";
      if (gradientLayer) {
        gradientLayer.style.animationPlayState = state;
      }
      orbits.forEach((o) => {
        o.style.animationPlayState = state;
      });

      index = (index + 1) % modes.length;
      modeLabel.textContent = modes[index];
    });
  }

  const neuralStream = document.getElementById("neuralStream");
  if (neuralStream) {
    const messages = [
      "scan · detecting weak signals of curiosity...",
      "sync · local context merged with global priors.",
      "note · 复杂问题值得被温柔地拆开来思考。",
      "trace · assembling new mental models from data.",
      "loop · build → observe → adjust → repeat.",
    ];

    let pointer = 0;

    setInterval(() => {
      const line = document.createElement("div");
      line.className = "neural-line fade-in";
      line.textContent = messages[pointer % messages.length];
      pointer += 1;

      neuralStream.appendChild(line);

      while (neuralStream.children.length > 6) {
        neuralStream.removeChild(neuralStream.firstChild);
      }
    }, 3600);
  }
})();



