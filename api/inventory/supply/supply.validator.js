const { Joi } = require('celebrate');

const {
  supplyStatus: status,
  supplyTypes,
} = require('../../utils/constants');
const multer = require('multer');
const path = require('path');


const List = {
  query: {
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    pageSize: Joi.number()
      .integer()
      .min(1)
      .default(20),

    from: Joi.date().iso(),
    to: Joi.date()
      .iso()
      .min(Joi.ref('from')),
  },
};

const Get = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
};

const Post = {
  body: {
    type: Joi.string()
      .valid(supplyTypes.NORMAL, supplyTypes.STORE_RETURN)
      .default(supplyTypes.NORMAL),
    providerId: Joi.when('type', {
      is: supplyTypes.STORE_RETURN,
      then: Joi.any().valid(null),
      otherwise: Joi.number().integer().required(),
    }),
    sourceWarehouseId: Joi.when('type', {
      is: supplyTypes.STORE_RETURN,
      then: Joi.number().integer().min(1).required(),
      otherwise: Joi.any().valid(null),
    }),
    warehouseId: Joi.number()
      .integer()
      .required(),
    code: Joi.string()
      .allow('')
      .default(''),
    arrivalDate: Joi.date().optional(),
    observations: Joi.string()
      .allow('')
      .default(''),
    status: Joi.string(), // TODO: REMOVE BECAUSE IS JUST FOR SEEDING
    suppliedProducts: Joi.array()
      .items(
        Joi.object({
          productId: Joi.number()
            .integer()
            .required(),
          boxSize: Joi.number()
            .integer()
            .min(1)
            .required(),
          initBoxSize: Joi.number()
            .integer()
            .optional(),
          quantity: Joi.number()
            .integer()
            .min(1)
            .required(),
          initQuantity: Joi.number()
            .integer()
            .optional(),
          suppliedQuantity: Joi.number().integer(), // TODO: REMOVE BECAUSE IS JUST FOR SEEDING
        }),
      )
      .unique((a, b) => a.productId === b.productId && a.boxSize === b.boxSize)
      .min(1)
      .required(),
  },
};

const Put = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
  body: {
    code: Joi.string().allow(''),
    type: Joi.string().valid(supplyTypes.NORMAL, supplyTypes.STORE_RETURN),
    providerId: Joi.number().integer().allow(null),
    sourceWarehouseId: Joi.number().integer().min(1).allow(null),
    warehouseId: Joi.number().integer(),
    observations: Joi.string().allow(''),
    arrivalDate: Joi.date().optional(),
    suppliedProducts: Joi.array()
      .items(
        Joi.object({
          productId: Joi.number()
            .integer()
            .required(),
          boxSize: Joi.number()
            .integer()
            .min(1)
            .required(),
          initBoxSize: Joi.number()
          .integer()
          .optional(),
          quantity: Joi.number()
            .integer()
            .min(1)
            .required(),
          initQuantity: Joi.number()
            .integer()
            .optional(),
        }),
      )
      .unique((a, b) => a.productId === b.productId && a.boxSize === b.boxSize)
      .min(1)
      .required(),
  },
};

const PutStatus = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
  body: {
    status: Joi.string()
      .valid(status.CANCELLED, status.ATTENDED, status.CLOSED_PARTIAL)
      .required(),
  },
};

const Delete = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
};

const PostAttendSuppliedProduct = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
    idSuppliedProduct: Joi.number()
      .integer()
      .required(),
  },
  body: {
    boxes: Joi.array()
      .items(
        Joi.number()
          .integer()
          .min(1),
      )
      .min(1)
      .required(),
  },
};

const DeleteAttendSuppliedProduct = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
    idSuppliedProduct: Joi.number()
      .integer()
      .required(),
  },
};

const StoreReturnAvailability = {
  query: {
    warehouseId: Joi.number().integer().min(1).required(),
    productId: Joi.number().integer().min(1),
  },
};

const uploadCsv = multer({
  fileFilter(req, file, callback) {
    const ext = path.extname(file.originalname);
    if (!['.csv'].includes(ext)) {
      return callback(new Error('Only csv are allowed'), false);
    }
    return callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 1024,
  },
  dest: '_tmp_/',
});

const validateCsv= (req, res, next)=>{
  uploadCsv.single('csv')(req, res, function(err) {
    if (err) {
      return res
        .status('400')
        .send({ status: 400, message: String(err), data: {} });
    }
    next();
  });
}

module.exports = {
  List,
  Get,
  Post,
  Put,
  Delete,
  // * Other
  PutStatus,
  PostAttendSuppliedProduct,
  DeleteAttendSuppliedProduct,
  StoreReturnAvailability,
  validateCsv,
};
