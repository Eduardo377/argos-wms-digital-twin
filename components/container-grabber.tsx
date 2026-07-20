import { GripVertical, Package } from "lucide-react";

type ContainerGrabberProps = {
  containerReady: boolean;
  isGrabbed: boolean;
  displayId: string;
  weight: string;
  zone: string;
  onGrab: () => void;
};

export function ContainerGrabber({
  containerReady,
  isGrabbed,
  displayId,
  weight,
  zone,
  onGrab,
}: ContainerGrabberProps) {
  if (!containerReady) return null;

  return (
    <div className="rounded-xl border border-dashed border-primary/50 bg-primary/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Package className="size-4 text-primary" aria-hidden="true" />
        Clique para fisgar o contêiner
      </div>
      <div
        onClick={onGrab}
        className={`inline-flex items-center gap-3 rounded-lg border border-primary px-4 py-3 text-foreground transition-all ${
          isGrabbed
            ? "bg-primary/30 opacity-50 cursor-grabbing"
            : "bg-primary/15 hover:bg-primary/20 cursor-pointer"
        }`}
      >
        <GripVertical className="size-5 text-primary" aria-hidden="true" />
        <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Package className="size-5" aria-hidden="true" />
        </span>
        <div className="leading-tight">
          <p className="font-mono text-sm font-semibold">{displayId}</p>
          <p className="text-xs text-muted-foreground">
            {weight ? `${weight} t` : "peso n/d"} · Zona {zone}
          </p>
        </div>
      </div>
    </div>
  );
}
