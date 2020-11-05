/* eslint-disable import/no-dynamic-require */
const _ = require('lodash');
const moment = require('moment-timezone');
const Dinero = require('dinero.js');

const {
  Proforma,
  Client,
  Sale,
  User,
  ProformaProduct,
  SoldProduct,
  Dispatch,
  Product,
  Model,
} = require('@dbModels');
const { Op } = require('sequelize');

const { setResponse } = require('@root/api/utils');

const formatDate = (date, prefix) => {
  const ans = {};
  if (!date) return ans;
  const localDate = moment.tz(date, 'America/Lima');
  ans[`${prefix}Year`] = localDate.year();
  ans[`${prefix}Month`] = localDate.month() + 1; // * 0 based
  ans[`${prefix}Day`] = localDate.date();
  return ans;
};

const columns = [
  { label: 'TIPO DE DOCUMENTO (OBLIGATORIO)', value: 'documentType' },
  { label: 'CÓDIGO DOCUMENTO  (OBLIGATORIO)', value: 'documentCode' },
  { label: 'NÚMERO DE DOCUMENTO (OBLIGATORIO)', value: 'documentNumber' },
  { label: 'AÑO DEL DOCUMENTO', value: 'creationYear' },
  { label: 'MES DEL DOCUMENTO', value: 'creationMonth' },
  { label: 'DÍA DEL DOCUMENTO', value: 'creationDay' },
  { label: 'AÑO PACTADO DE ENTREGA', value: 'dispatchYear' },
  { label: 'MES PACTADO DE ENTREGA', value: 'dispatchMonth' },
  { label: 'DÍA PACTADO DE ENTREGA', value: 'dispatchDay' },
  { label: 'CÓDIGO DEL VENDEDOR', value: 'sellerId' },
  { label: 'CÓDIGO DE LA CIUDAD', value: 'clientId' },
  { label: 'CÓDIGO DE LA ZONA', value: 'zoneCode' },
  { label: 'SECUENCIA', value: 'index' },
  { label: 'CENTRO DE COSTO', value: 'costCenter' },
  { label: 'SUBCENTRO DE COSTO', value: 'costSubCenter' },
  { label: 'NIT', value: 'NIT' },
  { label: 'SUCURSAL', value: 'branchOffice' },
  { label: 'DESCRIPCIÓN DE LA SECUENCIA', value: 'tradename' },
  { label: 'FORMA DE PAGO', value: 'paymentWay' },
  { label: 'PORCENTAJE DEL IMPOCONSUMO', value: 'impoconsumoPercentage' },
  { label: 'VALOR DEL IMPOCONSUMO', value: 'impoconsumoValue' },
  { label: 'PORCENTAJE DEL IMPODEPORTE', value: 'impodeportePercentage' },
  { label: 'VALOR DEL IMPODEPORTE', value: 'impodeporteValue' },
  { label: 'PORCENTAJE DESCUENTO 1', value: 'discount1Percentage' },
  { label: 'VALOR DESCUENTO 1', value: 'discount1Value' },
  { label: 'PORCENTAJE DESCUENTO 2', value: 'discount2Percentage' },
  { label: 'VALOR DESCUENTO 2', value: 'discount2Value' },
  { label: 'PORCENTAJE DESCUENTO 3', value: 'discount3Percentage' },
  { label: 'VALOR DESCUENTO 3', value: 'discount3Value' },
  { label: 'PORCENTAJE CARGO 1', value: 'cargo1Percentage' },
  { label: 'VALOR CARGO 1', value: 'cargo1Value' },
  { label: 'PORCENTAJE CARGO 2', value: 'cargo2Percentage' },
  { label: 'VALOR CARGO 2', value: 'cargo2Value' },
  { label: 'PORCENTAJE CARGO 3', value: 'cargo3Percentage' },
  { label: 'VALOR CARGO 3', value: 'cargo3Value' },
  { label: 'LÍNEA PRODUCTO', value: 'familyId' },
  { label: 'GRUPO PRODUCTO', value: 'subfamilyId' },
  { label: 'CÓDIGO PRODUCTO', value: 'modelCode' },
  { label: 'CANTIDAD', value: 'quantity' },
  { label: 'VALOR DE LA SECUENCIA', value: 'price' },
  { label: 'CÓDIGO DE LA BODEGA', value: 'warehouseId' },
  { label: 'CÓDIGO DE LA UBICACIÓN', value: 'locationId' },
  { label: 'CANTIDAD DE FACTOR DE CONVERSIÓN', value: 'conversionFactor' },
  {
    label: 'OPERADOR DE FACTOR DE CONVERSIÓN',
    value: 'conversionFactorOperator',
  },
  { label: 'VALOR DEL FACTOR DE CONVERSIÓN', value: 'conversionFactorValue' },
  { label: 'CÓDIGO DE LA MONEDA', value: 'currencyCode' },
  { label: 'VALOR DE LA SECUENCIA EN EXTRANJERA', value: 'foreignPrice' },
  { label: 'COMPROBANTE ORDEN COMPRA', value: 'purchaseOrderReceipt' },
  { label: 'NÚMERO ORDEN COMPRA', value: 'purchaseOrderNumber' },
  { label: 'TIPO DE AFECTACIÓN', value: 'affectationType' },
  { label: 'TIPO DE OPERACIÓN', value: 'operationType' },
  { label: 'DESCRIPCIÓN LARGA', value: 'description' },
  { label: '08001-CUENTA CORRIENTE BCP SOLES', value: 'account' },
];

