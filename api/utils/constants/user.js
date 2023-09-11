module.exports = {
  ROLES: {
    superuser: {
      value: 'superuser',
      name: 'Admin',
      maxDiscount: null,
    },
    seller: {
      value: 'seller',
      name: 'Vendedor',
      maxDiscount: 1000, // 5%
    },
    logistic: {
      value: 'logistic',
      name: 'Logístico',
      maxDiscount: 1000, // 5%
    },
    manager: {
      value: 'manager',
      name: 'Administrador',
      maxDiscount: 1000, // 5%
    },
  },
};
