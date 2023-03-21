const unzipper = require('unzipper');
const fs = require('fs');
const { setResponse } = require('../../../utils');
const {
    Product,
  } = require('@dbModels');

const validateProduct = async(fileName)=>{
    const parts = fileName.split("_");
    const code = parts[0]; 
    let position = parts[1]; 
    let valid = false;
    position = position.substring(0, position.indexOf("."));
    
    let product = await Product.findOne({
        where:{code}
    })

    if(product) valid = true;

    return {
        valid,
        code,
        position,
        product
    }

}

const uploadImagesZip = async(reqParams, file, reqUser)=>{

 const rows = [];
 const columnsOutput = [];
 try {

    const stream =  fs.createReadStream(file.path);

    const data = await new Promise((resolve, reject)=>{
        stream.pipe(unzipper.Parse())
        .on('entry', async function (entry) {
          const fileName = entry.path;
          const fileType = entry.type; 
          let validProduct = await validateProduct(fileName);
          let rowResponse= {
              product: validProduct.code,
              nImage: validProduct.position,
              upload: "",
              reason: "",
          }
      
          if (fileType === 'File' && validProduct.valid) {
            // read the contents of the file and convert to base64
            console.log("File name", fileName);
            
            entry.buffer().then(async buffer => {
              const base64Data = `data:image${Buffer.from(buffer).toString('base64')};base64`;
              
              //TODO: ecapsulat this logic
              let updateData={};
              if(validProduct.position=='1') { updateData={imageBase64:base64Data};}
              if(validProduct.position=='2'){ updateData={secondImageBase64:base64Data};}
              if(validProduct.position=='3'){ updateData={thirdImageBase64:base64Data};}
      
              //console.log(updateData);
              rowResponse.upload= "EXITOSO";
              rowResponse.reason= "OK";
              ///await validProduct.product.update(updateData);
      
              console.log('File saved:', fileName);
            });
          } else {
            rowResponse.upload="NO EXITOSO";
            rowResponse.reason ="Código de producto no existe o número de imagen incorrecto";
            entry.autodrain();
          }
      
          rows.push(rowResponse);
          
      
        })
        .on('close', function () {
          // delete the zip file
          fs.unlink(file.path, (err) => {
            if (err) console.log(err);
            console.log('Zip file deleted:', file.path);
            resolve(rows);
            
          });     
      
        });

    })
    
   
    return setResponse(200, 'Images uploaded and unzipeped successfully',{fields:columnsOutput, data:rows});


 }catch(error){
    console.log("error", error);
    return setResponse(500, 'Something wrong',{});
 }
  


}

module.exports = {
    uploadImagesZip,
};