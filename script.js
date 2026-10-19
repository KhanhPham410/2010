// Ảnh tương ứng với từng hotspot (3 ảnh, chiều cao khác nhau)
const galleryImages = {
    'detail-1': [
        'src/eyes2.png',
        'src/eyes1.png',
        'src/eyes3.png'
    ],
    'detail-2': [
        'src/smile5.png',
        'src/smile4.png',
        'src/smile6.png'
    ],
    'detail-3': [
        'src/hair2.png',
        'src/hair1.png',
        'src/hair3.png'
    ]
};

function showDetail(detailId, clickedHotspot) {
    // 1. Ẩn tất cả nội dung
    const cards = document.querySelectorAll('.detail-card');
    cards.forEach(card => card.classList.remove('active'));

    // 2. Bỏ highlight tất cả các chấm
    const hotspots = document.querySelectorAll('.hotspot');
    hotspots.forEach(spot => spot.classList.remove('active'));

    // 3. Hiển thị nội dung tương ứng và highlight chấm vừa bấm
    document.getElementById(detailId).classList.add('active');
    clickedHotspot.classList.add('active');

    // 4. Cập nhật và hiện popup gallery phía trên "Giải phẫu"
    const gallery = document.getElementById('popup-gallery');
    const imgs = gallery.querySelectorAll('.pop-img');
    const srcs = galleryImages[detailId] || [];

    // Gán ảnh mới
    imgs.forEach((img, i) => {
        img.src = srcs[i] || '';
    });

    // Restart animation bằng cách ẩn/hiện lại
    gallery.style.display = 'none';
    void gallery.offsetWidth; // force reflow
    gallery.style.display = 'flex';

    // Restart animation cho từng ảnh
    imgs.forEach(img => {
        img.style.animation = 'none';
        void img.offsetWidth;
        img.style.animation = '';
    });
}


/* ══════════════════════════════════════════════
   POSE FLOATING DRIFT (22 ẢNH)
══════════════════════════════════════════════ */
// Tự động sinh mảng 22 ảnh từ 1.png -> 22.png
const poseImages = Array.from({ length: 22 }, (_, index) => `src/pose/${index + 1}.png`);

// Xáo trộn mảng (Fisher-Yates shuffle)
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Mỗi ảnh có 1 object chứa thông số quỹ đạo
const floaters = [];

function buildFloatingPoses() {
    const area = document.getElementById('pose-float-area');
    if (!area) return;

    const W = area.offsetWidth || window.innerWidth;
    const H = area.offsetHeight || 600;

    // Xáo ảnh ngẫu nhiên
    const shuffled = shuffle(poseImages);

    shuffled.forEach((src, i) => {
        const item = document.createElement('div');
        item.className = 'pose-item';

        const img = document.createElement('img');
        img.src = src;
        img.alt = 'pose';
        img.loading = 'lazy';
        item.appendChild(img);

        // Flicker chậm, random duration 4-8s, delay 0-6s
        const flickDur = (4 + Math.random() * 4).toFixed(2);
        const flickDelay = (Math.random() * 6).toFixed(2);
        item.style.animationDuration = flickDur + 's';
        item.style.animationDelay = '-' + flickDelay + 's';

        area.appendChild(item);

        img.onload = () => {
            const iW = item.offsetWidth || 150;
            const iH = item.offsetHeight || 180;

            // Tăng lưới lên 6 cột × 4 hàng để phân bổ vừa vặn cho 22-24 ảnh
            const cols = 6, rows = 4;
            const col = i % cols;
            const row = Math.floor(i / cols) % rows;
            const cellW = W / cols;
            const cellH = H / rows;

            const cx = col * cellW + cellW * 0.15 + Math.random() * cellW * 0.7;
            const cy = row * cellH + cellH * 0.15 + Math.random() * cellH * 0.7;

            // Bán kính lơ lửng
            const rx = 25 + Math.random() * 35;
            const ry = 15 + Math.random() * 25;

            // Tốc độ góc
            const speed = (0.0003 + Math.random() * 0.0004) * (Math.random() < 0.5 ? 1 : -1);
            const startAngle = Math.random() * Math.PI * 2;

            floaters.push({ el: item, cx, cy, rx, ry, speed, angle: startAngle, paused: false });

            item.style.left = (cx - iW / 2) + 'px';
            item.style.top = (cy - iH / 2) + 'px';

            item.addEventListener('mouseenter', () => {
                const f = floaters.find(f => f.el === item);
                if (f) f.paused = true;
            });
            item.addEventListener('mouseleave', () => {
                const f = floaters.find(f => f.el === item);
                if (f) f.paused = false;
            });
        };

        // Click → mở popup đã được đóng khung
        item.addEventListener('click', () => openLightbox(src));
    });

    startDriftLoop();
}

let lastTime = null;

function startDriftLoop() {
    function loop(ts) {
        if (lastTime === null) lastTime = ts;
        const dt = ts - lastTime;
        lastTime = ts;

        floaters.forEach(f => {
            if (f.paused) return;
            f.angle += f.speed * dt;

            const x = f.cx + f.rx * Math.cos(f.angle);
            const y = f.cy + f.ry * Math.sin(f.angle);

            const iW = f.el.offsetWidth || 0;
            const iH = f.el.offsetHeight || 0;

            f.el.style.left = (x - iW / 2) + 'px';
            f.el.style.top = (y - iH / 2) + 'px';
        });

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

window.addEventListener('load', buildFloatingPoses);



/* ══════════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════════ */
function openLightbox(src) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = src;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    lb.classList.remove('active');
    document.body.style.overflow = '';
}

// Đóng bằng phím Escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
});
