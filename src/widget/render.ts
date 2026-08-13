import type { RingView } from "../crdt/index.js";
import { getNeighbors } from "../crdt/index.js";

import { galleryImages } from "./assets.js";

const styles = `
  :host {
    display: block;
    font-family: "Times New Roman", Times, serif;
    --bg: #ebdce3; 
    --text: #1a0a13;
    --accent: #820b29;
  }

  .widget {
    background: linear-gradient(135deg, var(--bg) 0%, #d4e0d7 100%);
    border: 1px solid #a99ca3;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.15);
    color: var(--text);
    max-width: 380px;
    margin: 20px auto; 
    padding: 10px 15px;
    position: relative;
    z-index: 1;
  }

  /* Floating weirdcore elements */
  .float-text {
    position: absolute;
    font-size: 11px;
    letter-spacing: 2px;
    opacity: 0.35;
    pointer-events: none;
    animation: float 6s ease-in-out infinite alternate;
    font-style: italic;
  }
  .float-1 { top: 5px; left: 5px; transform: rotate(-12deg); color: red; }
  .float-2 { bottom: 5px; right: 15px; font-size: 14px; animation-duration: 8s; }
  .float-3 { top: 30%; right: 5px; writing-mode: vertical-rl; letter-spacing: 5px; }

  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); filter: blur(0px); }
    100% { transform: translateY(8px) rotate(4deg); filter: blur(1px); }
  }

  .widget-layout {
    display: flex;
    gap: 15px;
    align-items: stretch;
    max-height: 140px; /* Constrains height so member list scrolls */
  }

  .left-col {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .right-col {
    width: 130px;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    overflow: hidden;
    border-left: 1px dashed rgba(0,0,0,0.2);
    padding-left: 10px;
    display: flex;
    flex-direction: column;
  }
  .right-col.collapsed {
    width: 0;
    padding-left: 0;
    border-left-color: transparent;
    opacity: 0;
    margin-left: -15px; /* collapse the gap */
  }

  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    position: relative;
    z-index: 2;
  }

  .nav-link {
    text-decoration: none;
    color: var(--accent);
    background: transparent;
    border-bottom: 1px solid var(--accent);
    padding: 2px 4px;
    font-size: 12px;
    letter-spacing: 1px;
    transition: all 0.3s;
  }
  .nav-link[href="#"] {
    opacity: 0.3;
    pointer-events: none;
  }
  .nav-link:hover {
    background: var(--text);
    color: var(--bg);
    letter-spacing: 3px;
  }

  .title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: filter 0.3s, transform 0.3s;
  }
  .title-container:hover {
    filter: drop-shadow(0 0 5px red);
    transform: scale(1.05);
  }

  .center {
    font-size: 1.2em;
    font-style: italic;
    text-transform: lowercase;
    letter-spacing: 3px;
    color: var(--text);
    text-shadow: 2px 2px 4px rgba(0,0,0,0.15);
  }
  
  .subtitle {
    font-size: 9px;
    letter-spacing: 2px;
    opacity: 0.6;
    font-family: "Courier New", monospace;
  }

  /* Carousel layout fix to prevent reflow flicker */
  .carousel-container {
    width: 100%;
    height: 90px;
    position: relative;
    margin-top: auto;
    z-index: 5;
  }

  .carousel-inner {
    position: absolute;
    top: 0; left: 0; 
    width: 100%; height: 100%;
    border: 1px solid rgba(0,0,0,0.2);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    cursor: zoom-in;
    background: #000;
    transition: box-shadow 0.4s, border 0.4s;
    overflow: hidden;
  }

  .carousel-inner:hover {
    z-index: 50;
    border: 1px solid #fff;
    box-shadow: 0 4px 25px rgba(0,0,0,0.4);
  }

  .carousel-inner img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: var(--tx, 50%) var(--ty, 50%);
    filter: sepia(0.3) saturate(1.2) contrast(0.9);
    transform-origin: var(--tx, 50%) var(--ty, 50%);
    transition: filter 0.4s, transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .carousel-inner:hover img {
    transform: scale(2.5);
    filter: none;
  }

  .carousel-next-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 9px;
    color: var(--accent);
    background: rgba(235, 220, 227, 0.9);
    padding: 2px 5px;
    opacity: 0;
    transition: opacity 0.3s, background 0.2s, color 0.2s;
    font-style: italic;
    border: 1px solid var(--accent);
    letter-spacing: 1px;
    cursor: pointer;
    z-index: 100;
    font-family: inherit;
  }

  .carousel-container:hover .carousel-next-btn {
    opacity: 1;
    animation: indicateSpin 0.6s infinite alternate;
  }

  .carousel-next-btn:hover {
    background: var(--text);
    color: var(--bg);
  }

  @keyframes indicateSpin {
    0% { transform: translateX(0); }
    100% { transform: translateX(2px); }
  }

  /* Slot machine spin transition */
  .carousel-inner.spinning-out img {
    animation: spinOut 0.2s cubic-bezier(0.5, 0, 1, 1) forwards;
  }
  .carousel-inner.spinning-in img {
    animation: spinIn 0.2s cubic-bezier(0, 0, 0.2, 1) forwards;
  }

  @keyframes spinOut {
    0% { transform: translateX(0); filter: blur(0); opacity: 1; }
    100% { transform: translateX(100%); filter: blur(8px); opacity: 0.5; }
  }
  @keyframes spinIn {
    0% { transform: translateX(-100%); filter: blur(8px); opacity: 0.5; }
    100% { transform: translateX(0); filter: blur(0); opacity: 1; }
  }

  .member-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    z-index: 2;
    padding-right: 4px;
    scrollbar-width: thin;
    scrollbar-color: var(--accent) transparent;
  }
  .member-list::-webkit-scrollbar {
    width: 2px;
  }
  .member-list::-webkit-scrollbar-track {
    background: transparent;
  }
  .member-list::-webkit-scrollbar-thumb {
    background: var(--accent);
  }
  .member-list::-webkit-scrollbar-thumb:hover {
    background: red;
  }

  .member-item {
    display: flex;
    flex-direction: column;
    padding: 6px 0;
    color: var(--text);
    text-decoration: none;
    font-size: 11px;
    border-bottom: 1px solid rgba(0,0,0,0.05);
    transition: background 0.2s, padding-left 0.2s, letter-spacing 0.2s;
  }
  .member-item:hover {
    background: rgba(255,0,0,0.05);
    padding-left: 8px;
    letter-spacing: 1px;
  }
  .member-item.current {
    color: red;
    font-style: italic;
  }
  .member-name {
    opacity: 0.5;
    font-size: 9px;
  }

  .status-msg {
    text-align: center;
    padding: 30px;
    font-size: 1.2em;
    letter-spacing: 5px;
    opacity: 0.7;
    filter: blur(0.5px);
    animation: breathe 3s infinite alternate;
  }

  @keyframes breathe {
    0% { filter: blur(0px); opacity: 0.8; }
    100% { filter: blur(2px); opacity: 0.4; letter-spacing: 8px; }
  }
`;

