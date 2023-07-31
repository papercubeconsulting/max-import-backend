const config = require('config');
const sgMail = require('@sendgrid/mail');
const winston = require('winston');

sgMail.setApiKey(config.get('sendGridKey'));

const { from, templateIds } = config.get('sendgrid');

module.exports = {
  sendEmailTemplate: async (to, data, template, attachments) => {
    try {
      await sgMail.send({
        to,
        from,
        templateId: templateIds[template],
        dynamic_template_data: data,
        ...(attachments ? { attachments } : {}),
      });
    } catch (error) {
      winston.error(error);

      if (error.response) {
        winston.error(error.response.body);
      }
    }
  },
};
