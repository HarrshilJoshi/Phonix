import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";
import "./Orb.css";

export default function Orb({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
}) {
  const ctnDom = useRef(null);

  const vert = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const frag = /* glsl */ `
    precision highp float;

    uniform float iTime;
    uniform vec3 iResolution;
    uniform float hue;
    uniform float hover;
    uniform float rot;
    uniform float hoverIntensity;
    varying vec2 vUv;

    vec3 rgb2yiq(vec3 c) {
      float y = dot(c, vec3(0.299, 0.587, 0.114));
      float i = dot(c, vec3(0.596, -0.274, -0.322));
      float q = dot(c, vec3(0.211, -0.523, 0.312));
      return vec3(y, i, q);
    }
    
    vec3 yiq2rgb(vec3 c) {
      float r = c.x + 0.956 * c.y + 0.621 * c.z;
      float g = c.x - 0.272 * c.y - 0.647 * c.z;
      float b = c.x - 1.106 * c.y + 1.703 * c.z;
      return vec3(r, g, b);
    }
    
    vec3 adjustHue(vec3 color, float hueDeg) {
      float hueRad = hueDeg * 3.14159265 / 180.0;
      vec3 yiq = rgb2yiq(color);
      float cosA = cos(hueRad);
      float sinA = sin(hueRad);
      float i = yiq.y * cosA - yiq.z * sinA;
      float q = yiq.y * sinA + yiq.z * cosA;
      yiq.y = i;
      yiq.z = q;
      return yiq2rgb(yiq);
    }

    vec3 hash33(vec3 p3) {
      p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
      p3 += dot(p3, p3.yxz + 19.19);
      return -1.0 + 2.0 * fract(vec3(
        p3.x + p3.y,
        p3.x + p3.z,
        p3.y + p3.z
      ) * p3.zyx);
    }

    float snoise3(vec3 p) {
      const float K1 = 0.333333333;
      const float K2 = 0.166666667;
      vec3 i = floor(p + (p.x + p.y + p.z) * K1);
      vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
      vec3 e = step(vec3(0.0), d0 - d0.yzx);
      vec3 i1 = e * (1.0 - e.zxy);
      vec3 i2 = 1.0 - e.zxy * (1.0 - e);
      vec3 d1 = d0 - (i1 - K2);
      vec3 d2 = d0 - (i2 - K1);
      vec3 d3 = d0 - 0.5;
      vec4 h = max(0.6 - vec4(
        dot(d0, d0),
        dot(d1, d1),
        dot(d2, d2),
        dot(d3, d3)
      ), 0.0);
      vec4 n = h * h * h * h * vec4(
        dot(d0, hash33(i)),
        dot(d1, hash33(i + i1)),
        dot(d2, hash33(i + i2)),
        dot(d3, hash33(i + 1.0))
      );
      return dot(vec4(31.316), n);
    }

    vec4 extractAlpha(vec3 colorIn) {
      float a = max(max(colorIn.r, colorIn.g), colorIn.b);
      return vec4(colorIn.rgb / (a + 1e-5), a);
    }

    const vec3 baseColor1 = vec3(0.980, 0.380, 0.020);  // #FA6105 fire orange-red
const vec3 baseColor2 = vec3(0.118, 0.565, 1.0);    // #1E90FF ocean/sky blue
const vec3 baseColor3 = vec3(0.180, 0.0,   0.420);  // #2E006B deep violet (core)
const float innerRadius = 0.55;
const float noiseScale = 0.70;

    float light1(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * attenuation);
    }
    float light2(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * dist * attenuation);
    }

    vec4 draw(vec2 uv) {
      vec3 color1 = adjustHue(baseColor1, hue);
      vec3 color2 = adjustHue(baseColor2, hue);
      vec3 color3 = adjustHue(baseColor3, hue);
      
      float ang = atan(uv.y, uv.x);
      float len = length(uv);
      float invLen = len > 0.0 ? 1.0 / len : 0.0;
      
      float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
      float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
      float d0 = distance(uv, (r0 * invLen) * uv);
      float v0 = light1(1.0, 10.0, d0);
      v0 *= smoothstep(r0 * 1.05, r0, len);
      float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;
      
      float a = iTime * -1.0;
      vec2 pos = vec2(cos(a), sin(a)) * r0;
      float d = distance(uv, pos);
      float v1 = light2(1.5, 5.0, d);
      v1 *= light1(1.0, 50.0, d0);
      
      float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
      float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);
      
      vec3 col = mix(color1, color2, cl);
      col = mix(color3, col, v0);
      col = (col + v1) * v2 * v3;
      col = clamp(col, 0.0, 1.0);
      
      return extractAlpha(col);
    }

    vec4 mainImage(vec2 fragCoord) {
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      
      float angle = rot;
      float s = sin(angle);
      float c = cos(angle);
      uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);
      
      uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);
      
      return draw(uv);
    }

    void main() {
      vec2 fragCoord = vUv * iResolution.xy;
      vec4 col = mainImage(fragCoord);
      gl_FragColor = vec4(col.rgb * col.a, col.a);
    }
  `;

  useEffect(() => {
    const container = ctnDom.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Vec3(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height
          ),
        },
        hue: { value: hue },
        hover: { value: 0 },
        rot: { value: 0 },
        hoverIntensity: { value: hoverIntensity },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!container) return;
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width * dpr, height * dpr);
      gl.canvas.style.width = width + "px";
      gl.canvas.style.height = height + "px";
      program.uniforms.iResolution.value.set(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height
      );
    }
    window.addEventListener("resize", resize);
    resize();

    let targetHover = 0;
    let lastTime = 0;
    let currentRot = 0;
    const rotationSpeed = 0.3;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;
      const size = Math.min(width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const uvX = ((x - centerX) / size) * 2.0;
      const uvY = ((y - centerY) / size) * 2.0;

      if (Math.sqrt(uvX * uvX + uvY * uvY) < 0.8) {
        targetHover = 1;
      } else {
        targetHover = 0;
      }
    };

    const handleMouseLeave = () => {
      targetHover = 0;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    let rafId;
    const update = (t) => {
      rafId = requestAnimationFrame(update);
      const dt = (t - lastTime) * 0.001;
      lastTime = t;
      program.uniforms.iTime.value = t * 0.001;
      program.uniforms.hue.value = hue;
      program.uniforms.hoverIntensity.value = hoverIntensity;

      const effectiveHover = forceHoverState ? 1 : targetHover;
      program.uniforms.hover.value += (effectiveHover - program.uniforms.hover.value) * 0.1;

      if (rotateOnHover && effectiveHover > 0.5) {
        currentRot += dt * rotationSpeed;
      }
      program.uniforms.rot.value = currentRot;

      renderer.render({ scene: mesh });
    };
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hue, hoverIntensity, rotateOnHover, forceHoverState]);

  return <div ref={ctnDom} className="orb-container" />;
}