type WidgetStatus = "loading" | "loaded" | "error" | "empty";

export function renderWidget(
  container: HTMLElement,
  view: RingView | null,
  currentUrl: string,
  status: WidgetStatus = "loaded",
): void {
  if (!container.shadowRoot) {
    container.attachShadow({ mode: "open" });
  }

  const root = container.shadowRoot!;

  if (status === "loading") {
    root.innerHTML = `<style>${styles}</style>
      <div class="widget"><div class="status-msg">w a k e  u p</div></div>`;
    return;
  }

  if (status === "error") {
    root.innerHTML = `<style>${styles}</style>
      <div class="widget"><div class="status-msg">l o s t</div></div>`;
    return;
  }

  if (status === "empty" || !view || view.members.length === 0) {
    root.innerHTML = `<style>${styles}</style>
      <div class="widget"><div class="status-msg">e m p t y</div></div>`;
    return;
  }

  const { prev, next } = getNeighbors(view.members, currentUrl);

  const memberListHtml = view.members
    .map((m) => {
      const isCurrent = m.url === currentUrl;
      return `<a class="member-item${isCurrent ? " current" : ""}" href="${m.url}">
      <span class="member-url">${m.url}</span>
      <span class="member-name">${m.name}</span>
    </a>`;
    })
    .join("");

  // Always start with 'dontwaste.jpg' which is now at index 0
  const initialIdx = 0;

  root.innerHTML = `
    <style>${styles}</style>
    <div class="widget">
      <div class="float-text float-1">saling sentuh</div>
      <div class="float-text float-2">menyentuh brow</div>
      <div class="float-text float-3">saling sentuh</div>
      
      <div class="widget-layout">
        <div class="left-col">
          <div class="bar">
            <a class="nav-link" href="${prev?.url || "#"}" title="${prev?.name || "previous"}">prev</a>
            <div class="title-container" id="ring-title" title="toggle members">
              <div class="center">${view.name}</div>
              <div class="subtitle">webring</div>
            </div>
            <a class="nav-link" href="${next?.url || "#"}" title="${next?.name || "next"}">next</a>
          </div>
          
          <div class="carousel-container" id="carousel">
            <div class="carousel-inner" id="carousel-inner">
              <img id="carousel-img" src="${galleryImages[initialIdx]}" alt="cursed" />
            </div>
            <button class="carousel-next-btn" id="carousel-next" title="next image">next -></button>
          </div>
        </div>

        <div class="right-col" id="right-col">
          <div class="member-list">
            ${memberListHtml}
          </div>
        </div>
      </div>
    </div>
  `;

  const titleBtn = root.getElementById("ring-title");
  const rightCol = root.getElementById("right-col");
  const carousel = root.getElementById("carousel");
  const carouselInner = root.getElementById("carousel-inner");
  const carouselImg = root.getElementById("carousel-img") as HTMLImageElement;
  const nextBtn = root.getElementById("carousel-next");

  // Setup Global Lightbox
  let globalLightbox = document.getElementById("da-ring-global-lightbox");
  let globalLightboxImg = document.getElementById(
    "da-ring-global-lightbox-img",
  ) as HTMLImageElement;

  if (!globalLightbox) {
    const style = document.createElement("style");
    style.innerHTML = `
      .da-ring-lightbox {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.85);
        z-index: 2147483647;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
        backdrop-filter: blur(5px);
      }
      .da-ring-lightbox.active {
        opacity: 1;
        pointer-events: auto;
        cursor: zoom-out;
      }
      .da-ring-lightbox img {
        max-width: 95vw;
        max-height: 95vh;
        object-fit: contain;
        border: 2px solid #820b29;
        box-shadow: 0 0 50px rgba(0,0,0,1);
        transform: scale(0.9);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .da-ring-lightbox.active img {
        transform: scale(1);
      }
    `;
    document.head.appendChild(style);

    globalLightbox = document.createElement("div");
    globalLightbox.id = "da-ring-global-lightbox";
    globalLightbox.className = "da-ring-lightbox";

    globalLightboxImg = document.createElement("img");
    globalLightboxImg.id = "da-ring-global-lightbox-img";
    globalLightboxImg.alt = "expanded view";

    globalLightbox.appendChild(globalLightboxImg);
    document.body.appendChild(globalLightbox);

    globalLightbox.addEventListener("click", () => {
      globalLightbox!.classList.remove("active");
    });
  }

  if (titleBtn && rightCol) {
    titleBtn.addEventListener("click", () => {
      rightCol.classList.toggle("collapsed");
    });
  }

  if (carousel && carouselInner && carouselImg) {
    let currentIdx = initialIdx;
    let isSpinning = false;

    carousel.addEventListener("mousemove", (e) => {
      const rect = carousel.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      carouselInner.style.setProperty("--tx", x + "%");
      carouselInner.style.setProperty("--ty", y + "%");
    });

    carousel.addEventListener("mouseleave", () => {
      // Reset to center smoothly when mouse leaves
      carouselInner.style.setProperty("--tx", "50%");
      carouselInner.style.setProperty("--ty", "50%");
    });

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (isSpinning) return;
        isSpinning = true;

        carouselInner.classList.add("spinning-out");

        setTimeout(() => {
          currentIdx = (currentIdx + 1) % galleryImages.length;
          carouselImg.src = galleryImages[currentIdx];

          carouselInner.classList.remove("spinning-out");
          carouselInner.classList.add("spinning-in");

          setTimeout(() => {
            carouselInner.classList.remove("spinning-in");
            isSpinning = false;
          }, 200);
        }, 200);
      });
    }

    if (globalLightbox && globalLightboxImg) {
      carouselInner.addEventListener("click", () => {
        globalLightboxImg.src = galleryImages[currentIdx];
        globalLightbox!.classList.add("active");
      });
    }
  }
}
