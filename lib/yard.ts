export type Zone = "Hot" | "Warm" | "Cold";

export type Slot = {
  id: string;
  label: string;
  status?: string; // "Livre" ou "Ocupado"
  containerId?: string; // Ex: "HLXU-1001"
  zone?: string; // "Hot", "Warm", "Cold"
};

export type MovementData = {
  containerId: string;
  weight: string;
  departure: string;                                       
  zone: Zone;
};

export const GRID_SIZE = 5;
const COLUMNS = ["A", "B", "C", "D", "E"];

export function buildSlots(): Slot[] {
  const slots: Slot[] = [];
  let counter = 1;
  for (let row = 1; row <= GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const label = `${COLUMNS[col]}${row}-N${counter}`;
      slots.push({ id: label, label });
      counter < 5 ? counter++ : (counter = 1);
    }
  }
  return slots;
}

export const ZONE_OPTIONS: Zone[] = ["Hot", "Warm", "Cold"];
