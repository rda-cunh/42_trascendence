import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const VERTEX_SHADER = `varying vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

interface ShaderPreviewProps {
  fragmentShader: string;
  className?: string;
  label?: string;
}

export function ShaderPreview({
  fragmentShader,
  className = "",
  label = "Shader preview",
}: ShaderPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setRenderError(null);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
    };
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader,
      uniforms,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId = 0;
    let startTime = performance.now();

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const safeWidth = Math.max(1, Math.floor(width));
      const safeHeight = Math.max(1, Math.floor(height));
      renderer.setSize(safeWidth, safeHeight, false);
      uniforms.u_resolution.value.set(safeWidth, safeHeight);
    };

    const animate = () => {
      uniforms.u_time.value = (performance.now() - startTime) / 1000;
      try {
        renderer.render(scene, camera);
      } catch (err) {
        setRenderError(err instanceof Error ? err.message : "Shader failed to render");
        return;
      }
      frameId = requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    startTime = performance.now();
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [fragmentShader]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={label}
      className={`relative overflow-hidden bg-gray-950 ${className}`}
    >
      {renderError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950 p-4 text-center text-xs text-red-300">
          {renderError}
        </div>
      )}
    </div>
  );
}
