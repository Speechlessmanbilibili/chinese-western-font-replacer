/* 案头设计系统 · 界面工具
   字体扩展共用；只处理表现层，不读写扩展配置。 */
(() => {
  "use strict";
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  // 原生 details 的高度过渡：保留键盘语义，只在指针点击时接管动画。
  function animateDetails(details) {
    if (!details || details.dataset.kitDetails === "1") return;
    details.dataset.kitDetails = "1";
    const summary = details.querySelector("summary");
    const content = details.querySelector(":scope > :not(summary)");
    if (!summary || !content) return;
    let expanded = details.open;
    let heightAnimation = null;
    let contentAnimation = null;
    const finish = () => {
      heightAnimation?.cancel();
      contentAnimation?.cancel();
      heightAnimation = contentAnimation = null;
      details.open = expanded;
      details.dataset.expanded = String(expanded);
      details.style.removeProperty("height");
      details.style.removeProperty("overflow");
      content.style.removeProperty("opacity");
    };
    summary.addEventListener("click", event => {
      if (event.target.closest("button, a, input, label")) return;
      event.preventDefault();
      const startHeight = details.getBoundingClientRect().height;
      const startOpacity = details.open ? Number(getComputedStyle(content).opacity) : 0;
      expanded = !expanded;
      if (reducedMotion.matches) { finish(); return; }
      heightAnimation?.cancel();
      contentAnimation?.cancel();
      details.open = true;
      details.dataset.expanded = String(expanded);
      details.style.height = "auto";
      const endHeight = expanded ? details.getBoundingClientRect().height
        : summary.getBoundingClientRect().height + parseFloat(getComputedStyle(details).borderTopWidth) + parseFloat(getComputedStyle(details).borderBottomWidth);
      details.style.height = startHeight + "px";
      details.style.overflow = "hidden";
      const timing = { duration: expanded ? 220 : 170, easing: "cubic-bezier(.2,.8,.2,1)" };
      heightAnimation = details.animate([{ height: startHeight + "px" }, { height: endHeight + "px" }], timing);
      contentAnimation = content.animate([{ opacity: startOpacity }, { opacity: expanded ? 1 : 0 }], timing);
      heightAnimation.onfinish = finish;
    });
    window.addEventListener("resize", finish);
    reducedMotion.addEventListener("change", () => { if (reducedMotion.matches) finish(); });
  }

  function initDetails(root = document) {
    $$("details", root)
      .forEach(animateDetails);
  }

  // 目录随滚动高亮；不改变滚动行为，点击仍用原生锚点。
  function initRailSpy() {
    const links = $$(".rail a[href^='#']");
    if (!links.length) return;
    const sections = links.map(link => document.getElementById(link.getAttribute("href").slice(1))).filter(Boolean);
    const visible = new Map();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      let best = null;
      let bestRatio = 0;
      for (const [id, ratio] of visible) if (ratio > bestRatio) { best = id; bestRatio = ratio; }
      if (!best) return;
      for (const link of links) {
        if (link.getAttribute("href") === "#" + best) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    }, { rootMargin: "-72px 0px -55% 0px", threshold: [0, .2, .5, 1] });
    sections.forEach(section => observer.observe(section));
  }

  window.DSH = { animateDetails, initDetails, initRailSpy };
})();
