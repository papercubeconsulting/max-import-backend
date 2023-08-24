const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { User, Proforma } = require('@dbModels');
const { setResponse } = require('@root/api/utils');
const config = require('config');
const sgMail = require('@sendgrid/mail');

const { from, templateIds } = config.get('sendgrid');

sgMail.setApiKey(config.get('sendGridKey'));

const sendPdf = async (url, bearerToken, req) => {
  const { id: proformaId } = req.params || {};
  const proforma = Proforma.findByPk(proformaId);

  if (!proforma)
    return setResponse(
      404,
      'User not found.',
      {},
      'La proforma indicada no existe',
    );
  const browser = await puppeteer.launch({ headless: true });
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

  // const content = await page.content();

  // await new Promise((resolve, reject) => {
  //   fs.writeFile(path.join(__dirname, './updateXml.html'), content, err => {
  //     if (err) {
  //       reject(err);
  //     } else {
  //       resolve();
  //     }
  //   });
  // });

  // const bearerToken = req.headers.authorization;
  // console.log({ bearerToken });

  // await page.setViewport({ width: 1200, height: 800 });

  // await page.waitFor(5000)

  // console.log(await page.content());
  const user = await User.findByPk(req.user.id);

  if (!user)
    return setResponse(
      404,
      'User not found.',
      {},
      'El correo ingresado no pertenece a ningún usuario',
    );

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
    CLIENT_NAME: user.name,
    INVOICE_NUMBER: proformaId,
    PHONE_NUMBER_CONTACT: user.phoneNumber,
    SELLER: `${user.name} ${user.lastname}`,
  };

  const msg = {
    to: user.email, // Change to your recipient
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
