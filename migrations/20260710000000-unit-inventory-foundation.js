'use strict';

const addColumnIfMissing = async (queryInterface, table, column, definition) => {
  const description = await queryInterface.describeTable(table);
  if (!description[column]) await queryInterface.addColumn(table, column, definition);
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_warehouses_type"
      ADD VALUE IF NOT EXISTS 'AjusteInventario';
    `);

    await addColumnIfMissing(queryInterface, 'supplies', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'NORMAL',
    });
    await addColumnIfMissing(queryInterface, 'products', 'adjustmentStock', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await addColumnIfMissing(queryInterface, 'productBoxes', 'inventoryKind', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'PHYSICAL',
    });
    await addColumnIfMissing(queryInterface, 'productBoxes', 'lifecycleStatus', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'ACTIVE',
    });
    await addColumnIfMissing(queryInterface, 'productBoxes', 'originProductBoxId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'productBoxes', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
    await addColumnIfMissing(queryInterface, 'productBoxes', 'explodedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, 'productBoxes', 'explodedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await addColumnIfMissing(queryInterface, 'productBoxes', 'sourceType', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'SUPPLY',
    });

    await queryInterface.sequelize.query(`
      INSERT INTO "warehouses" ("name", "address", "type", "createdAt", "updatedAt")
      SELECT 'Ajuste Inventario', '-', 'AjusteInventario', NOW(), NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM "warehouses" WHERE "type" = 'AjusteInventario'
      );
    `);

    let tables = await queryInterface.showAllTables();
    if (!tables.includes('productBarcodes')) {
      await queryInterface.createTable('productBarcodes', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        barcode: { type: Sequelize.STRING, allowNull: false },
        productId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'products', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        productCodeSnapshot: { type: Sequelize.STRING, allowNull: true },
        type: { type: Sequelize.STRING, allowNull: false, defaultValue: 'UNIT_PRODUCT' },
        isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        createdBy: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      });
    }

    if (!tables.includes('inventoryReconciliations')) {
      await queryInterface.createTable('inventoryReconciliations', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        productId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'products', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        warehouseId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'warehouses', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        adjustmentWarehouseId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'warehouses', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        systemStock: { type: Sequelize.INTEGER, allowNull: false },
        countedStock: { type: Sequelize.INTEGER, allowNull: false },
        delta: { type: Sequelize.INTEGER, allowNull: false },
        status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'PENDING' },
        sources: { type: Sequelize.JSONB, allowNull: true },
        supplyId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'supplies', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        createdBy: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        confirmedBy: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      });
    }

    if (!tables.includes('inventoryMovements')) {
      await queryInterface.createTable('inventoryMovements', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        type: { type: Sequelize.STRING, allowNull: false },
        quantity: { type: Sequelize.INTEGER, allowNull: false },
        productId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'products', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        sourceProductBoxId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'productBoxes', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        targetProductBoxId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'productBoxes', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        fromWarehouseId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'warehouses', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        toWarehouseId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'warehouses', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        sourceStockBefore: { type: Sequelize.INTEGER, allowNull: true },
        sourceStockAfter: { type: Sequelize.INTEGER, allowNull: true },
        targetStockBefore: { type: Sequelize.INTEGER, allowNull: true },
        targetStockAfter: { type: Sequelize.INTEGER, allowNull: true },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        supplyId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'supplies', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        dispatchId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'dispatches', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        reconciliationId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'inventoryReconciliations', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        description: { type: Sequelize.TEXT, allowNull: true },
        metadata: { type: Sequelize.JSONB, allowNull: true },
        createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      });
    }

    if (!tables.includes('unitTicketPrints')) {
      await queryInterface.createTable('unitTicketPrints', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        productId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'products', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        productBoxId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'productBoxes', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        warehouseId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'warehouses', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        quantity: { type: Sequelize.INTEGER, allowNull: false },
        reprintOfId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'unitTicketPrints', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      });
    }

    const addIndex = async (table, fields, name, options = {}) => {
      const current = await queryInterface.showIndex(table);
      if (!current.some(index => index.name === name))
        await queryInterface.addIndex(table, fields, { name, ...options });
    };
    await addIndex('productBarcodes', ['barcode'], 'product_barcodes_barcode_unique', { unique: true });
    await addIndex('productBarcodes', ['productId', 'type', 'isActive'], 'product_barcodes_product_active_idx');
    await addIndex('productBoxes', ['originProductBoxId'], 'product_boxes_origin_idx');
    await addIndex('productBoxes', ['productId', 'warehouseId', 'inventoryKind', 'stock'], 'product_boxes_unit_stock_idx');
    await addIndex('inventoryMovements', ['productId', 'createdAt'], 'inventory_movements_product_date_idx');
    await addIndex('inventoryMovements', ['reconciliationId'], 'inventory_movements_reconciliation_idx');
    await addIndex('inventoryReconciliations', ['productId', 'createdAt'], 'inventory_reconciliations_product_date_idx');
    await addIndex('unitTicketPrints', ['productId', 'createdAt'], 'unit_ticket_prints_product_date_idx');

    await queryInterface.sequelize.query(`
      INSERT INTO "productBarcodes"
        ("barcode", "productId", "productCodeSnapshot", "type", "isActive", "createdAt", "updatedAt")
      SELECT CONCAT('2', LPAD(CAST(p."id" AS TEXT), 15, '0')), p."id", p."code",
             'UNIT_PRODUCT', TRUE, NOW(), NOW()
      FROM "products" p
      WHERE NOT EXISTS (
        SELECT 1 FROM "productBarcodes" pb
        WHERE pb."productId" = p."id" AND pb."type" = 'UNIT_PRODUCT' AND pb."isActive" = TRUE
      );
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO "productBoxes"
        ("trackingCode", "boxSize", "stock", "isAvailable", "inventoryKind",
         "lifecycleStatus", "originProductBoxId", "explodedAt", "sourceType",
         "productId", "warehouseId", "supplyId", "createdAt", "updatedAt")
      SELECT NULL, pb."stock", pb."stock", TRUE, 'EXPLODED', 'ACTIVE', pb."id", NOW(),
             'MIGRATION', pb."productId", pb."warehouseId", pb."supplyId", NOW(), NOW()
      FROM "productBoxes" pb
      JOIN "warehouses" w ON w."id" = pb."warehouseId"
      WHERE w."type" = 'Tienda'
        AND pb."stock" > 0
        AND pb."inventoryKind" = 'PHYSICAL'
        AND NOT EXISTS (
          SELECT 1 FROM "productBoxes" child
          WHERE child."originProductBoxId" = pb."id" AND child."sourceType" = 'MIGRATION'
        );
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO "inventoryMovements"
        ("type", "quantity", "productId", "sourceProductBoxId", "targetProductBoxId",
         "fromWarehouseId", "toWarehouseId", "sourceStockBefore", "sourceStockAfter",
         "targetStockBefore", "targetStockAfter", "description", "createdAt", "updatedAt")
      SELECT 'INITIAL_STORE_MIGRATION', child."stock", parent."productId", parent."id", child."id",
             parent."warehouseId", child."warehouseId", parent."stock", 0, 0, child."stock",
             'Conversión inicial de inventario existente en tienda', NOW(), NOW()
      FROM "productBoxes" child
      JOIN "productBoxes" parent ON parent."id" = child."originProductBoxId"
      WHERE child."sourceType" = 'MIGRATION'
        AND NOT EXISTS (
          SELECT 1 FROM "inventoryMovements" movement
          WHERE movement."type" = 'INITIAL_STORE_MIGRATION'
            AND movement."targetProductBoxId" = child."id"
        );
    `);

    await queryInterface.sequelize.query(`
      UPDATE "productBoxes" parent
      SET "stock" = 0, "isAvailable" = FALSE, "lifecycleStatus" = 'DISCARDED',
          "explodedAt" = COALESCE(parent."explodedAt", NOW()), "updatedAt" = NOW()
      WHERE EXISTS (
        SELECT 1 FROM "productBoxes" child
        WHERE child."originProductBoxId" = parent."id" AND child."sourceType" = 'MIGRATION'
      ) AND parent."stock" > 0;
    `);
  },

  down: async queryInterface => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('productBoxes')) {
      const description = await queryInterface.describeTable('productBoxes');
      if (description.originProductBoxId) {
        await queryInterface.sequelize.query(`
          UPDATE "productBoxes" source
          SET "stock" = source."stock" + restored."quantity",
              "isAvailable" = TRUE,
              "updatedAt" = NOW()
          FROM (
            SELECT "sourceProductBoxId", SUM("quantity") AS "quantity"
            FROM "inventoryMovements"
            WHERE "type" = 'RECONCILIATION_TO_ADJUSTMENT'
              AND "sourceProductBoxId" IS NOT NULL
            GROUP BY "sourceProductBoxId"
          ) restored
          WHERE source."id" = restored."sourceProductBoxId";
        `);
        await queryInterface.sequelize.query(`
          UPDATE "productBoxes" parent
          SET "stock" = parent."stock" + restored."stock",
              "isAvailable" = (parent."stock" + restored."stock") > 0,
              "lifecycleStatus" = 'ACTIVE', "explodedAt" = NULL, "updatedAt" = NOW()
          FROM (
            SELECT "originProductBoxId", SUM("stock") AS "stock"
            FROM "productBoxes"
            WHERE "inventoryKind" = 'EXPLODED' AND "originProductBoxId" IS NOT NULL
            GROUP BY "originProductBoxId"
          ) restored
          WHERE parent."id" = restored."originProductBoxId";
        `);
      }
    }

    // Drop the audit tables before deleting logical lots because their foreign keys
    // intentionally protect referenced inventory rows while the feature is active.
    for (const table of ['unitTicketPrints', 'inventoryMovements', 'inventoryReconciliations', 'productBarcodes'])
      if (tables.includes(table)) await queryInterface.dropTable(table);

    if (tables.includes('productBoxes')) {
      const description = await queryInterface.describeTable('productBoxes');
      if (description.inventoryKind)
        await queryInterface.sequelize.query(`DELETE FROM "productBoxes" WHERE "inventoryKind" = 'EXPLODED';`);
    }

    const removeColumnIfPresent = async (table, column) => {
      const description = await queryInterface.describeTable(table);
      if (description[column]) await queryInterface.removeColumn(table, column);
    };
    for (const column of ['originProductBoxId', 'explodedBy', 'explodedAt', 'sourceType', 'lifecycleStatus', 'inventoryKind'])
      await removeColumnIfPresent('productBoxes', column);
    await removeColumnIfPresent('products', 'adjustmentStock');
    await removeColumnIfPresent('supplies', 'type');
    // PostgreSQL enum values are intentionally not removed in down migrations.
  },
};
