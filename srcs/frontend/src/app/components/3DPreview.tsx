import { Box, RotateCcw, ZoomIn } from "lucide-react";
import { useState } from "react";

interface ThreeDPreviewProps {
  imageUrl: string;
  title: string;
}

export function ThreeDPreview({ imageUrl, title }: ThreeDPreviewProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setRotation((prev) => ({
      x: prev.x + dy * 0.5,
      y: prev.y + dx * 0.5,
    }));
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden relative">
      <div
        className="aspect-square flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isDragging ? "none" : "transform 0.3s ease",
          }}
        >
          <img src={imageUrl} alt={title} className="w-3/4 mx-auto pointer-events-none" draggable={false} />
        </div>
      </div>
      <div className="absolute bottom-3 left-3 flex gap-2">
        <button
          onClick={() => setRotation({ x: 0, y: 0 })}
          className="p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900 transition-colors"
          title="Reset rotation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      <div className="absolute top-3 right-3 px-2 py-1 bg-purple-600/80 backdrop-blur-sm rounded text-white text-xs font-medium flex items-center gap-1">
        <Box className="w-3 h-3" />
        3D Preview
      </div>
      <p className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400">Drag to rotate</p>
    </div>
  );
}
