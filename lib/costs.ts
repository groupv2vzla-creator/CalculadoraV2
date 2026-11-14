export const MATERIALS = [
  { name: "Transparente", price: 12.13 },
  { name: "Blanco brillante", price: 18.20 },
  { name: "Negro brillante", price: 18.20 },
  { name: "Negro mate", price: 18.20 },
  { name: "Colores estándar", price: 18.20 },
  { name: "Dorado espejo", price: 24.27 },
  { name: "Plateado espejo", price: 24.27 },
  { name: "Rose gold espejo", price: 24.27 }
] as const;
export const EIGHTH_AREA_M2 = 0.61 * 0.61;
export const DEFAULT_LASER_RATE = 0.80;
export type Layer = { name: string; material: string; width: number; height: number; minutes: number; override: string };
export const initialLayers: Layer[] = [
 { name: "Base", material: "Blanco brillante", width: 280, height: 80, minutes: 2, override: "" },
 { name: "Relieve", material: "Negro brillante", width: 250, height: 50, minutes: 1.1, override: "" },
 { name: "Material adicional", material: "", width: 0, height: 0, minutes: 0, override: "" },
 { name: "Material adicional", material: "", width: 0, height: 0, minutes: 0, override: "" }
];
export function calculate(layer: Layer, rate = DEFAULT_LASER_RATE) {
 const supplier = MATERIALS.find(m => m.name === layer.material)?.price ?? 0;
 const override = Number(layer.override);
 const sheetPrice = layer.override.trim() !== "" && Number.isFinite(override) && override > 0 ? override : supplier;
 const area = Math.max(0, layer.width) * Math.max(0, layer.height) / 1_000_000;
 const materialCost = layer.material ? area / EIGHTH_AREA_M2 * sheetPrice : 0;
 const laserCost = layer.material ? Math.max(0, layer.minutes) * Math.max(0, rate) : 0;
 return { supplier, sheetPrice, materialCost, laserCost, subtotal: materialCost + laserCost };
}
