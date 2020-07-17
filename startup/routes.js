const InventoryRouter = require('../api/inventory/inventoryRouter');
const ManagementRouter = require('../api/management/management.router');
const SalesRouter = require('../api/sales/sales.router');
const AuthRouter = require('../api/auth/authRouter');

module.exports = app => {
  app.use('/', AuthRouter);
  app.use('/', InventoryRouter);
  app.use('/', ManagementRouter);
  app.use('/', SalesRouter);
};
