const { Joi } = require('celebrate');
const multer = require('multer');
const path = require('path');

const List = {
  query: {
    stock: Joi.string()
      .valid('yes', 'no', 'all')
      .default('all'),
    code: Joi.string(),
    familyId: Joi.number().integer(),
    subfamilyId: Joi.number().integer(),
    elementId: Joi.number().integer(),
    modelId: Joi.number().integer(),
    providerId: Joi.number().integer(),

    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    pageSize: Joi.number()
      .integer()
      .min(1)
      .default(20),

    tradename: Joi.string()
      .lowercase()
      .trim(),
  },
};

const Get = {
  query: {
    noStock: Joi.boolean().default(false),
  },
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
};

const Post = {
  body: {
    familyId: Joi.number().integer(),
    subfamilyId: Joi.number().integer(),
    elementId: Joi.number().integer(),
    modelId: Joi.number().integer(),

    familyCode: Joi.string().required(),
    subfamilyCode: Joi.string().required(),
    elementCode: Joi.string().required(),

    providerId: Joi.number()
      .integer()
      .required(),

    familyName: Joi.string()
      .min(1)
      .required(),
    subfamilyName: Joi.string()
      .min(1)
      .required(),
    elementName: Joi.string()
      .min(1)
      .required(),
    modelName: Joi.string()
      .min(1)
      .required(),
    imageBase64: Joi.string(),
    secondImageBase64: Joi.string(),
    thirdImageBase64: Joi.string(),
    compatibility: Joi.string(),
    tradename: Joi.string(),
    suggestedPrice: Joi.number()
      .integer()
      .required(),
    cost: Joi.number().positive().default(0),
  },
};

const Put = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
  body: {
    imageBase64: Joi.string().allow(null),
    secondImageBase64: Joi.string().allow(null),
    thirdImageBase64: Joi.string().allow(null),
    compatibility: Joi.string().allow(''),
    tradename: Joi.string(),
    suggestedPrice: Joi.number().integer(),
    cost: Joi.number().integer(),
  },
};

const Delete = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
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

const uploadZip = multer({
  fileFilter(req, file, callback) {
    const ext = path.extname(file.originalname);
    if (!['.zip'].includes(ext)) {
      return callback(new Error('Only zip are allowed'), false);
    }
    return callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 1024 * 1024,
  },
  dest: '_tmp_/',
});

const validateCsv = (req, res, next) => {
  uploadCsv.single('csv')(req, res, function(err) {
    if (err) {
      return res
        .status('400')
        .send({ status: 400, message: String(err), data: {} });
    }
    next();
  });
};

const validateImagesZip = (req, res, next) => {
  uploadZip.single('zip')(req, res, function(err) {
    if (err) {
      return res
        .status('400')
        .send({ status: 400, message: String(err), data: {} });
    }
    next();
  });
};
module.exports = {
  List,
  Get,
  Post,
  Put,
  Delete,
  validateCsv,
  validateImagesZip,
};
