import { Vehicle } from '@/types';

const makes = [
  { make: 'Chevrolet', models: [{ model: 'Onix', version: '1.0 LT', cat: 'A' as const }, { model: 'Onix Plus', version: '1.0 Premier', cat: 'B' as const }, { model: 'Spin', version: '1.8 LTZ', cat: 'B' as const }, { model: 'Tracker', version: '1.0 Turbo', cat: 'C' as const }] },
  { make: 'Fiat', models: [{ model: 'Mobi', version: '1.0 Like', cat: 'A' as const }, { model: 'Argo', version: '1.3 Drive', cat: 'A' as const }, { model: 'Cronos', version: '1.3 Drive', cat: 'B' as const }, { model: 'Pulse', version: '1.0 Turbo', cat: 'B' as const }] },
  { make: 'Hyundai', models: [{ model: 'HB20', version: '1.0 Sense', cat: 'B' as const }, { model: 'Creta', version: '1.6 Action', cat: 'C' as const }, { model: 'HB20S', version: '1.0 Comfort', cat: 'B' as const }] },
  { make: 'Volkswagen', models: [{ model: 'Polo', version: '1.0 TSI', cat: 'B' as const }, { model: 'Virtus', version: '1.0 TSI', cat: 'B' as const }, { model: 'T-Cross', version: '1.0 TSI', cat: 'C' as const }] },
  { make: 'Toyota', models: [{ model: 'Corolla', version: '2.0 XEi', cat: 'C' as const }, { model: 'Yaris', version: '1.5 XL', cat: 'B' as const }, { model: 'Corolla Cross', version: '2.0 XRE', cat: 'D' as const }] },
  { make: 'Renault', models: [{ model: 'Kwid', version: '1.0 Zen', cat: 'A' as const }, { model: 'Logan', version: '1.0 Life', cat: 'A' as const }, { model: 'Duster', version: '1.6 Iconic', cat: 'C' as const }] },
  { make: 'Nissan', models: [{ model: 'Kicks', version: '1.6 Sense', cat: 'C' as const }, { model: 'Versa', version: '1.6 Sense', cat: 'B' as const }] },
  { make: 'Honda', models: [{ model: 'City', version: '1.5 EXL', cat: 'C' as const }, { model: 'HR-V', version: '1.5 Turbo', cat: 'D' as const }] },
  { make: 'BYD', models: [{ model: 'Dolphin', version: 'GL', cat: 'EV' as const }, { model: 'Yuan Plus', version: 'GL', cat: 'EV' as const }] },
];

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const generatePlate = (i: number): string => {
  const l1 = letters[i % 26];
  const l2 = letters[(i * 3 + 7) % 26];
  const l3 = letters[(i * 7 + 2) % 26];
  const d1 = (i % 10);
  const l4 = letters[(i * 5 + 1) % 26];
  const d2 = ((i * 3) % 10);
  const d3 = ((i * 7 + 4) % 10);
  return `${l1}${l2}${l3}${d1}${l4}${d2}${d3}`;
};

function generateVehicles(): Vehicle[] {
  const vehicles: Vehicle[] = [];
  
  for (let i = 0; i < 80; i++) {
    const id = `TRK-${String(i + 1).padStart(3, '0')}`;
    const makeGroup = makes[i % makes.length];
    const modelInfo = makeGroup.models[i % makeGroup.models.length];
    const yearMfg = 2022 + (i % 4); // 2022-2025
    const yearModel = yearMfg + (i % 2);
    
    // First 74 vehicles have plates (operational), last 6 are backlog (no plate)
    const isBacklog = i >= 74;
    
    vehicles.push({
      id,
      plate: isBacklog ? null : generatePlate(i),
      make: makeGroup.make,
      model: modelInfo.model,
      version: modelInfo.version,
      yearMfg,
      yearModel,
      category: modelInfo.cat,
      vin: isBacklog ? null : `9B${letters[i % 26]}${String(100000 + i * 1234).slice(0, 5)}${String(i).padStart(6, '0')}PP${String(i).padStart(6, '0')}`,
      renavam: isBacklog ? null : String(10000000000 + i * 1111111111).slice(0, 11),
      createdAt: new Date(2023, Math.floor(i / 8), 1 + (i % 28)),
      updatedAt: new Date(2024, 0, 10),
    });
  }
  
  return vehicles;
}

// Vehicles - Base data used by other modules
export const vehiclesData: Vehicle[] = generateVehicles();
