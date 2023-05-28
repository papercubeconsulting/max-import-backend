/* eslint-disable no-await-in-loop */
const ExcelJS = require('exceljs');
const moment = require('moment');
const path = require('path');
const tempfile = require('tempfile');
const winston = require('winston');

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
};

const basePath = path.resolve(process.cwd(), 'api/utils/templates/xlsx');

const parseDate = obj =>
  moment(
    `${obj.creationYear}-${obj.creationMonth + 2}-${obj.creationDay}`,
    'YYYY-MM-DD',
  );

module.exports = {
  excelParser: async (res, fileName, fields, data) => {
    const source = path.resolve(basePath, 'baseSigoSales.xlsx');
    const initRow = 6;
    const tempFilePath = tempfile('.xlsx');
    // try {
    //   fs.unlinkSync(destination);
    // } catch (error) {}

    // fs.copyFileSync(source, destination);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(source);
    const worksheet = workbook.worksheets[0];

    const rangeDate = data.reduce(
      (prev, curr) => {
        const creationDate = parseDate(curr);
        return {
          min: creationDate < prev.min ? creationDate : prev.min,
          max: creationDate > prev.max ? creationDate : prev.max,
        };
      },
      { min: parseDate(data[0]), max: parseDate(data[0]) },
    );

    worksheet.getCell('A3').value = `De: ${rangeDate.min
      .locale('es')
      .format('MMM D/YYYY')} A: ${rangeDate.max
      .locale('es')
      .format('MMM D/YYYY')}`.toUpperCase();

    await asyncForEach(data, async (row, i) => {
      worksheet.getRow(initRow + i).values = Object.values(row);
    });
    // await workbook.xlsx.writeFile(destination);
    // fs.unlinkSync(destination);
    // res is a Stream object

    // res.setHeader(
    //   'Content-Type',
    //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // );
    // res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    // return workbook.xlsx.write(res).then(function() {
    //   res.status(200).end();
    // });

    workbook.xlsx.writeFile(tempFilePath).then(function() {
      res.status(200).sendFile(tempFilePath, function(err) {
        if (err) winston.error(`---------- error downloading file: ${err}`);
      });
    });
  },
  excelParserProductBox: async (res, fileName, fields, data) => {
    const source = path.resolve(basePath, 'baseProductBox.xlsx');
    const initRow = 4;
    const tempFilePath = tempfile('.xlsx');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(source);
    const worksheet = workbook.worksheets[0];

    await asyncForEach(data, async (row, i) => {
      worksheet.getRow(initRow + i).values = Object.values(row);
    });

    workbook.xlsx.writeFile(tempFilePath).then(function() {
      res.status(200).sendFile(tempFilePath, function(err) {
        if (err) winston.error(`---------- error downloading file: ${err}`);
      });
    });
  },
  excelParserProductBoxMovement: async (res, fileName, fields, data) => {
    const source = path.resolve(basePath, 'baseProductBoxMovement.xlsx');
    const initRow = 4;
    const tempFilePath = tempfile('.xlsx');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(source);
    const worksheet = workbook.worksheets[0];

    await asyncForEach(data, async (row, i) => {
      worksheet.getRow(initRow + i).values = Object.values(row);
    });

    workbook.xlsx.writeFile(tempFilePath).then(function() {
      res.status(200).sendFile(tempFilePath, function(err) {
        if (err) winston.error(`---------- error downloading file: ${err}`);
      });
    });
  },
  excelParserInventory: async (res, fileName, fields, data) => {
    const source = path.resolve(basePath, 'baseInventory.xlsx');
    const initRow = 4;
    const tempFilePath = tempfile('.xlsx');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(source);
    const worksheet = workbook.worksheets[0];

    await asyncForEach(data, async (row, i) => {
      worksheet.getRow(initRow + i).values = Object.values(row);
    });

    workbook.xlsx.writeFile(tempFilePath).then(function() {
      res.status(200).sendFile(tempFilePath, function(err) {
        if (err) winston.error(`---------- error downloading file: ${err}`);
      });
    });
  },

  excelParserBulkUpload: async (res, fileName, fields, data) => {
    const source = path.resolve(basePath, 'baseBulkUploadResponse.xlsx');
    const initRow = 4;
    const tempFilePath = tempfile('.xlsx');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(source);
    const worksheet = workbook.worksheets[0];

    await asyncForEach(data, async (row, i) => {
      worksheet.getRow(initRow + i).values = Object.values(row);
    });

    workbook.xlsx.writeFile(tempFilePath).then(function() {
      res.status(200).sendFile(tempFilePath, function(err) {
        if (err) winston.error(`---------- error downloading file: ${err}`);
      });
    });
  },

  excelParserBulkImagesUpload: async (res, fileName, fields, data) => {
    const source = path.resolve(basePath, 'baseBulkImagesUploadResponse.xlsx');
    const initRow = 4;
    const tempFilePath = tempfile('.xlsx');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(source);
    const worksheet = workbook.worksheets[0];

    await asyncForEach(data, async (row, i) => {
      worksheet.getRow(initRow + i).values = Object.values(row);
    });

    workbook.xlsx.writeFile(tempFilePath).then(function() {
      res.status(200).sendFile(tempFilePath, function(err) {
        if (err) winston.error(`---------- error downloading file: ${err}`);
      });
    });
  },

  excelParserSupplyUpload:async(res,data)=>{
    const source = path.resolve(basePath, 'baseSupplyeUploadResponse.xlsx');
    const initRow = 4;
    const tempFilePath = tempfile('.xlsx');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(source);
    const worksheet = workbook.worksheets[0];

    await asyncForEach(data, async (row, i) => {
      worksheet.getRow(initRow + i).values = Object.values(row);
    });

    workbook.xlsx.writeFile(tempFilePath).then(function() {
      res.status(200).sendFile(tempFilePath, function(err) {
        if (err) winston.error(`---------- error downloading file: ${err}`);
      });
    });
  },
};
