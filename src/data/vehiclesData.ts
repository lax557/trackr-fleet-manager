import { Vehicle } from '@/types';

// Vehicles - Base data used by other modules
export const vehiclesData: Vehicle[] = [
  { id: 'TRK-001', plate: 'ABC1D23', make: 'Chevrolet', model: 'Onix', version: '1.0 LT', yearMfg: 2023, yearModel: 2023, category: 'A', vin: '9BGKS48B0NG123456', renavam: '12345678901', createdAt: new Date('2023-01-15'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-002', plate: 'DEF4E56', make: 'Fiat', model: 'Mobi', version: '1.0 Like', yearMfg: 2023, yearModel: 2024, category: 'A', vin: '9BD195167P0123456', renavam: '23456789012', createdAt: new Date('2023-02-20'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-003', plate: 'GHI7F89', make: 'Hyundai', model: 'HB20', version: '1.0 Sense', yearMfg: 2024, yearModel: 2024, category: 'B', vin: '9BHBG41DBPP123456', renavam: '34567890123', createdAt: new Date('2023-03-10'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-004', plate: 'JKL0G12', make: 'Volkswagen', model: 'Polo', version: '1.0 TSI', yearMfg: 2024, yearModel: 2025, category: 'B', vin: '9BWAA05U1PP123456', renavam: '45678901234', createdAt: new Date('2023-04-05'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-005', plate: 'MNO3H45', make: 'Toyota', model: 'Corolla', version: '2.0 XEi', yearMfg: 2024, yearModel: 2024, category: 'C', vin: '9BR53ZEC1P0123456', renavam: '56789012345', createdAt: new Date('2023-05-12'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-006', plate: 'PQR6I78', make: 'Chevrolet', model: 'Spin', version: '1.8 LTZ', yearMfg: 2023, yearModel: 2023, category: 'B', vin: '9BGJE752XPG123456', renavam: '67890123456', createdAt: new Date('2023-06-18'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-007', plate: 'STU9J01', make: 'Fiat', model: 'Argo', version: '1.3 Drive', yearMfg: 2024, yearModel: 2024, category: 'A', vin: '9BD358227P5123456', renavam: '78901234567', createdAt: new Date('2023-07-22'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-008', plate: null, make: 'Chevrolet', model: 'Onix Plus', version: '1.0 Premier', yearMfg: 2024, yearModel: 2025, category: 'B', vin: null, renavam: null, createdAt: new Date('2024-01-05'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-009', plate: null, make: 'Hyundai', model: 'Creta', version: '1.6 Action', yearMfg: 2024, yearModel: 2025, category: 'C', vin: null, renavam: null, createdAt: new Date('2024-01-08'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-010', plate: null, make: 'Toyota', model: 'Yaris', version: '1.5 XL', yearMfg: 2025, yearModel: 2025, category: 'B', vin: null, renavam: null, createdAt: new Date('2024-01-10'), updatedAt: new Date('2024-01-10') },
];
