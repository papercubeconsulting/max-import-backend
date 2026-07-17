/* eslint-disable global-require */
module.exports = {
  supplyStatus: {
    PENDING: 'Pendiente',
    CANCELLED: 'Cancelado',
    ACCEPTED: 'Aceptado',
    COMPLETED: 'Completado',
    ATTENDED: 'Atendido',
    CLOSED_PARTIAL: 'Cerrado parcial',
  },
  supplyTypes: {
    NORMAL: 'NORMAL',
    INVENTORY_ADJUSTMENT: 'INVENTORY_ADJUSTMENT',
    STORE_RETURN: 'STORE_RETURN',
  },
  warehouseTypes: {
    WAREHOUSE: 'Almacén',
    STORE: 'Tienda',
    DAMAGED: 'Averiado',
    ADJUSTMENT: 'AjusteInventario',
  },
  productBoxKinds: {
    PHYSICAL: 'PHYSICAL',
    EXPLODED: 'EXPLODED',
  },
  productBoxLifecycle: {
    ACTIVE: 'ACTIVE',
    DISCARDED: 'DISCARDED',
  },
  PRODUCTBOX_UPDATES: {
    MOVEMENT: { value: 'MOVEMENT', name: 'Movimiento de caja' },
    CREATION: { value: 'CREATION', name: 'Abastecimiento' },
    STORE_RETURN: { value: 'STORE_RETURN', name: 'Devolución de tienda' },
  },
};
