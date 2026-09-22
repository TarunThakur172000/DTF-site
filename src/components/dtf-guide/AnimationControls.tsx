import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";

interface AnimationControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  disablePrev: boolean;
  disableNext: boolean;
}

export function AnimationControls({
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  disablePrev,
  disableNext,
}: AnimationControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <ControlButton label="Previous step" onClick={onPrev} disabled={disablePrev}>
        <ChevronLeft size={18} />
      </ControlButton>

      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
        aria-pressed={isPlaying}
        className="flex items-center justify-center w-11 h-11 rounded-full bg-primary-900 text-white hover:bg-accent-600 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent-600"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
      </button>

      <ControlButton label="Next step" onClick={onNext} disabled={disableNext}>
        <ChevronRight size={18} />
      </ControlButton>
    </div>
  );
}

function ControlButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex items-center justify-center w-10 h-10 rounded-full border border-primary-100 text-primary-900 hover:border-accent-400 hover:text-accent-600 transition-colors duration-200 disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-accent-600"
    >
      {children}
    </button>
  );
}
