import { PluginInterface } from './plugin.interface';

export const PetResidencePlugin: PluginInterface = {
  key: 'pet-residence',
  name: 'Residencia de Mascotas',
  description: 'Gestión completa de mascotas, estancias y reservas en residencias caninas/felinas.',
  menuItems: [
    { label: 'Mascotas', route: '/custom-entities/pet', icon: 'paw' },
    { label: 'Reservas Residencia', route: '/pipelines/residence-bookings', icon: 'calendar' },
  ],
  onActivate: async (prisma: any, orgId: string) => {
    // 1. Inyectar Definición de Entidad: Mascota (pet)
    let petDef = await prisma.customEntityDefinition.findFirst({
      where: { organizationId: orgId, internalName: 'pet' },
    });

    if (!petDef) {
      petDef = await prisma.customEntityDefinition.create({
        data: {
          organizationId: orgId,
          nameSingular: 'Mascota',
          namePlural: 'Mascotas',
          internalName: 'pet',
          icon: 'paw',
          description: 'Mascotas registradas en la residencia',
          autoNumberFormat: 'PET-{0000}',
          ownerPluginId: 'pet-residence',
        },
      });

      // Campos por defecto para Mascota
      await prisma.customFieldDefinition.createMany({
        data: [
          {
            organizationId: orgId,
            targetEntity: 'CUSTOM_ENTITY',
            customEntityDefinitionId: petDef.id,
            label: 'Nombre de la Mascota',
            internalName: 'name',
            type: 'TEXT',
            isRequired: true,
          },
          {
            organizationId: orgId,
            targetEntity: 'CUSTOM_ENTITY',
            customEntityDefinitionId: petDef.id,
            label: 'Raza / Especie',
            internalName: 'breed',
            type: 'TEXT',
            isRequired: false,
          },
          {
            organizationId: orgId,
            targetEntity: 'CUSTOM_ENTITY',
            customEntityDefinitionId: petDef.id,
            label: 'Edad',
            internalName: 'age',
            type: 'NUMBER',
            isRequired: false,
            defaultValue: '0',
          },
          {
            organizationId: orgId,
            targetEntity: 'CUSTOM_ENTITY',
            customEntityDefinitionId: petDef.id,
            label: 'Instrucciones de Alimentación',
            internalName: 'diet_instructions',
            type: 'TEXT',
            isRequired: false,
          },
          {
            organizationId: orgId,
            targetEntity: 'CUSTOM_ENTITY',
            customEntityDefinitionId: petDef.id,
            label: 'Estado de Vacunación',
            internalName: 'vaccination_status',
            type: 'TEXT',
            isRequired: false,
          },
          {
            organizationId: orgId,
            targetEntity: 'CUSTOM_ENTITY',
            customEntityDefinitionId: petDef.id,
            label: 'Última Vacunación',
            internalName: 'last_vaccination_date',
            type: 'DATE',
            isRequired: false,
          },
        ],
      });
    } else {
      // Si ya existía pero estaba inactivo, reactivarlo
      await prisma.customEntityDefinition.update({
        where: { id: petDef.id },
        data: { status: 'active', isVisibleInMenu: true },
      });
    }

    // 2. Inyectar Definición de Entidad: Reserva (pet_booking)
    let bookingDef = await prisma.customEntityDefinition.findFirst({
      where: { organizationId: orgId, internalName: 'pet_booking' },
    });

    if (!bookingDef) {
      bookingDef = await prisma.customEntityDefinition.create({
        data: {
          organizationId: orgId,
          nameSingular: 'Reserva de Residencia',
          namePlural: 'Reservas de Residencia',
          internalName: 'pet_booking',
          icon: 'calendar',
          description: 'Reservas de estancias de mascotas',
          autoNumberFormat: 'BKG-{0000}',
          ownerPluginId: 'pet-residence',
        },
      });

      // Campos por defecto para Reserva
      await prisma.customFieldDefinition.createMany({
        data: [
          {
            organizationId: orgId,
            targetEntity: 'CUSTOM_ENTITY',
            customEntityDefinitionId: bookingDef.id,
            label: 'Mascota (ID)',
            internalName: 'petId',
            type: 'TEXT',
            isRequired: true,
          },
          {
            organizationId: orgId,
            targetEntity: 'CUSTOM_ENTITY',
            customEntityDefinitionId: bookingDef.id,
            label: 'Fecha de Entrada (Check-In)',
            internalName: 'checkIn',
            type: 'DATE',
            isRequired: true,
          },
          {
            organizationId: orgId,
            targetEntity: 'CUSTOM_ENTITY',
            customEntityDefinitionId: bookingDef.id,
            label: 'Fecha de Salida (Check-Out)',
            internalName: 'checkOut',
            type: 'DATE',
            isRequired: true,
          },
        ],
      });
    } else {
      await prisma.customEntityDefinition.update({
        where: { id: bookingDef.id },
        data: { status: 'active', isVisibleInMenu: true },
      });
    }

    // 3. Inyectar Pipeline de Reservas
    let bookingPipeline = await prisma.pipelineDefinition.findFirst({
      where: { organizationId: orgId, name: 'Reservas Residencia' },
    });

    if (!bookingPipeline) {
      bookingPipeline = await prisma.pipelineDefinition.create({
        data: {
          organizationId: orgId,
          name: 'Reservas Residencia',
          targetEntity: 'CUSTOM_ENTITY',
          customEntityDefinitionId: bookingDef.id,
          icon: 'calendar',
        },
      });

      // Crear Etapas del Pipeline de Reservas
      await prisma.pipelineStage.createMany({
        data: [
          {
            organizationId: orgId,
            pipelineDefinitionId: bookingPipeline.id,
            name: 'Solicitado',
            order: 1,
            color: '#3b82f6',
          },
          {
            organizationId: orgId,
            pipelineDefinitionId: bookingPipeline.id,
            name: 'Confirmado',
            order: 2,
            color: '#10b981',
            requiredFields: ['checkIn', 'checkOut'],
          },
          {
            organizationId: orgId,
            pipelineDefinitionId: bookingPipeline.id,
            name: 'Estancia Activa',
            order: 3,
            color: '#f59e0b',
          },
          {
            organizationId: orgId,
            pipelineDefinitionId: bookingPipeline.id,
            name: 'Finalizado',
            order: 4,
            color: '#64748b',
            isWon: true,
          },
        ],
      });
    }

    // 4. Inyectar Reportes preconfigurados
    let reportRaza = await prisma.reportDefinition.findFirst({
      where: { organizationId: orgId, name: 'Mascotas por Raza' },
    });

    if (!reportRaza) {
      reportRaza = await prisma.reportDefinition.create({
        data: {
          organizationId: orgId,
          name: 'Mascotas por Raza',
          description: 'Distribución de mascotas por su raza',
          source: 'CUSTOM_ENTITY',
          customEntityDefinitionId: petDef.id,
          config: {
            dimension: 'breed',
            aggregation: 'COUNT',
            chartType: 'BAR',
          },
        },
      });
    }

    let reportReservas = await prisma.reportDefinition.findFirst({
      where: { organizationId: orgId, name: 'Reservas por Etapa' },
    });

    if (!reportReservas) {
      reportReservas = await prisma.reportDefinition.create({
        data: {
          organizationId: orgId,
          name: 'Reservas por Etapa',
          description: 'Cantidad de reservas por etapa del pipeline',
          source: 'PIPELINE_RECORD',
          config: {
            dimension: 'stage',
            aggregation: 'COUNT',
            chartType: 'FUNNEL',
          },
        },
      });
    }

    // 5. Inyectar Dashboard predeterminado
    let dashboard = await prisma.dashboard.findFirst({
      where: { organizationId: orgId, name: 'Panel de Residencia de Mascotas' },
    });

    if (!dashboard) {
      dashboard = await prisma.dashboard.create({
        data: {
          organizationId: orgId,
          name: 'Panel de Residencia de Mascotas',
          description: 'Tablero de control y KPIS operativos de la residencia de mascotas',
          isDefault: true,
        },
      });

      // Inyectar widgets en el dashboard
      await prisma.dashboardWidget.createMany({
        data: [
          {
            organizationId: orgId,
            dashboardId: dashboard.id,
            reportId: reportRaza.id,
            title: 'Mascotas por Raza',
            type: 'CHART',
            config: { x: 0, y: 0, w: 6, h: 4 },
          },
          {
            organizationId: orgId,
            dashboardId: dashboard.id,
            reportId: reportReservas.id,
            title: 'Estado del Embudo',
            type: 'FUNNEL',
            config: { x: 6, y: 0, w: 6, h: 4 },
          },
        ],
      });
    }
  },
  onDeactivate: async (prisma: any, orgId: string) => {
    // Desactivar las definiciones sin borrar datos
    await prisma.customEntityDefinition.updateMany({
      where: { organizationId: orgId, ownerPluginId: 'pet-residence' },
      data: { status: 'inactive', isVisibleInMenu: false },
    });

    // Desactivar el dashboard por defecto
    await prisma.dashboard.updateMany({
      where: { organizationId: orgId, name: 'Panel de Residencia de Mascotas' },
      data: { isDefault: false },
    });
  },
};