// // import { useEffect, useRef } from "react";
// // import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";
// // import "./Orb.css";

// // export default function Orb({
// //   hue = 0,
// //   hoverIntensity = 0.2,
// //   rotateOnHover = true,
// //   forceHoverState = false,
// // }) {
// //   const ctnDom = useRef(null);

// //   const vert = /* glsl */ `
// //     precision highp float;
// //     attribute vec2 position;
// //     attribute vec2 uv;
// //     varying vec2 vUv;
// //     void main() {
// //       vUv = uv;
// //       gl_Position = vec4(position, 0.0, 1.0);
// //     }
// //   `;

// //   const frag = /* glsl */ `
// //     precision highp float;

// //     uniform float iTime;
// //     uniform vec3  iResolution;
// //     uniform float hue;
// //     uniform float hover;
// //     uniform float rot;
// //     uniform float hoverIntensity;
// //     uniform float morphProgress;   // 0 = orb, 1 = full waves
// //     varying vec2 vUv;

// //     /* ── colour helpers ── */
// //     vec3 rgb2yiq(vec3 c) {
// //       return vec3(
// //         dot(c, vec3(0.299,  0.587,  0.114)),
// //         dot(c, vec3(0.596, -0.274, -0.322)),
// //         dot(c, vec3(0.211, -0.523,  0.312))
// //       );
// //     }
// //     vec3 yiq2rgb(vec3 c) {
// //       return vec3(
// //         c.x + 0.956*c.y + 0.621*c.z,
// //         c.x - 0.272*c.y - 0.647*c.z,
// //         c.x - 1.106*c.y + 1.703*c.z
// //       );
// //     }
// //     vec3 adjustHue(vec3 color, float hueDeg) {
// //       float rad  = hueDeg * 3.14159265 / 180.0;
// //       vec3  yiq  = rgb2yiq(color);
// //       float cosA = cos(rad), sinA = sin(rad);
// //       yiq.yz = vec2(yiq.y*cosA - yiq.z*sinA,
// //                     yiq.y*sinA + yiq.z*cosA);
// //       return yiq2rgb(yiq);
// //     }

