"use client";

import { useEffect, useRef } from "react";

// Inspired by Scrolltide #sh-fluted-noir ("Noir Glass") + "Silver Caustics":
// Real-time WebGL architectural reeded/fluted glass shader in monochrome smoke,
// silver, and subtle deep-teal caustic refraction responding smoothly to pointer X/Y.
// Zero generic purple neon. Gracefully degrades to crisp CSS gradient under reduced-motion or no WebGL.

const VERT_SRC = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG_SRC = `
precision mediump float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_res;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.02 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_res.x / max(u_res.y, 1.0);

  // Vertical architectural fluted/reeded glass columns (34 crisp flutes across viewport)
  float flutes = 34.0;
  float fluteCoord = uv.x * flutes;
  float flutePhase = fract(fluteCoord) - 0.5;
  // Optical cylindrical lens refraction per vertical glass rib
  float refractOffset = sin(flutePhase * 3.14159) * 0.032;
  float ribSpecular = pow(max(0.0, 1.0 - abs(flutePhase * 2.0)), 6.0);

  vec2 refracted = vec2(uv.x + refractOffset, uv.y);

  // Slow architectural caustic light bands drifting behind the reeded glass
  float t = u_time * 0.16;
  vec2 lightPos = mix(vec2(0.68, 0.44), u_mouse, 0.42);
  vec2 d = (refracted - lightPos) * vec2(aspect, 1.0);
  float dist = length(d);

  float flow1 = fbm(vec2(refracted.x * 2.4 + t * 0.6, refracted.y * 2.1 - t * 0.4));
  float flow2 = fbm(vec2(refracted.x * 4.2 - t * 0.35 + flow1 * 0.9, refracted.y * 3.0 + t * 0.25));

  // Silver caustic shimmer + deep architectural teal optical edge
  float caustic = smoothstep(0.32, 0.85, flow2) * exp(-dist * 1.45);
  float horizonGlow = exp(-pow((refracted.y - 0.34 - flow1 * 0.14) * 3.1, 2.0)) * 0.34;
  float pointerHalo = exp(-dist * 2.6) * 0.42;

  // Base deep charcoal obsidian (#0A0B0E)
  vec3 obsidian = vec3(0.039, 0.043, 0.055);
  // Smoked silver glass highlight
  vec3 silver = vec3(0.68, 0.72, 0.76);
  // Subtle mineral teal refraction (zero purple neon)
  vec3 mineralTeal = vec3(0.08, 0.48, 0.45);
  // Warm champagne horizon edge (Billet eclipse nod)
  vec3 warmBronze = vec3(0.55, 0.44, 0.31);

  vec3 col = obsidian;
  col += silver * (caustic * 0.42 + horizonGlow * 0.38);
  col += mineralTeal * (pointerHalo * 0.62 + caustic * 0.26);
  col += warmBronze * (exp(-length((refracted - vec2(0.76, 0.28)) * vec2(aspect, 1.0)) * 2.4) * 0.24);

  // Crisp vertical flute bevel highlights + shadow troughs
  float trough = smoothstep(0.42, 0.5, abs(flutePhase));
  col *= (1.0 - trough * 0.28);
  col += (silver * 0.065 + mineralTeal * 0.04) * ribSpecular * (0.45 + pointerHalo + caustic);

  // Subtle architectural vignette so left headline contrast stays crisp (>= 12:1)
  float leftMask = smoothstep(0.0, 0.55, uv.x);
  col = mix(obsidian * 0.95, col, 0.52 + 0.48 * leftMask);

  // Micro film grain dither prevents 8-bit banding
  float grain = (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.018;
  col += grain;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export function NoirFlutedShader() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uRes = gl.getUniformLocation(prog, "u_res");

    const mouse = { x: 0.72, y: 0.48, tx: 0.72, ty: 0.48 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      mouse.tx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      mouse.ty = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let rafId = 0;
    const start = performance.now();

    const renderFrame = (now: number) => {
      resize();
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      gl.uniform1f(uTime, prefersReduced ? 4.2 : (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!prefersReduced) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}
