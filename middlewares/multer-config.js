import path from "path";
import multer from "multer";

// Multer configuration for taskDocument
const storageTaskDocument = multer.diskStorage({
  destination: function (req, file, cb) {

    if (file.fieldname === 'reimbursementDoc') {
      cb(null, "./public/reimbursementDoc");
    }else
    if (file.fieldname === 'assetDocument') {
      cb(null, "./public/assetsDocs");
    }else
    if (file.fieldname === 'licenseDocument' || file.fieldname === 'licenseImage') {
      cb(null, "./public/licenseDocs");
    } else {
      cb(null, "./public/taskDoc");
    }
    // cb(null, "./public/taskDoc");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    if (file.fieldname === 'taskDocument') {
      cb(null, "taskDocument-" + uniqueSuffix + ext);
    } else  if(file.fieldname === 'noteImage') {
      cb(null, "noteImage-" + uniqueSuffix + ext);
    } else  if(file.fieldname === 'reimbursementDoc') {
      cb(null, "reimbDoc-" + uniqueSuffix + ext);
    } else  if(file.fieldname === 'assetDocument') {
      cb(null, "assetDoc-" + uniqueSuffix + ext);
    } else  if(file.fieldname === 'licenseDocument') {
      cb(null, "licenseDoc-" + uniqueSuffix + ext);
    } else  if(file.fieldname === 'licenseImage') {
      cb(null, "licenseImage-" + uniqueSuffix + ext);
    }else{
      cb(null, "taskImage-" + uniqueSuffix + ext);
    }
  },
});

// if (file.fieldname === 'taskDocument') {
  //   cb(null, "./public/taskDoc");
  // } else {
  //   cb(null, "./public/taskImages");
  // }
  

// Multer instances for taskDocument and taskImage
const taskDocumentUploadHandler = multer({ storage: storageTaskDocument });

export {
  taskDocumentUploadHandler,
};