// //     /* ── noise ── */
// //     vec3 hash33(vec3 p3) {
// //       p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
// //       p3 += dot(p3, p3.yxz + 19.19);
// //       return -1.0 + 2.0 * fract(vec3(
// //         p3.x+p3.y, p3.x+p3.z, p3.y+p3.z) * p3.zyx);
// //     }
// //     float snoise3(vec3 p) {
// //       const float K1 = 0.333333333, K2 = 0.166666667;
// //       vec3 i  = floor(p + (p.x+p.y+p.z)*K1);
// //       vec3 d0 = p - (i - (i.x+i.y+i.z)*K2);
// //       vec3 e  = step(vec3(0.0), d0 - d0.yzx);
// //       vec3 i1 = e*(1.0-e.zxy);
// //       vec3 i2 = 1.0-e.zxy*(1.0-e);
// //       vec4 h  = max(0.6 - vec4(dot(d0,d0),
// //                                dot(d0-(i1-K2),d0-(i1-K2)),
// //                                dot(d0-(i2-K1),d0-(i2-K1)),
// //                                dot(d0-0.5,    d0-0.5)), 0.0);
// //       vec4 n  = h*h*h*h * vec4(
// //         dot(d0,      hash33(i)),
// //         dot(d0-(i1-K2), hash33(i+i1)),
// //         dot(d0-(i2-K1), hash33(i+i2)),
// //         dot(d0-0.5,     hash33(i+1.0))
// //       );
// //       return dot(vec4(31.316), n);
// //     }

// //     vec4 extractAlpha(vec3 c) {
// //       float a = max(max(c.r,c.g),c.b);
// //       return vec4(c/(a+1e-5), a);
// //     }

// //     /* ── palette ── */
// //     const vec3 BASE1 = vec3(0.611765, 0.262745, 0.996078); // purple
// //     const vec3 BASE2 = vec3(0.298039, 0.760784, 0.913725); // cyan
// //     const vec3 BASE3 = vec3(0.062745, 0.078431, 0.600000); // deep blue
// //     const float INNER = 0.6;

// //     float light1(float I, float a, float d) { return I/(1.0+d*a); }
// //     float light2(float I, float a, float d) { return I/(1.0+d*d*a); }

// //     /* ── ORB ── */
// //     vec4 drawOrb(vec2 uv) {
// //       vec3 c1 = adjustHue(BASE1, hue);
// //       vec3 c2 = adjustHue(BASE2, hue);
// //       vec3 c3 = adjustHue(BASE3, hue);

// //       float ang    = atan(uv.y, uv.x);
// //       float len    = length(uv);
// //       float invLen = len > 0.0 ? 1.0/len : 0.0;

// //       float n0 = snoise3(vec3(uv*0.65, iTime*0.5))*0.5+0.5;
// //       float r0 = mix(mix(INNER,1.0,0.4), mix(INNER,1.0,0.6), n0);
// //       float d0 = distance(uv, r0*invLen*uv);

