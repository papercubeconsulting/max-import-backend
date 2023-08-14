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
      maxDiscount: 500, // 5%
    },
    logistic: {
      value: 'logistic',
      name: 'Logístico',
      maxDiscount: 500, // 5%
    },
    manager: {
      value: 'manager',
      name: 'Administrador',
      maxDiscount: 500, // 5%
    },
  },
};
