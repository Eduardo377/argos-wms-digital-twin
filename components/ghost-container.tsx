import { Package } from "lucide-react";

type GhostContainerProps = {
  isGrabbed: boolean;
  mousePos: { x: number; y: number };
  displayId: string;
};

export function GhostContainer({
  isGrabbed,
  mousePos,
  displayId,
}: GhostContainerProps) {
  if (!isGrabbed) return null;

  return (
    <div
      className="fixed z-[9999] opacity-90 shadow-2xl pointer-events-none"
      style={{
        left: mousePos.x,
        top: mousePos.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="inline-flex items-center gap-3 rounded-lg border border-primary bg-primary/30 px-4 py-3 text-foreground backdrop-blur-sm">
        <Package className="size-5 text-primary" aria-hidden="true" />
        <div className="leading-tight">
          <span className="font-mono font-bold text-sm">{displayId}</span>
          <p className="text-xs opacity-80">Solte na vaga...</p>
        </div>
      </div>
    </div>
  );
}