// //       float v0 = light1(1.0, 10.0, d0);
// //       v0 *= smoothstep(r0*1.05, r0, len);

// //       float cl = cos(ang + iTime*2.0)*0.5+0.5;

// //       vec2  spot = vec2(cos(-iTime), sin(-iTime))*r0;
// //       float v1   = light2(1.5, 5.0,  distance(uv, spot));
// //       v1 *= light1(1.0, 50.0, d0);

// //       float v2 = smoothstep(1.0,   mix(INNER,1.0,n0*0.5), len);
// //       float v3 = smoothstep(INNER, mix(INNER,1.0,0.5),    len);

// //       vec3 col = mix(c1, c2, cl);
// //       col = mix(c3, col, v0);
// //       col = (col + v1) * v2 * v3;
// //       return extractAlpha(clamp(col, 0.0, 1.0));
// //     }

// //     /* ── WAVES ── */
// //     vec4 drawWaves(vec2 sv) {
// //       // sv = screen UV (0..1)
// //       vec3 c1 = adjustHue(BASE1, hue);
// //       vec3 c2 = adjustHue(BASE2, hue);
// //       vec3 col = vec3(0.0);
// //       float t  = iTime * 0.55;

// //       // 7 wave lines spread evenly across the screen height
// //       for (int k = 0; k < 7; k++) {
// //         float fi     = float(k);
// //         float yOff   = (fi / 6.0) - 0.5;          // spread -0.5 .. +0.5
// //         float freq   = 2.2 + fi * 0.9;
// //         float amp    = 0.07 - fi * 0.006;
// //         float speed  = 0.35 + fi * 0.12;
// //         float phase  = fi * 1.57;

// //         float wave   = (sv.y - 0.5 - yOff)
// //           + amp * sin(sv.x * freq * 6.2831 + t * speed + phase)
// //           + amp * 0.45 * sin(sv.x * freq * 0.65 * 6.2831 + t * speed * 1.35 + phase + 1.1);

// //         float lw   = 0.0025 + fi * 0.0008;
// //         float glow = pow(lw / (abs(wave) + lw * 0.5), 1.6) * 0.65;

// //         vec3 lineCol = mix(c1, c2, (fi/6.0) + 0.25 * sin(t + fi));
// //         col += lineCol * glow;
// //       }
// //       return extractAlpha(clamp(col, 0.0, 1.0));
// //     }

// //     void main() {
// //       vec2 fragCoord = vUv * iResolution.xy;
// //       vec2 center    = iResolution.xy * 0.5;
// //       float size     = min(iResolution.x, iResolution.y);

// //       /* orb UV (centered, normalised, rotated, hover-distorted) */
// //       vec2 uv = (fragCoord - center) / size * 2.0;
// //       float s = sin(rot), c = cos(rot);
// //       uv = vec2(c*uv.x - s*uv.y, s*uv.x + c*uv.y);
// //       uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
// //       uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);

// //       /* screen UV (0..1) for waves */
// //       vec2 sv = fragCoord / iResolution.xy;

// //       vec4 orbCol  = drawOrb(uv);
// //       vec4 waveCol = drawWaves(sv);

// //       /* smooth cross-fade */
// //       vec4 col = mix(orbCol, waveCol, morphProgress);
// //       gl_FragColor = vec4(col.rgb * col.a, col.a);
// //     }
// //   `;

// //   useEffect(() => {
// //     const container = ctnDom.current;
// //     if (!container) return;

// //     /* ── WebGL setup ── */
// //     const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
// //     const gl = renderer.gl;
// //     gl.clearColor(0, 0, 0, 0);
// //     container.appendChild(gl.canvas);

// //     const geometry = new Triangle(gl);
// //     const program  = new Program(gl, {
// //       vertex: vert,
// //       fragment: frag,
// //       uniforms: {
// //         iTime:         { value: 0 },
// //         iResolution:   { value: new Vec3(gl.canvas.width, gl.canvas.height, 1) },
// //         hue:           { value: hue },
// //         hover:         { value: 0 },
// //         rot:           { value: 0 },
// //         hoverIntensity:{ value: hoverIntensity },
// //         morphProgress: { value: 0 },
// //       },
// //     });
// //     const mesh = new Mesh(gl, { geometry, program });

