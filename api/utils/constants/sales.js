/* eslint-disable global-require */
module.exports = {
  PROFORMA: {
    STATUS: {
      OPEN: { value: 'OPEN', name: 'En cotización' },
      CLOSED: { value: 'CLOSED', name: 'Cerrada' },
    },
    SALE_STATUS: {
      PENDING: { value: 'PENDING', name: 'Pendiente' },
      PARTIAL: { value: 'PARTIAL', name: 'Pagado a cuenta' },
      PAID: { value: 'PAID', name: 'Pagado cancelado' },
    },
    DISPATCH_STATUS: {
      PENDING: { value: 'PENDING', name: 'Pendiente' },
      PARTIAL_DISPATCHED: {
        value: 'PARTIAL_DISPATCHED',
        name: 'Despacho parcial',
      },
      DISPATCHED: { value: 'DISPATCHED', name: 'Despachado' },
    },
    MAP_SALE_STATUS: {
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
      DELIVERY: { value: 'DELIVERY', name: 'Envío' },
      PICK_UP: { value: 'PICK_UP', name: 'Recojo en tienda' },
    },
    PAYMENT_METHOD: ['Efectivo', 'Tarjeta', 'Depósito'],
  },
};
