const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { sendEmailTemplate } = require('@/utils');

const sendPdf = async (url, bearerToken) => {
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

  await page.addStyleTag({
    content: `
    html {
      -webkit-print-color-adjust: exact !important;
      -webkit-filter: opacity(1) !important;
    }
  `,
  });

  await page.waitFor(3000);

  const content = await page.content();

  await new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, './updateXml.html'), content, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  // const bearerToken = req.headers.authorization;
  // console.log({ bearerToken });

  // await page.setViewport({ width: 1200, height: 800 });

  // await page.waitFor(5000)

  // console.log(await page.content());

  const result = await page.pdf({
    format: 'a3',
  });

  const base64Pdf = result.toString('base64');

  const attachments = [
    {
      content: base64Pdf,
      filename: '',
      type: 'application/pdf',
      disposition: 'attachment',
    },
  ];

  // await sendEmailTemplate({to,})

  await browser.close();

  return result;
};

module.exports = {
  sendPdf,
};
