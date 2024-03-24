const fs = require('fs');
const csv = require('csvtojson');
const { Op } = require('sequelize');
const {
  Product,
  Provider,
  Family,
  Subfamily,
  Element,
  Model,
} = require('@dbModels');
const { setResponse } = require('../../../utils');

const checkCategory = async (
  Category,
  categoryName,
  parent,
  parentKey,
  depth,
) => {
  let category;
  let categoryId;

  const firstQuery = {
    [Op.or]: [
      {
        name: categoryName,
      },
    ],
  };
  if (parentKey && parent && parent.id) {
    firstQuery[parentKey] = parent.id;
  }

  category = await Category.findOne({
    where: firstQuery,
    // attributes: ['id', 'name','code']
  });

  if (category && category.id) {
    categoryId = category.id;
  }

  if (categoryId) {
    if (!parent && depth !== 0) {
      return {
        valid: false,
        message: `No parentId provided for ${category.name}`,
      };
    }

    if (parent) {
      if (category[parentKey] !== parent.id) {
        return {
          valid: false,
          message: `Wrong parent provided for ${category.name}`,
        };
      }
    }

    return {
      valid: true,
      message: 'Valid existing category',
      next: category,
    }; // * se devuelve el objeto
  }

  const query = {
    [Op.or]: [
      {
        name: categoryName,
      },
    ],
  };

  if (parentKey && parent && parent.id) query[parentKey] = parent.id;

  category = await Category.findOne({ where: query });

  if (category && parent !== undefined) {
    return {
      valid: false,
      message: `${categoryName}  already exists`,
    };
  }

  return {
    valid: true,
    message: 'New category to create',
  };
};

const createCategories = async (req, categories) => {
  const family = categories.family.next
    ? categories.family.next
    : await Family.create({
        name: req.familyName,
        code: req.familyCode,
      });
  const subfamily = categories.subfamily.next
    ? categories.subfamily.next
    : await Subfamily.create({
        name: req.subfamilyName,
        code: req.subfamilyCode,
        familyId: family.id,
      });
  const element = categories.element.next
    ? categories.element.next
    : await Element.create({
        name: req.elementName,
        code: req.elementCode,
        subfamilyId: subfamily.id,
      });
  const model = categories.model.next
    ? categories.model.next
    : await Model.create({
        name: req.modelName,
        elementId: element.id,
      });

  return { family, subfamily, element, model };
};

const uploadCsvProduct = async (reqParams, file, reqUser) => {
  const insertArray = [];
  const columnsOutput = [];
  const row = [];

  const bulkProducts = await csv({ delimiter: [';', ','] }).fromFile(file.path);

  fs.unlinkSync(file.path);

  for (let i = 0; i < bulkProducts.length; i++) {
    const familyName = bulkProducts[i].familia;
    const subfamilyName = bulkProducts[i].subFamilia;
    const elementName = bulkProducts[i].elemento;
    const modelName = bulkProducts[i].modelo;
    const compatibility = bulkProducts[i].compatibilidad;
    const tradename = bulkProducts[i].nombreComercial;
    const suggestedPrice = parseInt(bulkProducts[i].precio) || 0;
    const margin = 1;
    const cost = suggestedPrice;
    const providerName = bulkProducts[i].proveedor;

    const rowResponse = {
      code: '',
      family: familyName,
      subFamily: subfamilyName,
      element: elementName,
      model: modelName,
      name: tradename,
      provider: providerName,
      upload: '',
      reason: '',
    };

    /*
    console.log(
      `Item ${i +
        1}: family: ${familyName}, subFamily:${subfamilyName} proveedor: ${
        bulkProducts[i].proveedor
      }`,
    );
    */

    const itemProductDraft = {
      familyName,
      subfamilyName,
      elementName,
      modelName,
    };
    const provider = await Provider.findOne({
      where: {
        name: bulkProducts[i].proveedor,
      },
      attributes: ['id'],
    });

    if (!provider) {
      rowResponse.upload = 'NO EXITOSO';
      rowResponse.reason = 'Proveedor no existe en la BD';
      row.push(rowResponse);
      continue;
    }

    const family = await checkCategory(Family, familyName, null, null, 0);

    if (!family.valid) {
      rowResponse.upload = 'NO EXITOSO';
      rowResponse.reason = 'Familia no válida';
      row.push(rowResponse);
      continue;
    }

    const subfamily = await checkCategory(
      Subfamily,
      subfamilyName,
      family.next,
      'familyId',
      1,
    );

    if (!subfamily.valid) {
      rowResponse.upload = 'NO EXITOSO';
      rowResponse.reason = 'SubFamilia no válida';
      row.push(rowResponse);
      continue;
    }

    const element = await checkCategory(
      Element,
      elementName,
      subfamily.next,
      'subfamilyId',
      2,
    );

    if (!element.valid) {
      rowResponse.upload = 'NO EXITOSO';
      rowResponse.reason = 'Elemento no válido';
      row.push(rowResponse);
      continue;
    }

    const model = await checkCategory(
      Model,
      modelName,
      element.next,
      'elementId',
      3,
    );

    if (!model.valid) {
      rowResponse.upload = 'NO EXITOSO';
      rowResponse.reason = 'Modelo no válido';
      row.push(rowResponse);
      continue;
    }

    const validation = { family, subfamily, element, model };
    const categories = await createCategories(itemProductDraft, validation);

    let product = await Product.findOne({
      where: { modelId: categories.model.id },
    });

    if (product) {
      rowResponse.upload = 'NO EXITOSO';
      rowResponse.reason = 'Product ya existe en la BD';
      rowResponse.code = product.code;
      row.push(rowResponse);
      continue;
    }

    const reqProduct = {
      familyId: categories.family.id,
      subfamilyId: categories.subfamily.id,
      elementId: categories.element.id,
      modelId: categories.model.id,

      familyCode: categories.family.code,
      subfamilyCode: categories.subfamily.code,
      elementCode: categories.element.code,

      providerId: provider.id,

      familyName: categories.family.name,
      subfamilyName: categories.subfamily.name,
      elementName: categories.element.name,
      modelName: categories.model.name,

      compatibility,
      suggestedPrice,
      margin,
      cost,
      tradename,
    };

    try {
      product = await Product.create(reqProduct);
      rowResponse.code = product.code;
      rowResponse.upload = 'EXITOSO';
      rowResponse.reason = 'OK';
      row.push(rowResponse);
    } catch (err) {
      console.log(err);
      rowResponse.upload = 'NO EXITOSO';
      rowResponse.reason = 'Error al crear en BD';
      row.push(rowResponse);
    }
  }

  // console.log(bulkProducts);

  return setResponse(200, 'Products upload', {
    fields: columnsOutput,
    data: row,
  });
};

module.exports = {
  uploadCsvProduct,
};
