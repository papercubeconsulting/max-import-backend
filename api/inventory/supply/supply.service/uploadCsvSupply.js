const { setResponse } = require('../../../utils');
const uploadCsvSupply=async(reqParams, file, reqUser)=>{

    const columnsOutput=[];
    const row=[];
    return setResponse(200, 'Products upload', {
        fields: columnsOutput,
        data: row,
      });
}


module.exports = {
    uploadCsvSupply,
};