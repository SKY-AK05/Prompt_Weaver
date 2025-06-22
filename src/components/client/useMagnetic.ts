import { useRef, useEffect } from "react";

export function useMagnetic(radius = 120, strength = 0.18) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId: number;
    let base = { x: 0, y: 0 };
    let mouse = { x: -1000, y: -1000 };
    let hasBase = false;

    function onMouseMove(e: MouseEvent) {
      mouse = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("mousemove", onMouseMove);

    function animate() {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        if (!hasBase) {
          base = { x: rect.left, y: rect.top };
          hasBase = true;
        }
        const iconCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        const dx = mouse.x - iconCenter.x;
        const dy = mouse.y - iconCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let tx = 0, ty = 0;
        if (dist < radius) {
          tx = dx * strength;
          ty = dy * strength;
        }
        ref.current.style.transform = `translate(${tx}px, ${ty}px)`;
      }
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [radius, strength]);

  return ref;
} 