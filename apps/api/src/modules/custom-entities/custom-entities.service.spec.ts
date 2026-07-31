import { Test, TestingModule } from '@nestjs/testing';
import { CustomEntitiesService } from './custom-entities.service';
import { PrismaService } from '../database/prisma.service';

describe('CustomEntitiesService (Validation & Autonumbering)', () => {
  let service: CustomEntitiesService;
  let prisma: PrismaService;

  // Mock de la definición
  const mockDefinition = {
    id: 'def-1',
    nameSingular: 'Mascota',
    namePlural: 'Mascotas',
    internalName: 'pet',
    autoNumberFormat: 'PET-{0000}',
    currentAutoNumber: 1,
    fields: [
      {
        id: 'f1',
        internalName: 'name',
        label: 'Nombre',
        type: 'TEXT',
        isRequired: true,
        defaultValue: null,
        validationRegex: '^[a-zA-Z\\s]+$', // solo letras
      },
      {
        id: 'f2',
        internalName: 'age',
        label: 'Edad',
        type: 'NUMBER',
        isRequired: false,
        defaultValue: '0',
      },
    ],
  };

  const mockPrisma = {
    customEntityDefinition: {
      findFirst: jest.fn().mockImplementation(() => Promise.resolve(mockDefinition)),
      findUnique: jest.fn().mockImplementation(() => Promise.resolve(mockDefinition)),
      update: jest.fn().mockImplementation(({ data }) => {
        if (data.currentAutoNumber) {
          mockDefinition.currentAutoNumber = data.currentAutoNumber;
        }
        return Promise.resolve(mockDefinition);
      }),
    },
    customEntityRecord: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'rec-1', ...data })),
    },
    $transaction: jest.fn().mockImplementation((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    // Resetear contador
    mockDefinition.currentAutoNumber = 1;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomEntitiesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CustomEntitiesService>(CustomEntitiesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should successfully validate correct values and generate auto-number value', async () => {
    const record = await service.createRecord('org-1', 'def-1', {
      values: {
        name: 'Rex',
        age: 3,
      },
    });

    expect(record.autoNumberValue).toBe('PET-0001');
    expect(record.values).toEqual({
      name: 'Rex',
      age: 3,
    });
    expect(mockDefinition.currentAutoNumber).toBe(2);
  });

  it('should throw an error if a required field is missing', async () => {
    await expect(
      service.createRecord('org-1', 'def-1', {
        values: {
          age: 3,
        },
      }),
    ).rejects.toThrow("Field 'Nombre' (name) is required");
  });

  it('should throw an error if field value does not match regex', async () => {
    await expect(
      service.createRecord('org-1', 'def-1', {
        values: {
          name: 'Rex123', // inválido por contener números
        },
      }),
    ).rejects.toThrow("Field 'Nombre' does not match validation format");
  });

  it('should apply defaultValue if field is missing', async () => {
    const record = await service.createRecord('org-1', 'def-1', {
      values: {
        name: 'Rex',
      },
    });
    expect((record.values as any).age).toBe(0); // el string '0' casteado a NUMBER
  });
});
