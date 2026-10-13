import {
  resolveGlass,
  type VeyGlassMode,
  type VeyGlassProfile,
  type VeyGlassValue,
} from "../glass";
import {
  glassNumber,
  observeGlassTokens,
  readGlassTokens,
} from "./glass-tokens";

const ns = "http://www.w3.org/2000/svg";
let sequence = 0;

/** 生成圆角矩形法线场：中心稳定、边缘产生折射。 */
export function displacementMap(
  width: number,
  height: number,
  radius: number,
  rimWidth: number,
) {
  const ratio = Math.min(1, 512 / Math.max(width, height));
  const w = Math.max(1, Math.round(width * ratio));
  const h = Math.max(1, Math.round(height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const context = canvas.getContext("2d");
  if (!context) return "";
  const pixels = context.createImageData(w, h);
  const r = Math.max(1, Math.min(radius * ratio, w / 2, h / 2));
  const rim = Math.max(1, Math.min(rimWidth * ratio, w / 4, h / 4));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - w / 2;
      const py = y + 0.5 - h / 2;
      const qx = Math.abs(px) - (w / 2 - r);
      const qy = Math.abs(py) - (h / 2 - r);
      const ox = Math.max(qx, 0);
      const oy = Math.max(qy, 0);
      const length = Math.hypot(ox, oy);
      const distance = length + Math.min(Math.max(qx, qy), 0) - r;
      const bend =
        distance <= 0 ? Math.pow(Math.max(0, 1 + distance / rim), 2) : 0;
      const nx = length
        ? (ox / length) * Math.sign(px)
        : qx > qy
          ? Math.sign(px)
          : 0;
      const ny = length
        ? (oy / length) * Math.sign(py)
        : qy >= qx
          ? Math.sign(py)
          : 0;
      const index = (y * w + x) * 4;
      pixels.data[index] = Math.round(127.5 + nx * bend * 127.5);
      pixels.data[index + 1] = Math.round(127.5 + ny * bend * 127.5);
      pixels.data[index + 2] = 128;
      pixels.data[index + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  return canvas.toDataURL();
}

/** 在真实 DOM 表面挂载材质，并负责刷新与释放 SVG 资源。 */
export function mountGlass(element: HTMLElement, profile: VeyGlassProfile) {
  const id = `veydeck-react-glass-${++sequence}`;
  let svg: SVGSVGElement | undefined;
  let image: SVGElement | undefined;
  let displacement: SVGElement | undefined;
  let blur: SVGElement | undefined;
  let geometry = "";
  let frame = 0;
  let disposed = false;
  let value: VeyGlassValue | undefined;
  let tokens: Record<string, string> = {};
  let radiusText = "0px";
  let stylesDirty = true;
  const reduced = window.matchMedia?.("(prefers-reduced-transparency: reduce)");
  const forced = window.matchMedia?.("(forced-colors: active)");
  const chromium = /(?:Chrome|Chromium|Edg)\//.test(navigator.userAgent);
  const backdrop =
    typeof CSS !== "undefined" &&
    CSS.supports?.("backdrop-filter", "blur(1px)");

  function releaseFilter() {
    svg?.remove();
    svg = undefined;
    image = displacement = blur = undefined;
    geometry = "";
  }

  function paint() {
    frame = 0;
    if (disposed) return;
    if (stylesDirty) {
      const style = getComputedStyle(element);
      tokens = readGlassTokens(style);
      radiusText = style.borderTopLeftRadius;
      stylesDirty = false;
    }
    const options = resolveGlass(value, profile, tokens);
    const blurMax = glassNumber(tokens, "blur-max", "px", 80);
    const refractionMax = glassNumber(tokens, "refraction-max", "px", 100);
    const rimWidth = glassNumber(tokens, "rim-width", "px", 64);
    const saturation = glassNumber(tokens, "saturation", "", 3);
    const solid =
      !options.enabled ||
      reduced?.matches ||
      forced?.matches ||
      !backdrop ||
      (options.opacity === 1 && options.refraction === 0 && options.blur === 0);
    let mode: VeyGlassMode = solid
      ? "solid"
      : chromium && options.refraction > 0
        ? "refraction"
        : "blur";
    const opacity = solid ? 1 : options.opacity;
    element.style.setProperty(
      "--vl-glass-opacity",
      `${Number((opacity * 100).toFixed(4))}%`,
    );
    element.style.setProperty(
      "--vl-glass-highlight",
      `${solid ? 0 : options.highlight * glassNumber(tokens, "highlight-scale")}`,
    );
    let filter = solid
      ? "none"
      : `blur(${options.blur * blurMax}px) saturate(${saturation})`;
    if (mode === "refraction") {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      const radius = radiusText.endsWith("%")
        ? (Math.min(width, height) * Number.parseFloat(radiusText)) / 100
        : Number.parseFloat(radiusText) || 0;
      const nextGeometry = `${width}/${height}/${radius}/${rimWidth}`;
      if (width > 0 && height > 0) {
        if (!svg) {
          svg = document.createElementNS(ns, "svg");
          svg.setAttribute("aria-hidden", "true");
          svg.setAttribute("data-veydeck-glass-filter", "");
          svg.style.cssText =
            "position:fixed;width:0;height:0;pointer-events:none";
          const defs = document.createElementNS(ns, "defs");
          const node = document.createElementNS(ns, "filter");
          node.id = id;
          node.setAttribute("color-interpolation-filters", "sRGB");
          node.setAttribute("x", "-25%");
          node.setAttribute("y", "-25%");
          node.setAttribute("width", "150%");
          node.setAttribute("height", "150%");
          image = document.createElementNS(ns, "feImage");
          image.setAttribute("result", "map");
          image.setAttribute("x", "0");
          image.setAttribute("y", "0");
          image.setAttribute("width", "100%");
          image.setAttribute("height", "100%");
          image.setAttribute("preserveAspectRatio", "none");
          displacement = document.createElementNS(ns, "feDisplacementMap");
          displacement.setAttribute("in", "SourceGraphic");
          displacement.setAttribute("in2", "map");
          displacement.setAttribute("xChannelSelector", "R");
          displacement.setAttribute("yChannelSelector", "G");
          blur = document.createElementNS(ns, "feGaussianBlur");
          node.append(image, displacement, blur);
          defs.append(node);
          svg.append(defs);
          document.body.append(svg);
        }
        if (geometry !== nextGeometry) {
          const map = displacementMap(width, height, radius, rimWidth);
          if (map) image!.setAttribute("href", map);
          else mode = "blur";
          geometry = nextGeometry;
        }
        displacement!.setAttribute(
          "scale",
          `${options.refraction * refractionMax}`,
        );
        blur!.setAttribute("stdDeviation", `${options.blur * blurMax}`);
        if (mode === "refraction")
          filter = `url("#${id}") saturate(${saturation})`;
      } else mode = "blur";
    }
    if (mode !== "refraction") releaseFilter();
    element.style.setProperty("--vl-glass-filter", filter);
    element.dataset.glassMode = mode;
  }

  function schedule() {
    if (!disposed && !frame) frame = requestAnimationFrame(paint);
  }
  const invalidateStyles = () => {
    stylesDirty = true;
    schedule();
  };
  const resize = new ResizeObserver(invalidateStyles);
  resize.observe(element);
  const stopTokens = observeGlassTokens(element, invalidateStyles);
  reduced?.addEventListener("change", schedule);
  forced?.addEventListener("change", schedule);
  return {
    update(next: VeyGlassValue | undefined) {
      value = next;
      schedule();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      stopTokens();
      reduced?.removeEventListener("change", schedule);
      forced?.removeEventListener("change", schedule);
      releaseFilter();
    },
  };
}
