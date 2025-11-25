/**
 * FaceLooker Component
 *
 * Interactive face tracking component that displays different gaze directions
 * based on cursor position using a pre-generated sprite sheet.
 *
 * Based on: https://github.com/kylan02/face_looker
 * Sprite generation: https://replicate.com/kylan02/face-looker
 *
 * This implementation is a custom Preact rewrite of the original vanilla JS
 * version, adapted specifically for use within this Astro/Preact portfolio page.
 * The original face_looker used individual image files; this version uses an
 * optimized sprite sheet with Astro's image optimization pipeline.
 */

import { useEffect, useState, useRef, useCallback } from "preact/hooks";

interface FaceLookerProps {
  /** Optimized sprite image source from Astro's getImage */
  spriteSrc: string;
  /** Width of the sprite image in pixels */
  spriteWidth: number;
  /** Height of the sprite image in pixels */
  spriteHeight: number;
  /** Grid size (11x11 = 121 images) */
  gridSize?: number;
  /** Minimum pupil value (default: -15) */
  minValue?: number;
  /** Maximum pupil value (default: 15) */
  maxValue?: number;
  /** Step size between grid positions (default: 3) */
  step?: number;
  /** Display size for the face looker */
  size: number;
  /** Additional CSS classes */
  className?: string;
  /** Show debug information */
  debug?: boolean;
  /** Timeout in ms before reverting to center gaze (default: 1200ms) */
  idleTimeout?: number;
  /** Callback when gaze moves to center (0, 0) */
  onCenter?: () => void;
  /** Callback when gaze moves away from center */
  onLooking?: () => void;
}

export default function FaceLooker({
  spriteSrc,
  spriteWidth,
  spriteHeight,
  gridSize = 11,
  minValue = -15,
  maxValue = 15,
  step = 3,
  size,
  className = "",
  debug = false,
  idleTimeout = 1200,
  onCenter,
  onLooking,
}: FaceLookerProps) {
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });
  const [gridPosition, setGridPosition] = useState({ col: 0, row: 0 });
  const [currentPupil, setCurrentPupil] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate grid position for given pupil coordinates
  const getBackgroundPosition = useCallback(
    (pupilX: number, pupilY: number): { x: number; y: number; col: number; row: number } => {
      // Calculate grid indices (0-10)
      const colIndex = Math.round((pupilX - minValue) / step);
      const rowIndex = Math.round((pupilY - minValue) / step);

      // Clamp to valid range
      const clampedCol = Math.max(0, Math.min(gridSize - 1, colIndex));
      const clampedRow = Math.max(0, Math.min(gridSize - 1, rowIndex));

      // Calculate pixel offset
      // We need to offset the sprite by (col * cellSize) pixels to the LEFT
      // and (row * cellSize) pixels UP
      // Since we're displaying at 'size' pixels, but the optimized sprite has smaller cells,
      // we need to calculate based on the actual cell size in the optimized sprite
      const actualCellSize = spriteWidth / gridSize;
      const xOffset = -(clampedCol * actualCellSize);
      const yOffset = -(clampedRow * actualCellSize);

      return { x: xOffset, y: yOffset, col: clampedCol, row: clampedRow };
    },
    []
  );

  // Clamp value to valid range
  const clamp = useCallback((value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
  }, []);

  // Quantize normalized value to grid step
  const quantizeToGrid = useCallback(
    (val: number): number => {
      const raw = minValue + ((val + 1) * (maxValue - minValue)) / 2; // [-1,1] -> [minValue, maxValue]
      const snapped = Math.round(raw / step) * step;
      return clamp(snapped, minValue, maxValue);
    },
    [clamp]
  );

  // Update pupil position and background
  const updatePupilPosition = useCallback(
    (pupilX: number, pupilY: number, triggerCallback = true) => {
      setCurrentPupil({ x: pupilX, y: pupilY });
      const pos = getBackgroundPosition(pupilX, pupilY);
      setBackgroundPosition({ x: pos.x, y: pos.y });
      setGridPosition({ col: pos.col, row: pos.row });

      // Trigger callbacks based on whether we're at center or looking
      if (triggerCallback) {
        if (pupilX === 0 && pupilY === 0) {
          onCenter?.();
        } else {
          onLooking?.();
        }
      }
    },
    [
      setBackgroundPosition,
      setGridPosition,
      setBackgroundPosition,
      setCurrentPupil,
      onCenter,
      onLooking,
    ]
  );

  // Fade to center - just trigger callback without updating position
  const fadeToCenter = useCallback(() => {
    onCenter?.();
  }, [onCenter]);

  // Handle mouse/touch movement
  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate normalized coordinates [-1, 1]
      const nx = (clientX - centerX) / (rect.width / 2);
      const ny = (centerY - clientY) / (rect.height / 2); // Inverted Y

      // Clamp to [-1, 1]
      const clampedX = clamp(nx, -1, 1);
      const clampedY = clamp(ny, -1, 1);

      // Quantize to grid
      const pupilX = quantizeToGrid(clampedX);
      const pupilY = quantizeToGrid(clampedY);

      updatePupilPosition(pupilX, pupilY);

      // Clear existing idle timer
      if (idleTimerRef.current !== null) {
        clearTimeout(idleTimerRef.current);
      }

      // Set new idle timer to fade to center
      idleTimerRef.current = setTimeout(() => {
        fadeToCenter();
      }, idleTimeout);
    },
    [updatePupilPosition, quantizeToGrid, clamp, idleTimerRef, containerRef]
  );

  useEffect(() => {
    // Initialize at center position (0, 0) without triggering callback
    updatePupilPosition(0, 0, false);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    // Touch move handler
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        handlePointerMove(touch.clientX, touch.clientY);
      }
    };

    // Touch end handler - start idle timer
    const handleTouchEnd = () => {
      if (idleTimerRef.current !== null) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        fadeToCenter();
      }, idleTimeout);
    };

    // Attach global event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (idleTimerRef.current !== null) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [idleTimeout]);

  // Calculate the actual cell size in the optimized sprite
  const actualCellSize = spriteWidth / gridSize;

  // Calculate the scale factor needed to make the sprite cell match our display size
  const scaleFactor = size / actualCellSize;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={containerRef}
        className={`face-looker ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundImage: `url(${spriteSrc})`,
          backgroundSize: `${spriteWidth * scaleFactor}px ${spriteHeight * scaleFactor}px`,
          backgroundPosition: `${backgroundPosition.x * scaleFactor}px ${backgroundPosition.y * scaleFactor}px`,
          backgroundRepeat: "no-repeat",
        }}
        role="img"
        aria-label="Interactive face that follows your gaze"
      />
      {debug && (
        <div className="rounded bg-black/80 px-4 py-3 font-mono text-sm text-white">
          <div>
            Pupil X: {currentPupil.x} | Pupil Y: {currentPupil.y}
          </div>
          <div>
            Grid Position: ({gridPosition.col}, {gridPosition.row})
          </div>
          <div>
            BG Position: ({backgroundPosition.x.toFixed(1)}px, {backgroundPosition.y.toFixed(1)}px)
          </div>
          <div>
            Cell Size: {actualCellSize.toFixed(1)}px | Scale: {scaleFactor.toFixed(2)}x
          </div>
          <div>
            Sprite Size: {spriteWidth}x{spriteHeight}px
          </div>
        </div>
      )}
    </div>
  );
}
