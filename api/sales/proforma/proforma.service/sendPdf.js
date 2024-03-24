const puppeteer = require('puppeteer');
const { User, Proforma, Client } = require('@dbModels');
const { setResponse } = require('@root/api/utils');
const config = require('config');
const sgMail = require('@sendgrid/mail');

const { from, templateIds } = config.get('sendgrid');

sgMail.setApiKey(config.get('sendGridKey'));

const sendPdf = async (url, bearerToken, req) => {
  const DEFAULT_PHONE_NUMBER = '946098776';
  const { id: proformaId } = req.params || {};
  const proforma = await Proforma.findByPk(proformaId);

  if (!proforma)
    return setResponse(
      404,
      'User not found.',
      {},
      'La proforma indicada no existe',
    );

  const { clientId, userId } = proforma.dataValues;

  const client = await Client.findByPk(clientId);
  const user = await User.findByPk(userId);

  if (!client)
    return setResponse(
      404,
      'User not found.',
      {},
      'No se ha encontrado el usuario',
    );

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'], // Add this line to disable sandboxing
  });
  const page = await browser.newPage();

  // console.log(url);
  // console.log({ bearerToken });
  await page.setExtraHTTPHeaders({
    Authorization: bearerToken,
  });

  await page.goto(url, {
    // waitUntil: 'networkidle0',
  });

  // to force the css style of the table due primary blue color is setup
  // in them antd theme in the front end
  await page.addStyleTag({
    content: `
    html {
      -webkit-print-color-adjust: exact !important;
      -webkit-filter: opacity(1) !important;
    }
  `,
  });

  await page.waitFor(3000);

  const result = await page.pdf({
    format: 'a3',
  });

  const base64Pdf = result.toString('base64');

  const attachments = [
    {
      content: base64Pdf,
      filename: `Proforma ${proformaId}`,
      type: 'application/pdf',
      disposition: 'attachment',
    },
  ];
  const data = {
    CLIENT_NAME: client.name,
    INVOICE_NUMBER: proformaId,
    PHONE_NUMBER_CONTACT: user.phoneNumber || DEFAULT_PHONE_NUMBER,
    SELLER: `${client.name} ${client.lastname}`,
  };

  const msg = {
    to: client.email, // Change to your recipient
    from, // Change to your verified sender
    subject: `MAX IMPORT: COTIZACION N°: ${proformaId}`,
    templateId: templateIds.emailProforma,
    dynamic_template_data: data,
    attachments,
  };

  await sgMail.send(msg);

  await browser.close();

  return result;
};

module.exports = {
  sendPdf,
};
