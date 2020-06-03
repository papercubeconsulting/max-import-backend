/* eslint-disable global-require */
module.exports = {
  supplyStatus: {
    PENDING: 'Pendiente',
    CANCELLED: 'Cancelado',
    ACCEPTED: 'Aceptado',
    COMPLETED: 'Completado',
    ATTENDED: 'Atendido',
  },
  warehouseTypes: {
    WAREHOUSE: 'Almacén',
    STORE: 'Tienda',
    DAMAGED: 'Averiado',
  },
  PRODUCTBOX_UPDATES: {
    MOVEMENT: 'Movimiento de caja',
    CREATION: 'Abastecimiento',
  },
  ...require('./utils'),
};
