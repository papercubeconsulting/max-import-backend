const InventoryRouter = require('../api/inventory/inventoryRouter');
const AuthRouter = require('../api/auth/authRouter');

module.exports = app => {
  app.use('/', AuthRouter);
  app.use('/', InventoryRouter);
};
