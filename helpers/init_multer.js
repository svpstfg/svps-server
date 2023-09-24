const path = require('path');

const  multer = require('multer')
const { MulterError } = require('multer');

const storage = multer.memoryStorage()

const upload = multer({ 
        storage: storage ,
        limits: {
                files: 3,
                fileSize: 0.4 * 1024 * 1024 //400kb max
        },
        fileFilter: (req, file, next) => {
                const allowedFileExtensions = ['.pdf', '.docx', '.doc', '.jpeg', '.jpg', '.png', '.xlsx', '.csv'];
            
                const extname = path.extname(file.originalname).toLowerCase();
                if(extname !== '.png' && extname !== '.jpg' && extname !== '.jpeg' && extname !== '.pdf' 
                && extname !== '.docx' && extname !== '.doc' && extname !== '.xlsx' && extname !== '.xlsx') {
                        return next(new MulterError('EXT_UNSUPPORTED'))
                }else{
                        next(null, true);
                }
        }
        
})

const upload_img = multer({
        storage : storage,
        limits: {
                files : 9,
                fileSize: 7 * 1024 * 1024
        },
        fileFilter: (req,file, next)=>{
                const extname = path.extname(file.originalname).toLowerCase();
                if(extname !== '.png' && extname !== '.jpg' && extname !== '.jpeg' && extname !== '.pdf') {
                        return next(new MulterError('EXT_UNSUPPORTED'))
                }else{
                        next(null, true);
                }
        }
})

module.exports = {upload, upload_img}