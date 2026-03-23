import { X, GripVertical } from "lucide-react";
import { ReactNode, useState, useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  draggable?: boolean;
}

export function Modal({ isOpen, onClose, title, children, size = "md", draggable = false }: ModalProps) {
  const [animationClass, setAnimationClass] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const animations = [
        "animate-slide-top",
        "animate-slide-bottom",
        "animate-slide-left",
        "animate-slide-right",
        "animate-zoom-diverse",
        "animate-rotate-diverse"
      ];
      const randomAnim = animations[Math.floor(Math.random() * animations.length)];
      setAnimationClass(randomAnim);
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggable || !modalRef.current) return;
    setIsDragging(true);
    const rect = modalRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !modalRef.current) return;
      setPosition({
        x: e.clientX - dragOffset.x - (window.innerWidth / 2 - modalRef.current.offsetWidth / 2),
        y: e.clientY - dragOffset.y - 100
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-xs",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-[1050] overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-3 pt-24">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-backdrop transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className={`relative w-full ${sizeClasses[size]} bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col ${animationClass} ${draggable ? 'cursor-move' : ''}`}
          style={{ 
            maxHeight: 'calc(100vh - 120px)',
            transform: draggable ? `translate(${position.x}px, ${position.y}px)` : undefined
          }}
        >
          {/* Header */}
          <div 
            ref={headerRef}
            onMouseDown={handleMouseDown}
            className={`flex items-center justify-between p-2 border-b border-gray-100 dark:border-gray-700 ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
          >
            <div className="flex items-center gap-2 flex-1">
              {draggable && (
                <GripVertical className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              )}
              <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-2.5 overflow-y-auto custom-scrollbar text-xs">{children}</div>
        </div>
      </div>
    </div>
  );
}
