const InventoryRouter = require('../api/inventory/inventory.router');
const ManagementRouter = require('../api/management/management.router');
const SalesRouter = require('../api/sales/sales.router');
const AuthRouter = require('../api/auth/auth.router');

module.exports = app => {
  app.use('/', AuthRouter);
  app.use('/', InventoryRouter);
  app.use('/', ManagementRouter);
  app.use('/', SalesRouter);
};
