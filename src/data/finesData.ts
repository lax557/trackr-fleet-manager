import { FineRecord, FineWithDetails, FineStatusType, commonInfractions } from '@/types/fines';
import { mockDrivers, mockVehicles } from './mockData';
import { addDays, subDays, isAfter, isBefore, addMonths, subMonths } from 'date-fns';

// Helper to calculate dynamic status
export const calculateFineStatus = (fine: FineRecord): FineStatusType => {
  if (fine.status === 'PAID' || fine.status === 'CONTESTED' || fine.status === 'CANCELED') {
    return fine.status;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(fine.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  if (isAfter(today, dueDate)) {
    return 'OVERDUE';
  }
  
  const sevenDaysFromNow = addDays(today, 7);
  if (isBefore(dueDate, sevenDaysFromNow)) {
    return 'DUE_SOON';
  }
  
  return 'OPEN';
};

// Generate 20 fines with realistic distribution
const generateFines = (): FineRecord[] => {
  const fines: FineRecord[] = [];
  const authorities = ['DETRAN-SP', 'CET-SP', 'DERSA', 'PRF', 'DER-SP'];
  const locations = [
    'Av. Paulista, 1000 - São Paulo/SP',
    'Marginal Pinheiros, km 15 - São Paulo/SP',
    'Rod. dos Bandeirantes, km 45 - Campinas/SP',
    'Av. Brasil, 500 - São Paulo/SP',
    'Av. Rebouças, 1500 - São Paulo/SP',
    'Rod. Castelo Branco, km 22 - Barueri/SP',
    'Av. Faria Lima, 2000 - São Paulo/SP',
    'Rod. Anhanguera, km 30 - São Paulo/SP',
    null,
  ];

  const vehicleIds = mockVehicles.filter(v => v.plate).slice(0, 7).map(v => v.id);
  const driverIds = mockDrivers.slice(0, 6).map(d => d.id);

  // Create 20 fines distributed
  for (let i = 0; i < 20; i++) {
    const infraction = commonInfractions[Math.floor(Math.random() * commonInfractions.length)];
    const vehicleId = vehicleIds[Math.floor(Math.random() * vehicleIds.length)];
    const vehicle = mockVehicles.find(v => v.id === vehicleId)!;
    
    // Random date in last 6 months
    const occurredAt = subDays(new Date(), Math.floor(Math.random() * 180));
    const dueDate = addDays(occurredAt, 30 + Math.floor(Math.random() * 30));
    
    // Determine status
    let status: FineStatusType = 'OPEN';
    let paymentDate: Date | null = null;
    let paymentAmount: number | null = null;
    
    // Distribute statuses
    if (i < 4) {
      // Paid
      status = 'PAID';
      paymentDate = addDays(occurredAt, 15 + Math.floor(Math.random() * 20));
      paymentAmount = infraction.amount * 0.8; // Paid with discount
    } else if (i < 6) {
      // Overdue
      status = 'OVERDUE';
    } else if (i < 8) {
      // Due soon
      status = 'DUE_SOON';
    } else if (i < 10) {
      // Contested
      status = 'CONTESTED';
    } else {
      // Open
      status = 'OPEN';
    }

    // Driver assignment
    const driverId = Math.random() > 0.3 ? driverIds[Math.floor(Math.random() * driverIds.length)] : null;
    const driver = driverId ? mockDrivers.find(d => d.id === driverId) : null;
    
    // Indication
    const indicatedDriver = Math.random() > 0.4 && driverId !== null;

    // Discount
    const discountAvailable = Math.random() > 0.3;
    const discountPercent = discountAvailable ? 20 : null;
    const discountedAmount = discountAvailable ? infraction.amount * 0.8 : null;

    fines.push({
      id: `fine-${i + 1}`,
      vehicleId,
      vehiclePlate: vehicle.plate,
      driverId,
      occurredAt,
      source: 'MANUAL',
      authority: authorities[Math.floor(Math.random() * authorities.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      infractionCode: infraction.code,
      infractionDescription: infraction.description,
      severity: infraction.severity,
      points: infraction.points,
      originalAmount: infraction.amount,
      discountAvailable,
      discountPercent,
      discountedAmount,
      dueDate,
      status,
      paymentDate,
      paymentAmount,
      indicatedDriver,
      indicatedAt: indicatedDriver ? addDays(occurredAt, 5) : null,
      indicatedDriverName: indicatedDriver && driver ? driver.fullName : null,
      notes: null,
      documentFileId: null,
    });
  }

  return fines;
};

export const mockFinesRecords: FineRecord[] = generateFines();

// Get fines with details
export const getFinesWithDetails = (): FineWithDetails[] => {
  return mockFinesRecords.map(fine => {
    const driver = fine.driverId ? mockDrivers.find(d => d.id === fine.driverId) : null;
    const vehicle = mockVehicles.find(v => v.id === fine.vehicleId)!;
    
    return {
      ...fine,
      status: calculateFineStatus(fine),
      driverName: driver?.fullName || null,
      vehicleMakeModel: `${vehicle.make} ${vehicle.model}`,
    };
  });
};

// Get fines for a specific vehicle
export const getFinesForVehicle = (vehicleId: string): FineWithDetails[] => {
  return getFinesWithDetails()
    .filter(f => f.vehicleId === vehicleId)
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
};

// Get fines for a specific driver
export const getFinesForDriver = (driverId: string): FineWithDetails[] => {
  return getFinesWithDetails()
    .filter(f => f.driverId === driverId)
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
};

// Get fine stats
export const getFineStats = () => {
  const fines = getFinesWithDetails();
  const openFines = fines.filter(f => ['OPEN', 'DUE_SOON', 'OVERDUE'].includes(f.status));
  
  return {
    total: fines.length,
    open: fines.filter(f => f.status === 'OPEN').length,
    dueSoon: fines.filter(f => f.status === 'DUE_SOON').length,
    overdue: fines.filter(f => f.status === 'OVERDUE').length,
    paid: fines.filter(f => f.status === 'PAID').length,
    contested: fines.filter(f => f.status === 'CONTESTED').length,
    totalOpenAmount: openFines.reduce((sum, f) => sum + f.originalAmount, 0),
  };
};
