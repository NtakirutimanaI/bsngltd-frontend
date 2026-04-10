import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  once?: boolean;
}

/**
 * A component that reveals its children with an animation when they enter the viewport.
 * Works well with the 'fade-in-up' and other animation classes defined in pages.
 */
export function ScrollReveal({ 
  children, 
  className = "", 
  delay = 0, 
  threshold = 0.1,
  once = true 
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && domRef.current) {
            observer.unobserve(domRef.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      });
    }, { threshold });

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once]);

  return (
    <div
      ref={domRef}
      className={`${className} ${isVisible ? "is-visible" : "is-hidden"}`}
      style={{
        animationDelay: `${delay}s`,
        // If not yet visible, we might want to ensure it doesn't flicker
        opacity: isVisible ? undefined : 0,
        visibility: isVisible ? "visible" : "hidden",
        transition: isVisible ? `opacity 0.3s ease-out` : "none"
      }}
    >
      {children}
    </div>
  );
}