// //     /* ── resize ── */
// //     function resize() {
// //       if (!container) return;
// //       const dpr = window.devicePixelRatio || 1;
// //       const w   = container.clientWidth;
// //       const h   = container.clientHeight;
// //       renderer.setSize(w * dpr, h * dpr);
// //       gl.canvas.style.width  = w + "px";
// //       gl.canvas.style.height = h + "px";
// //       program.uniforms.iResolution.value.set(
// //         gl.canvas.width, gl.canvas.height,
// //         gl.canvas.width / gl.canvas.height
// //       );
// //     }
// //     window.addEventListener("resize", resize);
// //     resize();

// //     /* ── state ── */
// //     let targetHover   = 0;
// //     let targetMorph   = 0;   // driven by scroll
// //     let currentRot    = 0;
// //     let lastTime      = 0;

// //     /* ── hover detection ── */
// //     const onMouseMove = (e) => {
// //       const r    = container.getBoundingClientRect();
// //       const size = Math.min(r.width, r.height);
// //       const uvX  = ((e.clientX - r.left  - r.width  / 2) / size) * 2;
// //       const uvY  = ((e.clientY - r.top   - r.height / 2) / size) * 2;
// //       targetHover = Math.sqrt(uvX*uvX + uvY*uvY) < 0.8 ? 1 : 0;
// //     };
// //     container.addEventListener("mousemove",  onMouseMove);
// //     container.addEventListener("mouseleave", () => { targetHover = 0; });

// //     /* ── scroll → morph ── */
// //     const onWheel = (e) => {
// //       targetMorph = Math.max(0, Math.min(1, targetMorph + e.deltaY * 0.0012));
// //     };
// //     // Touch support
// //     let touchY0 = null;
// //     const onTouchStart = (e) => { touchY0 = e.touches[0].clientY; };
// //     const onTouchMove  = (e) => {
// //       if (touchY0 === null) return;
// //       targetMorph = Math.max(0, Math.min(1, targetMorph + (touchY0 - e.touches[0].clientY) * 0.003));
// //       touchY0 = e.touches[0].clientY;
// //     };
// //     window.addEventListener("wheel",      onWheel,      { passive: true });
// //     window.addEventListener("touchstart", onTouchStart, { passive: true });
// //     window.addEventListener("touchmove",  onTouchMove,  { passive: true });

// //     /* ── render loop ── */
// //     let rafId;
// //     const update = (t) => {
// //       rafId = requestAnimationFrame(update);
// //       const dt = (t - lastTime) * 0.001;
// //       lastTime = t;

// //       program.uniforms.iTime.value          = t * 0.001;
// //       program.uniforms.hue.value            = hue;
// //       program.uniforms.hoverIntensity.value = hoverIntensity;

// //       const effectiveHover = forceHoverState ? 1 : targetHover;
// //       program.uniforms.hover.value +=
// //         (effectiveHover - program.uniforms.hover.value) * 0.1;

// //       // Smooth morph
// //       program.uniforms.morphProgress.value +=
// //         (targetMorph - program.uniforms.morphProgress.value) * 0.04;

// //       if (rotateOnHover && effectiveHover > 0.5) currentRot += dt * 0.3;
// //       program.uniforms.rot.value = currentRot;

// //       renderer.render({ scene: mesh });
// //     };
// //     rafId = requestAnimationFrame(update);

// //     /* ── cleanup ── */
// //     return () => {
// //       cancelAnimationFrame(rafId);
// //       window.removeEventListener("resize",     resize);
// //       window.removeEventListener("wheel",      onWheel);
// //       window.removeEventListener("touchstart", onTouchStart);
// //       window.removeEventListener("touchmove",  onTouchMove);
// //       container.removeEventListener("mousemove",  onMouseMove);
// //       container.removeEventListener("mouseleave", () => {});
// //       if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
// //       gl.getExtension("WEBGL_lose_context")?.loseContext();
// //     };
// //   // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [hue, hoverIntensity, rotateOnHover, forceHoverState]);

