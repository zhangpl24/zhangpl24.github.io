/* 与 instant navigation 配合：每次文档切换后重播主内容入场动画 */
(function () {
  function replayContentEnter() {
    var el = document.querySelector("article.md-content__inner");
    if (!el) return;
    el.classList.remove("zen-content-enter");
    void el.offsetWidth;
    el.classList.add("zen-content-enter");
  }

  if (typeof document$ !== "undefined" && document$.subscribe) {
    document$.subscribe(replayContentEnter);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", replayContentEnter);
  } else {
    replayContentEnter();
  }
})();
