"use client";

import { useEffect, useRef } from "react";

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    const gl2 = canvas.getContext("experimental-webgl");
    const context = (gl || gl2) as WebGLRenderingContext;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    function syncSize() {
      const c = canvas!;
      const w = c.clientWidth || 1280;
      const h = c.clientHeight || 720;
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
    }

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(syncSize);
      observer.observe(canvas);
      return () => observer.disconnect();
    }

    syncSize();

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;

void main() {
    vec2 uv = v_texCoord;
    vec2 center = vec2(0.5);
    
    float wave = sin(uv.x * 20.0 + u_time * 5.0) * 0.1;
    wave += sin(uv.x * 10.0 - u_time * 3.0) * 0.05;
    
    float dist = abs(uv.y - 0.5 - wave);
    
    float thickness = 0.01;
    float glow = 0.15;
    
    float pulse = (sin(u_time * 2.0) * 0.5 + 0.5) * 0.2 + 0.8;
    float line = smoothstep(thickness, 0.0, dist);
    float glowEffect = smoothstep(glow, 0.0, dist) * 0.4;
    
    vec3 color = vec3(0.05, 0.65, 0.91);
    vec3 finalColor = color * (line + glowEffect) * pulse;
    
    float edgeFade = smoothstep(0.0, 0.2, uv.x) * smoothstep(1.0, 0.8, uv.x);
    
    gl_FragColor = vec4(finalColor * edgeFade, (line + glowEffect) * edgeFade);
}`;

    function createShader(type: number, src: string) {
      const s = context.createShader(type);
      if (!s) return null;
      context.shaderSource(s, src);
      context.compileShader(s);
      return s;
    }

    const vertexShader = createShader(context.VERTEX_SHADER, vs);
    const fragmentShader = createShader(context.FRAGMENT_SHADER, fs);
    if (!vertexShader || !fragmentShader) return;

    const program = context.createProgram();
    if (!program) return;
    context.attachShader(program, vertexShader);
    context.attachShader(program, fragmentShader);
    context.linkProgram(program);
    context.useProgram(program);

    const buf = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, buf);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), context.STATIC_DRAW);

    const pos = context.getAttribLocation(program, "a_position");
    context.enableVertexAttribArray(pos);
    context.vertexAttribPointer(pos, 2, context.FLOAT, false, 0, 0);

    const uTime = context.getUniformLocation(program, "u_time");
    const uRes = context.getUniformLocation(program, "u_resolution");
    const uMouse = context.getUniformLocation(program, "u_mouse");

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    window.addEventListener("mousemove", (event) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    });

    function render(t: number) {
      const c = canvas!;
      syncSize();
      context.viewport(0, 0, c.width, c.height);
      if (uTime) context.uniform1f(uTime, t * 0.001);
      if (uRes) context.uniform2f(uRes, c.width, c.height);
      if (uMouse) context.uniform2f(uMouse, mouse.x, mouse.y);
      context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    }

    const animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      const ext = context.getExtension("WEBGL_lose_context");
      ext?.loseContext();
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}