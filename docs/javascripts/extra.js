/* 与 instant navigation 配合：每次文档切换后重播主内容入场动画 */
(function () {
  function replayContentEnter() {
    var el = document.querySelector("article.md-content__inner");
    if (!el) return;
    el.classList.remove("zen-content-enter");
    void el.offsetWidth;
    el.classList.add("zen-content-enter");
  }

  /* 全站启用：每次导航后为 body 挂上动效类（aurora / stagger / 视差由 extra.css 限定） */
  function syncHeroMode() {
    document.body.classList.add("zen-motion-hero");
  }

  var scrollOpts = { passive: true };
  var scrollHandler = null;
  var parallaxPending = false;

  function unbindParallax() {
    if (scrollHandler) {
      window.removeEventListener("scroll", scrollHandler, scrollOpts);
      scrollHandler = null;
    }
    document.documentElement.style.removeProperty("--zen-hero-parallax");
  }

  function bindParallax() {
    unbindParallax();
    if (!document.body.classList.contains("zen-motion-hero")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    scrollHandler = function () {
      if (parallaxPending) return;
      parallaxPending = true;
      window.requestAnimationFrame(function () {
        parallaxPending = false;
        if (!document.body.classList.contains("zen-motion-hero")) return;
        var y = window.scrollY || document.documentElement.scrollTop || 0;
        document.documentElement.style.setProperty("--zen-hero-parallax", y * 0.07 + "px");
      });
    };

    window.addEventListener("scroll", scrollHandler, scrollOpts);
    scrollHandler();
  }

  function onDocumentUpdate() {
    syncHeroMode();
    replayContentEnter();
    bindParallax();
  }

  if (typeof document$ !== "undefined" && document$.subscribe) {
    document$.subscribe(onDocumentUpdate);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onDocumentUpdate);
  } else {
    onDocumentUpdate();
  }
})();