// //   return <div ref={ctnDom} className="orb-container" />;
// // }







// import { useEffect, useRef } from "react";
// import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";
// import "./Orb.css";

// export default function Orb({
//   hue = 0,
//   hoverIntensity = 0.2,
//   rotateOnHover = true,
//   forceHoverState = false,
// }) {
//   const ctnDom = useRef(null);

//   const vert = /* glsl */ `
//     precision highp float;
//     attribute vec2 position;
//     attribute vec2 uv;
//     varying vec2 vUv;
//     void main() {
//       vUv = uv;
//       gl_Position = vec4(position, 0.0, 1.0);
//     }
//   `;

//   const frag = /* glsl */ `
//     precision highp float;

//     uniform float iTime;
//     uniform vec3  iResolution;
//     uniform float hue;
//     uniform float hover;
//     uniform float rot;
//     uniform float hoverIntensity;
//     uniform float morphProgress;
//     varying vec2 vUv;

//     const float PI  = 3.14159265359;
//     const float TAU = 6.28318530718;

//     /* ── hue rotation ── */
//     vec3 rgb2yiq(vec3 c){
//       return vec3(dot(c,vec3(0.299,0.587,0.114)),
//                   dot(c,vec3(0.596,-0.274,-0.322)),
//                   dot(c,vec3(0.211,-0.523,0.312)));
//     }
//     vec3 yiq2rgb(vec3 c){
//       return vec3(c.x+0.956*c.y+0.621*c.z,
//                   c.x-0.272*c.y-0.647*c.z,
//                   c.x-1.106*c.y+1.703*c.z);
//     }
//     vec3 shiftHue(vec3 col, float deg){
//       float hr=deg*PI/180.0;
//       vec3 yiq=rgb2yiq(col);
//       float ci=yiq.y*cos(hr)-yiq.z*sin(hr);
//       float cq=yiq.y*sin(hr)+yiq.z*cos(hr);
//       return yiq2rgb(vec3(yiq.x,ci,cq));
//     }

//     /* ── smooth noise ── */
//     float hash(float n){ return fract(sin(n)*43758.5453); }
//     float smoothNoise(float x){
//       float i=floor(x); float f=fract(x);
//       float u=f*f*(3.0-2.0*f);
//       return mix(hash(i),hash(i+1.0),u);
//     }

//     /* ── layered audio-frequency noise ── */
//     float audioNoise(float x, float t){
//       float v=0.0;
//       v += 0.38 * smoothNoise(x *  1.0 + t * 0.65);
//       v += 0.22 * smoothNoise(x *  2.0 - t * 1.10);
//       v += 0.13 * smoothNoise(x *  4.0 + t * 1.70);
//       v += 0.09 * smoothNoise(x *  8.0 - t * 2.30);
//       v += 0.07 * smoothNoise(x * 16.0 + t * 3.10);
//       v += 0.05 * sin(x * 3.0  + t * 2.2) * 0.5 + 0.25;
//       v += 0.06 * sin(x * 7.0  - t * 1.6) * 0.5 + 0.25;
//       return v;
//     }

//     /* ── one EQ ring ── */
//     float eqRing(vec2 uv, float radius, float thick,
//                  float noiseAmt, float t, float id){
//       float angle = atan(uv.y, uv.x);
//       float normA = angle / TAU + 0.5;
//       float n     = audioNoise(normA * (5.0 + id * 2.5) + id * 1.3, t * (0.45 + id * 0.28));
//       float wR    = radius + noiseAmt * (n - 0.5) * 2.0;
//       float d     = abs(length(uv) - wR);
//       return pow(thick / (d + thick * 0.35), 1.5);
//     }

