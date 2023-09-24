const  multer = require('multer')
const { MulterError } = require('multer');

const handleMulterError = (err, req, res, next)=>{
        console.log(err)
        if(err instanceof MulterError && err.code === 'LIMIT_FILE_SIZE') {
                // File size exceeds the limit
                return res.status(400).json({ error: 'File size exceeds the limit. Maximum individual file size allowed is 8MB.'});
        }
        else if (err instanceof MulterError && err.code === 'LIMIT_FILE_COUNT') {
                // Number of files exceeds the limit
                return res.status(400).json({ error: 'Maximum 3 files are allowed.' });
        }
        else if (err instanceof MulterError && err.code === 'EXT_UNSUPPORTED') {
                // Invalid File Extension
                return res.status(400).json({ error: 'Extensions Not Supported'});
        }
        else if (err instanceof MulterError) {
                // File size exceeds the limit
                return res.status(400).json({ error: 'Invalid Files'});
        }else{
                return next()
        }

}

const handleMulterErrorImg = (err, req, res, next)=>{
        console.log(err)
        if(err instanceof MulterError && err.code === 'LIMIT_FILE_SIZE') {
                // File size exceeds the limit
                return res.status(400).json({ error: 'File size exceeds the limit. Maximum individual file size allowed is 8MB.'});
        }
        else if (err instanceof MulterError && err.code === 'LIMIT_FILE_COUNT') {
                // Number of files exceeds the limit
                return res.status(400).json({ error: 'Maximum 9 files are allowed.' });
        }
        else if (err instanceof MulterError && err.code === 'EXT_UNSUPPORTED') {
                // Invalid File Extension
                return res.status(400).json({ error: 'Extensions Not Supported'});
        }
        else if (err instanceof MulterError) {
                // File size exceeds the limit
                return res.status(400).json({ error: 'Invalid Files'});
        }else{
                return next()
        }

}

module.exports = {handleMulterError,handleMulterErrorImg}