const getSIGOSaleReport = async reqQuery => {
  const sales = await Sale.findAll({
    where: reqQuery,
    include: [
      { model: SoldProduct, include: [{ model: Product, include: [Model] }] },
      { model: Proforma, include: [Client, ProformaProduct, Dispatch] },
      { model: User, as: 'cashier' },
      { model: User, as: 'seller' },
    ],
    distinct: true,
  });

  const rows = [].concat(
    ...sales.map(sale => {
      const creationDate = formatDate(sale.proforma.createdAt, 'creation');
      const dispatchDate = formatDate(
        sale.proforma.dispatch.completedAt,
        'dispatch',
      );
      return sale.soldProducts.map((soldProduct, i) => {
        const proformaProduct = sale.proforma.proformaProducts.find(
          obj => obj.productId === soldProduct.productId,
        );

        const price = Dinero({ amount: proformaProduct.subtotal });
        const [igv, subtotal] = price.allocate([0.18, 0.82]);

        return {
          documentType: 'Z',
          documentCode: '5',
          documentNumber: sale.proformaId,
          ...creationDate,
          ...dispatchDate,
          sellerId: sale.sellerId,
          clientId: sale.proforma.clientId,
          zoneCode: 0,
          index: i + 1,
          costCenter: 1,
          costSubCenter: 0,
          NIT: sale.proforma.client.idNumber,
          branchOffice: 0,
          tradename: soldProduct.product.tradename,
          paymentWay: sale.type,

          impoconsumoPercentage: 0,
          impoconsumoValue: 0,
          impodeportePercentage: 0,
          impodeporteValue: 0,

          discount1Percentage: 0,
          discount1Value: 0,
          discount2Percentage: 0,
          discount2Value: 0,
          discount3Percentage: 0,
          discount3Value: 0,

          cargo1Percentage: 0,
          cargo1Value: 0,
          cargo2Percentage: 0,
          cargo2Value: 0,
          cargo3Percentage: 0.18,
          cargo3Value: igv.toUnit(),

          familyId: soldProduct.product.familyId,
          subfamilyId: soldProduct.product.subfamilyId,
          modelCode: soldProduct.product.model.code,
          quantity: proformaProduct.quantity,
          price: subtotal.toUnit(),

          warehouseId: 1, // ! To review
          locationId: 0,
          conversionFactor: 0,
          conversionFactorOperator: 0,
          conversionFactorValue: 0,
          currencyCode: 1,
          foreignPrice: 0, // ! To validate if is 0
          purchaseOrderReceipt: '',
          purchaseOrderNumber: '',
          affectationType: 0,
          operationType: 0,
          description: 0,
          account: '',
        };
      });
    }),
  );

  return setResponse(200, 'Sales found.', { fields: columns, data: rows });
};

module.exports = { getSIGOSaleReport };