//     /* ── full-screen wave lines ── */
//     vec3 drawWaves(vec2 sv, vec3 c1, vec3 c2, float t){
//       vec3 col = vec3(0.0);
//       for(int k=0; k<8; k++){
//         float fi    = float(k);
//         float yBase = fi / 7.0;
//         float freq  = 1.8 + fi * 0.75;
//         float amp   = 0.06 - fi * 0.004;
//         float speed = 0.38 + fi * 0.10;
//         float phase = fi * 1.47;
//         float wy = sv.y - yBase
//           + amp * sin(sv.x * freq * TAU + t * speed + phase)
//           + amp * 0.4 * sin(sv.x * freq * 0.6 * TAU + t * speed * 1.4 + phase + 1.2);
//         float lw   = 0.0028 + fi * 0.0005;
//         float glow = pow(lw / (abs(wy) + lw * 0.4), 1.6) * 0.72;
//         col += mix(c1, c2, fi/7.0 + 0.2*sin(t*0.7+fi)) * glow;
//       }
//       return clamp(col, 0.0, 1.0);
//     }

//     void main(){
//       vec2  fc     = vUv * iResolution.xy;
//       vec2  center = iResolution.xy * 0.5;
//       float size   = min(iResolution.x, iResolution.y);
//       vec2  uv     = (fc - center) / size * 2.0;

//       /* rotation */
//       float rs=sin(rot), rc=cos(rot);
//       uv = vec2(rc*uv.x-rs*uv.y, rs*uv.x+rc*uv.y);

//       /* hover ripple */
//       uv.x += hover*hoverIntensity*0.1*sin(uv.y*10.0+iTime);
//       uv.y += hover*hoverIntensity*0.1*sin(uv.x*10.0+iTime);

//       float t  = iTime;
//       float mp = morphProgress;

//       /* palette — cool orb, warm waves, blends on morph */
//       vec3 cold1 = shiftHue(vec3(0.0,  0.82, 1.0),  hue);
//       vec3 cold2 = shiftHue(vec3(0.52, 0.08, 1.0),  hue);
//       vec3 warm1 = shiftHue(vec3(1.0,  0.32, 0.04), hue);
//       vec3 warm2 = shiftHue(vec3(1.0,  0.06, 0.52), hue);
//       vec3 c1 = mix(cold1, warm1, mp);
//       vec3 c2 = mix(cold2, warm2, mp);

//       /* ── ORB: 5 EQ rings (unrolled — WebGL1 forbids dynamic array indexing) ── */
//       vec3 orbCol = vec3(0.0);
//       float ring0 = eqRing(uv, 0.38, 0.024, 0.15, t, 0.0);
//       float ring1 = eqRing(uv, 0.52, 0.019, 0.12, t, 1.0);
//       float ring2 = eqRing(uv, 0.65, 0.016, 0.09, t, 2.0);
//       float ring3 = eqRing(uv, 0.78, 0.013, 0.07, t, 3.0);
//       float ring4 = eqRing(uv, 0.90, 0.010, 0.05, t, 4.0);
//       orbCol += mix(c1, c2, 0.00) * ring0 * (0.65 + 0.35*sin(t*1.10+0.00));
//       orbCol += mix(c1, c2, 0.25) * ring1 * (0.65 + 0.35*sin(t*1.55+0.85));
//       orbCol += mix(c1, c2, 0.50) * ring2 * (0.65 + 0.35*sin(t*2.00+1.70));
//       orbCol += mix(c1, c2, 0.75) * ring3 * (0.65 + 0.35*sin(t*2.45+2.55));
//       orbCol += mix(c1, c2, 1.00) * ring4 * (0.65 + 0.35*sin(t*2.90+3.40));

//       /* inner glow */
//       orbCol += mix(c1,c2,0.5) * smoothstep(0.40, 0.0, length(uv)) * 0.20;
//       /* outer clip */
//       orbCol *= smoothstep(1.06, 0.94, length(uv));
//       orbCol  = clamp(orbCol, 0.0, 1.0);

