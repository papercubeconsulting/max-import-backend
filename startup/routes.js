const indexRouter = require('../routes/index');
const usersRouter = require('../routes/users');
const InventoryRouter = require('../api/inventory/inventoryRoutes');

module.exports = app => {
  app.use('/', indexRouter);
  app.use('/users', usersRouter);
  app.use('/', InventoryRouter);
};
