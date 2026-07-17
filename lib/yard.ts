export type Zone = "Hot" | "Warm" | "Cold";

export type Slot = {
  id: string;
  label: string;
  status?: string;
  containerId?: string;
  zone?: string;
  isIMO?: boolean;
  peso?: string;
  dataSaida?: string;
  dataChegada?: string;
};

export type MovementData = {
  containerId: string;
  weight: string;
  departure: string;
  zone: Zone;
  isIMO: boolean;
};

export const COLUMNS = ["A", "B", "C", "D", "E"];
export const ROWS_COUNT = 5;
export const LEVELS_COUNT = 7;

export function buildSlots(): Slot[] {
  const slots: Slot[] = [];

  for (const col of COLUMNS) {
    for (let row = 1; row <= ROWS_COUNT; row++) {
      for (let level = 1; level <= LEVELS_COUNT; level++) {
        const label = `${col}${row}-N${level}`;
        slots.push({ id: label, label });
      }
    }
  }
  return slots;
}

export const ZONE_OPTIONS: Zone[] = ["Hot", "Warm", "Cold"];
