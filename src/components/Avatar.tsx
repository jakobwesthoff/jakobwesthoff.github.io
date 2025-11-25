import { useEffect, useState } from "preact/hooks";
import FaceLooker from "./FaceLooker";

interface AvatarProps {
  src: string;
  width: number;
  height: number;
  alt: string;
  // FaceLooker props
  gazeSpriteSrc: string;
  gazeSpriteWidth: number;
  gazeSpriteHeight: number;
}

export default function Avatar({
  src,
  width,
  height,
  alt,
  gazeSpriteSrc,
  gazeSpriteWidth,
  gazeSpriteHeight,
}: AvatarProps) {
  // FaceLooker overlay positioning - tweak these values to align the face
  const FACE_SCALE = 0.54; // Scale factor for the face overlay
  const FACE_OFFSET_X = 4; // Horizontal offset in pixels
  const FACE_OFFSET_Y = -28; // Vertical offset in pixels

  const [shake, setShake] = useState(false);
  const [isLooking, setIsLooking] = useState(false);

  useEffect(() => {
    // Trigger shake animation on mount
    const timer = setTimeout(() => {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Random shake every 15-30 seconds
    let timer: ReturnType<typeof setTimeout>;

    const scheduleRandomShake = () => {
      const randomDelay = Math.random() * (120000 - 60000) + 60000; // Random between 60-120 seconds
      timer = setTimeout(() => {
        setShake(true);
        setTimeout(() => setShake(false), 600);
        scheduleRandomShake(); // Schedule the next shake
      }, randomDelay);
    };

    scheduleRandomShake();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative mx-auto mb-6 overflow-hidden rounded-full shadow-2xl ring-4 ring-white/90 ${shake ? "animate-shake" : ""}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {/* Base avatar image */}
      <img
        src={src}
        width={width}
        height={height}
        alt={alt}
        loading="eager"
        className="h-full w-full rounded-full object-cover"
        style="filter: contrast(1.1) brightness(1.05);"
      />

      {/* FaceLooker overlay */}
      <div
        className="mask-radial-fade absolute transition-opacity ease-in-out"
        style={{
          transitionDuration: "350ms",
          width: `${width * FACE_SCALE}px`,
          height: `${height * FACE_SCALE}px`,
          left: `50%`,
          top: `50%`,
          filter: "contrast(1.1) brightness(1.05)",
          transform: `translate(calc(-50% + ${FACE_OFFSET_X}px), calc(-50% + ${FACE_OFFSET_Y}px))`,
          opacity: isLooking ? 1 : 0,
        }}
      >
        <FaceLooker
          spriteSrc={gazeSpriteSrc}
          spriteWidth={gazeSpriteWidth}
          spriteHeight={gazeSpriteHeight}
          size={width * FACE_SCALE}
          className=""
          debug={false}
          onCenter={() => setIsLooking(false)}
          onLooking={() => setIsLooking(true)}
        />
      </div>
    </div>
  );
}
