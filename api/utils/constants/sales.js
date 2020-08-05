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
      DISPATCHED: { value: 'DISPATCHED', name: 'Despachado' },
    },
  },
};
