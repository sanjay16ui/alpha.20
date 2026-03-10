import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const DOT_SIZE = 4;
const RING_SIZE = 24;
const RING_HOVER = 40;
export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);

  const springConfig = { damping: 20, stiffness: 150 };
  const ringXSpring = useSpring(ringX, springConfig);
  const ringYSpring = useSpring(ringY, springConfig);

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleHover = (e) => {
      const interactive = e.target.closest("a, button, [role='button'], input, select, textarea");
      setIsHovering(!!interactive);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("mouseenter", handleEnter);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleHover);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("mouseenter", handleEnter);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleHover);
    };
  }, [visible, mouseX, mouseY, ringX, ringY]);

  if (!visible) return null;

  const scale = isClicking ? 0.6 : 1;

  return (
    <>
      {/* Soft cyan glow following the cursor */}
      <motion.div
        className="fixed pointer-events-none z-[20]"
        style={{
          left: ringXSpring,
          top: ringYSpring,
          x: "-50%",
          y: "-50%",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,229,255,0.14) 0%, rgba(0,229,255,0) 70%)",
        }}
        animate={{ opacity: isHovering ? 0.26 : 0.18, scale: isClicking ? 0.9 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: mouseX,
          top: mouseY,
          x: "-50%",
          y: "-50%",
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: "50%",
          background: "#00E5FF",
        }}
        animate={{
          scale: isHovering ? 0 : scale,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="fixed pointer-events-none z-[9999] rounded-full border-2 border-[#00E5FF]"
        style={{
          left: ringXSpring,
          top: ringYSpring,
          x: "-50%",
          y: "-50%",
          width: RING_SIZE,
          height: RING_SIZE,
          opacity: 0.4,
          borderColor: "#00E5FF",
        }}
        animate={{
          width: isHovering ? RING_HOVER : RING_SIZE,
          height: isHovering ? RING_HOVER : RING_SIZE,
          opacity: isHovering ? 0.8 : 0.4,
          scale,
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
