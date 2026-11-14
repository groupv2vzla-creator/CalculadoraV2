export type ConsumablesInput = { widthCm: number; heightCm: number; includeGlue: boolean };
export function calculateConsumables(input: ConsumablesInput) {
 const w = Math.max(0, Number(input.widthCm) || 0);
 const h = Math.max(0, Number(input.heightCm) || 0);
 if (!w || !h) return { envoplast: 0, glue: 0, bags: 0, tape: 0, total: 0, wraps: 0, bagType: "Sin medidas" };
 const max = Math.max(w, h);
 const wraps = max <= 60 ? 6 : max <= 80 ? 7 : max <= 120 ? 8 : max <= 160 ? 10 : 10 + 2 * Math.ceil((max - 160) / 40);
 const bagType = max <= 60 ? "1 marrón" : max <= 80 ? "2 marrones" : "1 negra";
 const envoplast = w * h / 10000 / 0.32 * (25 / 1500);
 const glue = input.includeGlue ? w * h / 3600 * 3 * (60 / 1000) : 0;
 const bags = max <= 60 ? 5 / 50 : max <= 80 ? 2 * 5 / 50 : 8 / 15;
 const tape = (w + h) / 200 * wraps * (4 / 100);
 return { envoplast, glue, bags, tape, total: envoplast + glue + bags + tape, wraps, bagType };
}
