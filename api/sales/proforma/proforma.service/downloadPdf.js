const puppeteer = require('puppeteer');
const { Proforma, Client } = require('@dbModels');
const { setResponse } = require('@root/api/utils');


const downloadPdf = async(url, bearerToken, req)=>{
  const { id: proformaId } = req.params || {};
  const proforma = await Proforma.findByPk(proformaId);

  if (!proforma){
    return setResponse(
        404,
        'User not found.',
        {},
        'La proforma indicada no existe',
    );
  }

  const { clientId } = proforma.dataValues;

  const client = await Client.findByPk(clientId);

  if (!client){
    return setResponse(
      404,
      'User not found.',
      {},
      'No se ha encontrado el usuario',
    );
  }

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'], // Add this line to disable sandboxing
  });
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    Authorization: bearerToken,
  });

  await page.goto(url, {});

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

  await browser.close();

  return result;

};

module.exports = {
    downloadPdf,
};

