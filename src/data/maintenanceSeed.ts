import { Maintenance, MaintenanceItem, MaintenanceStatus, MaintenanceType, ServiceArea } from '@/types';
import { vehiclesData } from './vehiclesData';
import { subMonths, addDays, subDays } from 'date-fns';

// Generate 30 realistic maintenance records
const generateMaintenanceSeed = (): { maintenances: Maintenance[], items: MaintenanceItem[] } => {
  const maintenances: Maintenance[] = [];
  const items: MaintenanceItem[] = [];

  const suppliers = [
    'Auto Center São Paulo',
    'Pneus Express',
    'Elétrica Automotiva Zona Sul',
    'Funilaria & Pintura Premium',
    'Mecânica Central',
    'Oficina dos Freios',
    'Centro Automotivo Norte',
  ];

  const preventiveItems = [
    { name: 'Óleo do motor 5W30', qty: 4, cost: 45, warranty: false },
    { name: 'Filtro de óleo', qty: 1, cost: 35, warranty: true },
    { name: 'Filtro de ar', qty: 1, cost: 55, warranty: false },
    { name: 'Filtro de combustível', qty: 1, cost: 80, warranty: false },
    { name: 'Filtro de cabine', qty: 1, cost: 45, warranty: false },
    { name: 'Velas de ignição', qty: 4, cost: 25, warranty: true },
    { name: 'Fluido de freio', qty: 1, cost: 40, warranty: false },
    { name: 'Alinhamento', qty: 1, cost: 80, warranty: false },
    { name: 'Balanceamento', qty: 4, cost: 20, warranty: false },
  ];

  const correctiveItemsMechanical = [
    { name: 'Pastilha de freio dianteira', qty: 1, cost: 180, warranty: true },
    { name: 'Disco de freio dianteiro', qty: 2, cost: 220, warranty: true },
    { name: 'Amortecedor dianteiro', qty: 2, cost: 350, warranty: true },
    { name: 'Embreagem completa', qty: 1, cost: 850, warranty: true },
    { name: 'Correia dentada', qty: 1, cost: 150, warranty: true },
    { name: 'Bomba dágua', qty: 1, cost: 280, warranty: true },
    { name: 'Barra de direção', qty: 1, cost: 220, warranty: true },
    { name: 'Pivô de suspensão', qty: 2, cost: 180, warranty: true },
    { name: 'Rolamento de roda', qty: 1, cost: 120, warranty: true },
  ];

  const correctiveItemsElectrical = [
    { name: 'Bateria 60Ah', qty: 1, cost: 450, warranty: true },
    { name: 'Alternador', qty: 1, cost: 650, warranty: true },
    { name: 'Motor de partida', qty: 1, cost: 580, warranty: true },
    { name: 'Sensor de temperatura', qty: 1, cost: 120, warranty: true },
    { name: 'Bobina de ignição', qty: 1, cost: 280, warranty: true },
    { name: 'Sensor de oxigênio', qty: 1, cost: 350, warranty: true },
  ];

  const tiresItems = [
    { name: 'Pneu 185/65 R15', qty: 4, cost: 350, warranty: true },
    { name: 'Pneu 185/60 R15', qty: 4, cost: 320, warranty: true },
    { name: 'Pneu 195/55 R16', qty: 4, cost: 420, warranty: true },
    { name: 'Pneu 205/55 R16', qty: 4, cost: 480, warranty: true },
  ];

  const bodyshopItems = [
    { name: 'Para-lama dianteiro', qty: 1, cost: 320, warranty: false },
    { name: 'Para-choque dianteiro', qty: 1, cost: 450, warranty: false },
    { name: 'Pintura metalizada', qty: 1, cost: 850, warranty: true },
    { name: 'Farol dianteiro', qty: 1, cost: 580, warranty: true },
    { name: 'Retrovisor externo', qty: 1, cost: 280, warranty: true },
    { name: 'Polimento completo', qty: 1, cost: 350, warranty: false },
  ];

  // Get operational vehicles (with plates)
  const operationalVehicles = vehiclesData.filter(v => v.plate);
  
  // Create 30 maintenances distributed over 12 months
  for (let i = 0; i < 30; i++) {
    const vehicle = operationalVehicles[i % operationalVehicles.length];
    const monthsAgo = Math.floor(Math.random() * 12);
    const daysOffset = Math.floor(Math.random() * 28);
    const occurredAt = subDays(subMonths(new Date(), monthsAgo), daysOffset);
    
    // Distribute types: 60% preventive, 40% corrective
    const isPreventive = Math.random() < 0.6;
    const maintenanceType: MaintenanceType = isPreventive ? 'PREVENTIVE' : 'CORRECTIVE';
    
    // Distribute areas
    let serviceArea: ServiceArea;
    let selectedItems: typeof preventiveItems;
    let laborCost: number;
    
    if (isPreventive) {
      serviceArea = Math.random() < 0.7 ? 'INSPECTION' : 'TIRES';
      selectedItems = serviceArea === 'TIRES' 
        ? tiresItems.slice(Math.floor(Math.random() * tiresItems.length), Math.floor(Math.random() * tiresItems.length) + 1)
        : preventiveItems.slice(0, 2 + Math.floor(Math.random() * 4));
      laborCost = 100 + Math.floor(Math.random() * 150);
    } else {
      const areaRoll = Math.random();
      if (areaRoll < 0.4) {
        serviceArea = 'MECHANICAL';
        selectedItems = correctiveItemsMechanical.slice(
          Math.floor(Math.random() * 4), 
          Math.floor(Math.random() * 4) + 1 + Math.floor(Math.random() * 2)
        );
        laborCost = 150 + Math.floor(Math.random() * 350);
      } else if (areaRoll < 0.6) {
        serviceArea = 'ELECTRICAL';
        selectedItems = correctiveItemsElectrical.slice(
          Math.floor(Math.random() * 3), 
          Math.floor(Math.random() * 3) + 1 + Math.floor(Math.random() * 2)
        );
        laborCost = 80 + Math.floor(Math.random() * 200);
      } else if (areaRoll < 0.8) {
        serviceArea = 'BODYSHOP';
        selectedItems = bodyshopItems.slice(
          Math.floor(Math.random() * 3), 
          Math.floor(Math.random() * 3) + 1 + Math.floor(Math.random() * 2)
        );
        laborCost = 400 + Math.floor(Math.random() * 600);
      } else {
        serviceArea = 'TIRES';
        selectedItems = [tiresItems[Math.floor(Math.random() * tiresItems.length)]];
        laborCost = 80 + Math.floor(Math.random() * 100);
      }
    }

    // Ensure we have at least one item
    if (selectedItems.length === 0) {
      selectedItems = isPreventive ? preventiveItems.slice(0, 2) : [correctiveItemsMechanical[0]];
    }

    // Status: mostly DONE, 2-3 OPEN or IN_PROGRESS
    let status: MaintenanceStatus = 'DONE';
    let completedAt: Date | null = addDays(occurredAt, Math.floor(Math.random() * 3));
    
    if (i === 28) {
      status = 'OPEN';
      completedAt = null;
    } else if (i === 29) {
      status = 'IN_PROGRESS';
      completedAt = null;
    }

    const maintenanceId = `mnt-seed-${i + 1}`;
    
    // Create items
    let partsCost = 0;
    selectedItems.forEach((item, itemIndex) => {
      const itemTotalCost = item.qty * item.cost;
      partsCost += itemTotalCost;
      
      items.push({
        id: `mi-seed-${i + 1}-${itemIndex + 1}`,
        maintenanceId,
        itemName: item.name,
        quantity: item.qty,
        unitCost: item.cost,
        totalCost: itemTotalCost,
        hasWarranty: item.warranty && Math.random() > 0.3,
        warrantyUntil: item.warranty && Math.random() > 0.3 
          ? addDays(occurredAt, 90 + Math.floor(Math.random() * 270)) 
          : null,
        warrantyNotes: item.warranty && Math.random() > 0.5 ? '12 meses ou 20.000 km' : null,
      });
    });

    // For open/in progress, zero costs
    if (status !== 'DONE') {
      laborCost = 0;
      partsCost = 0;
    }

    const baseOdometer = 15000 + (i * 3500);

    maintenances.push({
      id: maintenanceId,
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plate,
      occurredAt,
      completedAt,
      status,
      maintenanceType,
      serviceArea,
      supplierName: suppliers[Math.floor(Math.random() * suppliers.length)],
      odometerKm: baseOdometer + Math.floor(Math.random() * 10000),
      notes: isPreventive 
        ? `Revisão programada - km ${baseOdometer}` 
        : `Manutenção corretiva - ${serviceArea.toLowerCase()}`,
      laborCost,
      partsCost,
      totalCost: laborCost + partsCost,
      hasWarranty: selectedItems.some(it => it.warranty) && status === 'DONE',
      warrantyUntil: status === 'DONE' && Math.random() > 0.4 
        ? addDays(occurredAt, 180 + Math.floor(Math.random() * 180)) 
        : null,
      warrantyNotes: status === 'DONE' && Math.random() > 0.5 ? 'Garantia de serviço' : null,
      items: [],
    });
  }

  // Link items to maintenances
  maintenances.forEach(m => {
    m.items = items.filter(item => item.maintenanceId === m.id);
  });

  return { maintenances, items };
};

export const { maintenances: seedMaintenances, items: seedMaintenanceItems } = generateMaintenanceSeed();