//       /* ── WAVES ── */
//       vec2 sv = fc / iResolution.xy;
//       vec3 waveCol = drawWaves(sv, c1, c2, t);

//       /* ── cross-fade ── */
//       vec3 final = mix(orbCol, waveCol, mp);
//       float alpha = max(max(final.r,final.g),final.b);
//       gl_FragColor = vec4(final*alpha, alpha);
//     }
//   `;

//   useEffect(() => {
//     const container = ctnDom.current;
//     if (!container) return;

//     const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
//     const gl = renderer.gl;
//     gl.clearColor(0, 0, 0, 0);
//     container.appendChild(gl.canvas);

//     const geometry = new Triangle(gl);
//     const program  = new Program(gl, {
//       vertex: vert,
//       fragment: frag,
//       uniforms: {
//         iTime:          { value: 0 },
//         iResolution:    { value: new Vec3(gl.canvas.width, gl.canvas.height, 1) },
//         hue:            { value: hue },
//         hover:          { value: 0 },
//         rot:            { value: 0 },
//         hoverIntensity: { value: hoverIntensity },
//         morphProgress:  { value: 0 },
//       },
//     });
//     const mesh = new Mesh(gl, { geometry, program });

//     function resize() {
//       if (!container) return;
//       const dpr = window.devicePixelRatio || 1;
//       const w = container.clientWidth;
//       const h = container.clientHeight;
//       renderer.setSize(w * dpr, h * dpr);
//       gl.canvas.style.width  = w + "px";
//       gl.canvas.style.height = h + "px";
//       program.uniforms.iResolution.value.set(
//         gl.canvas.width, gl.canvas.height,
//         gl.canvas.width / gl.canvas.height
//       );
//     }
//     window.addEventListener("resize", resize);
//     resize();

//     let targetHover = 0;
//     let targetMorph = 0;
//     let currentRot  = 0;
//     let lastTime    = 0;

//     const onMouseMove = (e) => {
//       const r    = container.getBoundingClientRect();
//       const size = Math.min(r.width, r.height);
//       const uvX  = ((e.clientX - r.left  - r.width  / 2) / size) * 2;
//       const uvY  = ((e.clientY - r.top   - r.height / 2) / size) * 2;
//       const inside = Math.sqrt(uvX * uvX + uvY * uvY) < 0.98;
//       targetHover = inside ? 1 : 0;
//       targetMorph = inside ? 1 : 0;
//     };
//     const onMouseLeave = () => { targetHover = 0; targetMorph = 0; };

//     container.addEventListener("mousemove",  onMouseMove);
//     container.addEventListener("mouseleave", onMouseLeave);

//     let rafId;
//     const update = (t) => {
//       rafId = requestAnimationFrame(update);
//       const dt = (t - lastTime) * 0.001;
//       lastTime = t;

//       program.uniforms.iTime.value          = t * 0.001;
//       program.uniforms.hue.value            = hue;
//       program.uniforms.hoverIntensity.value = hoverIntensity;

//       const eh = forceHoverState ? 1 : targetHover;
//       const em = forceHoverState ? 1 : targetMorph;

//       program.uniforms.hover.value         += (eh - program.uniforms.hover.value)         * 0.08;
//       program.uniforms.morphProgress.value += (em - program.uniforms.morphProgress.value) * 0.035;

//       if (rotateOnHover && eh > 0.5) currentRot += dt * 0.3;
//       program.uniforms.rot.value = currentRot;

//       renderer.render({ scene: mesh });
//     };
//     rafId = requestAnimationFrame(update);

//     return () => {
//       cancelAnimationFrame(rafId);
//       window.removeEventListener("resize", resize);
//       container.removeEventListener("mousemove",  onMouseMove);
//       container.removeEventListener("mouseleave", onMouseLeave);
//       if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
//       gl.getExtension("WEBGL_lose_context")?.loseContext();
//     };
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [hue, hoverIntensity, rotateOnHover, forceHoverState]);

//   return <div ref={ctnDom} className="orb-container" />;
// }
