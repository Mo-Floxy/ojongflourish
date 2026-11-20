import { motion } from "framer-motion";
import { Music2, Music4, AudioLines } from "lucide-react";

const NOTES = [
  { Icon: Music4, left: "47%", top: "12%", size: 26, delay: 0, duration: 7, drift: 18, tilt: -12 },
  { Icon: Music2, left: "41%", top: "58%", size: 18, delay: 1.6, duration: 9, drift: 26, tilt: 10 },
  { Icon: AudioLines, left: "58%", top: "8%", size: 20, delay: 0.9, duration: 8, drift: 14, tilt: 8 },
  { Icon: Music4, left: "92%", top: "26%", size: 22, delay: 2.2, duration: 10, drift: 22, tilt: 14 },
  { Icon: Music2, left: "37%", top: "30%", size: 14, delay: 3.1, duration: 8.5, drift: 16, tilt: -18 },
];

export default function FloatingNotes() {
  return (
    <div className="floating-notes" aria-hidden="true">
      {NOTES.map(({ Icon, left, top, size, delay, duration, drift, tilt }, i) => (
        <motion.span
          key={i}
          className="floating-notes__item"
          style={{ left, top }}
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: [0, 0.85, 0.85, 0],
            y: [10, -drift, -drift * 1.8, -drift * 2.2],
            rotate: [0, tilt, -tilt, tilt * 0.5],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.25, 0.7, 1],
          }}
        >
          <Icon size={size} strokeWidth={1.6} />
        </motion.span>
      ))}
    </div>
  );
}
