// PPT 幻灯片主题 JavaScript

// 导入依赖库
import Swiper from 'swiper';
import Alpine from 'alpinejs';

// 注意：Swiper CSS 在 application.css 中通过 @import 'swiper/swiper-bundle.css' 导入
// 注意：Font Awesome CSS 在 application.css 中通过 @import 导入
// 注意：复制功能使用自定义方法实现，不再使用 alpine-clipboard 插件

// 将 Alpine 挂载到 window，以便在 HTML 中使用
window.Alpine = Alpine;

// 将 Swiper 挂载到 window
window.Swiper = Swiper;

// 等待 Alpine.js 初始化
document.addEventListener("alpine:init", () => {
  // 确保插件在 alpine:init 事件中也可用
  // 插件已经在外部注册，这里不需要重复注册

  Alpine.data("presentation", () => ({
    currentIndex: 0,
    menuOpen: false,
    swiper: null,
    logoSvg: `<svg viewBox="0 0 100 100" class="w-16 h-16 drop-shadow-md">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="100" height="100" rx="22" fill="url(#logoGradient)" />
              <path d="M35 70V30h14c8 0 13 4 13 10 0 4-2 7-6 8.5 5 1.5 8 5 8 10 0 7-6 11.5-15 11.5H35zm8-22h6c3.5 0 6-1.5 6-5s-2.5-5-6-5h-6v10zm0 15h7c4 0 7-2 7-6s-3-6-7-6h-7v12z" fill="white" />
              <circle cx="82" cy="70" r="6" fill="#ea580c" stroke="white" strokeWidth="2" />
          </svg>`,
    slides: [],
    get progress() {
      // 从 DOM 中获取实际的幻灯片数量
      const slideCount = document.querySelectorAll('.swiper-slide').length;
      if (slideCount === 0) return 0;
      return ((this.currentIndex + 1) / slideCount) * 100;
    },
    initApp() {
      // 初始化 Swiper
      this.swiper = new Swiper(".mySwiper", {
        effect: "slide", // Presentation style
        slidesPerView: 1,
        allowTouchMove: false, // Prevent accidental swipes, use controls
        speed: 600, // 切换速度
        keyboard: {
          enabled: true,
          onlyInViewport: true,
        },
        on: {
          slideChange: (s) => {
            this.currentIndex = s.activeIndex;
          },
        },
      });

      // 添加键盘事件监听（左右方向键控制翻页）
      const handleKeyDown = (e) => {
        if (!this.swiper) return;

        // 左方向键或上方向键：上一张
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          this.swiper.slidePrev();
        }
        // 右方向键或下方向键：下一张
        else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          this.swiper.slideNext();
        }
        // Home 键：第一张
        else if (e.key === 'Home') {
          e.preventDefault();
          const slideCount = document.querySelectorAll('.swiper-slide').length;
          if (slideCount > 0) {
            this.swiper.slideTo(0);
          }
        }
        // End 键：最后一张
        else if (e.key === 'End') {
          e.preventDefault();
          const slideCount = document.querySelectorAll('.swiper-slide').length;
          if (slideCount > 0) {
            this.swiper.slideTo(slideCount - 1);
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
    },
    goToSlide(index) {
      if (this.swiper) {
        this.swiper.slideTo(index);
        this.menuOpen = false;
      }
    },
  }));
});

// 启动 Alpine.js
Alpine.start();

// 滚动到顶部功能
document.addEventListener('DOMContentLoaded', function() {
  const backTopBtn = document.querySelector('.back-top');

  if (backTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        backTopBtn.classList.remove('hidden');
      } else {
        backTopBtn.classList.add('hidden');
      }
    });

    backTopBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

});
