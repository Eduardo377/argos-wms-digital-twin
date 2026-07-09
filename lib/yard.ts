export type Zone = "Hot" | "Warm" | "Cold"

export type Slot = {
  id: string
  label: string
}

export type MovementData = {
  containerId: string
  weight: string
  departure: string
  zone: Zone
}

export const GRID_SIZE = 5
const COLUMNS = ["A", "B", "C", "D", "E"]

// Builds a GRID_SIZE x GRID_SIZE matrix of yard slots.
// Label format follows the brief: "A1-N1", "B2-N2", ...
export function buildSlots(): Slot[] {
  const slots: Slot[] = []
  let counter = 1
  for (let row = 1; row <= GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const label = `${COLUMNS[col]}${row}-N${counter}`
      slots.push({ id: label, label })
      counter++
    }
  }
  return slots
}

export const ZONE_OPTIONS: Zone[] = ["Hot", "Warm", "Cold"]
