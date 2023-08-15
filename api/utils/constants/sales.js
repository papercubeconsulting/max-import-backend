/* eslint-disable global-require */
module.exports = {
  PROFORMA: {
    STATUS: {
      OPEN: { value: 'OPEN', name: 'En cotización' },
      CLOSED: { value: 'CLOSED', name: 'Cerrada' },
      PENDING_DISCOUNT_APPROVAL: {
        value: 'PENDING_DISCOUNT_APPROVAL',
        name: 'Pendiente de aprobación del descuento',
      },
    },
    SALE_STATUS: {
      PENDING: { value: 'PENDING', name: 'Pendiente' },
      PARTIAL: { value: 'PARTIAL', name: 'Pagado a cuenta' },
      PAID: { value: 'PAID', name: 'Pagado cancelado' },
    },
    DISPATCH_STATUS: {
      LOCKED: { value: 'LOCKED', name: 'Bloqueado' },
      OPEN: { value: 'OPEN', name: 'Habilitado' },
      COMPLETED: { value: 'COMPLETED', name: 'Completado' },
    },
    MAP_SALE_STATUS: {
      // ? Mapeo a utilizar en servicio de cierre de proforma
      DUE: 'PARTIAL',
      PAID: 'PAID',
    },
  },
  SALE: {
    TYPE: {
      STORE: { value: 'STORE', name: 'En tienda' },
      REMOTE: { value: 'REMOTE', name: 'No presencial' },
    },
    STATUS: {
      DUE: { value: 'DUE', name: 'Adeuda' },
      PAID: { value: 'PAID', name: 'Pagado' },
    },
    PAYMENT_TYPE: {
      CREDIT: { value: 'CREDIT', name: 'Crédito' },
      CASH: { value: 'CASH', name: 'Contado' },
    },
    BILLING_TYPE: {
      CONSIGNMENT: { value: 'CONSIGNMENT', name: 'Consignación' },
      SALE: { value: 'SALE', name: 'Venta' },
    },
    DISPATCHMENT_TYPE: {
      DELIVERY: { value: 'DELIVERY', name: 'Delivery' },
      PICK_UP: { value: 'PICK_UP', name: 'Recojo en tienda' },
    },
    PAYMENT_METHOD: ['Efectivo', 'Tarjeta', 'Depósito'],
  },
  DISPATCH: {
    STATUS: {
      LOCKED: { value: 'LOCKED', name: 'Bloqueado' },
      OPEN: { value: 'OPEN', name: 'Habilitado' },
      COMPLETED: { value: 'COMPLETED', name: 'Completado' },
    },
    DISPATCHMENT_TYPE: {
      DELIVERY: { value: 'DELIVERY', name: 'Delivery' },
      PICK_UP: { value: 'PICK_UP', name: 'Recojo en tienda' },
    },
  },
};
