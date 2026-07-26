import React, { useEffect, useRef } from 'react';

interface ShaderCanvasProps {
  className?: string;
  isAnimated?: boolean;
}

export const ShaderCanvas: React.FC<ShaderCanvasProps> = ({ 
  className = 'w-full h-full',
  isAnimated = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      varying vec2 v_texCoord;

      void main() {
          vec2 uv = v_texCoord;
          
          // Wave animation based on time
          float wave = sin(uv.x * 20.0 + u_time * 5.0) * 0.1;
          wave += sin(uv.x * 10.0 - u_time * 3.0) * 0.05;
          
          // Calculate distance from center line with waves
          float dist = abs(uv.y - 0.5 - wave);
          
          // Line thickness and glow
          float thickness = 0.01;
          float glow = 0.15;
          
          float pulse = (sin(u_time * 2.0) * 0.5 + 0.5) * 0.2 + 0.8;
          float line = smoothstep(thickness, 0.0, dist);
          float glowEffect = smoothstep(glow, 0.0, dist) * 0.4;
          
          // Medical cyan color (#0EA5E9)
          vec3 color = vec3(0.05, 0.65, 0.91);
          vec3 finalColor = color * (line + glowEffect) * pulse;
          
          // Fade at edges
          float edgeFade = smoothstep(0.0, 0.2, uv.x) * smoothstep(1.0, 0.8, uv.x);
          
          gl_FragColor = vec4(finalColor * edgeFade, (line + glowEffect) * edgeFade);
      }
    `;

    function createShader(glCtx: WebGLRenderingContext, type: number, src: string) {
      const s = glCtx.createShader(type);
      if (!s) return null;
      glCtx.shaderSource(s, src);
      glCtx.compileShader(s);
      return s;
    }

    const vertShader = createShader(gl, gl.VERTEX_SHADER, vs);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fs);
    if (!vertShader || !fragShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');

    let animId: number;
    function render(t: number) {
      if (!gl || !canvas) return;
      syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, (isAnimated ? t : 1000) * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (isAnimated) {
        animId = requestAnimationFrame(render);
      }
    }

    render(0);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [isAnimated]);

  return (
    <canvas 
      ref={canvasRef} 
      className={className} 
      style={{ display: 'block' }} 
    />
  );
};
