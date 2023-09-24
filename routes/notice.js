const express = require('express')
const path = require('path');
const jwt = require('jsonwebtoken')
const { route } = require('./auth')
const router = express.Router()
const CryptoJs = require('crypto-js')
const randomStr = require('../helpers/random_string_generator')
const Notice = require('../models/Notice')
const Attachment = require('../models/Attachment')
const updateNoticeSchema = require('../helpers/validation_schema_login')
const addNoticeSchema = require('../helpers/validation_schema_add_notice')

const getNoticeController = require('../controllers/getNotice')
const addNoticeController = require('../controllers/addNotice')
const updateNoticeController = require('../controllers/updateNotice')
const deleteNoticeController = require('../controllers/deleteNotice')


const  multer = require('multer')
const { MulterError } = require('multer');
const {handleMulterError} = require('../middlewares/handleMulterError')
const {upload} = require('../helpers/init_multer');
const { verifyTokenAndAdmin } = require('../middlewares/verifyToken');




//GET NOTICE
router.get("/find",getNoticeController.getNotice)


//ADD NOTICE
router.post("/add",
        verifyTokenAndAdmin, 
        upload.array('attachments'),
        handleMulterError,
        addNoticeController.addNotice
)


//UPDATE NOTICE
router.put("/update",
        verifyTokenAndAdmin,
        upload.array('attachments'),
        handleMulterError,
        updateNoticeController.updateNotice
)


//DELETE NOTICE
router.delete("/delete",
        verifyTokenAndAdmin,
        deleteNoticeController.deleteNotice
)



module.exports = router