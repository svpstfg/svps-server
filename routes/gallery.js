const express = require('express')
const router = express.Router()

const {handleMulterError, handleMulterErrorImg} = require('../middlewares/handleMulterError')
const {upload_img} = require('../helpers/init_multer');
const { verifyTokenAndAdmin } = require('../middlewares/verifyToken');

const addImgController = require('../controllers/addImg')
const getImgController = require('../controllers/getImg')
const deleteImgController = require('../controllers/deleteImg')



//GET IMAGE
router.get("/find", getImgController.getImg)


//ADD IMAGE
router.post("/add",        
        verifyTokenAndAdmin, 
        upload_img.array('images'),
        handleMulterErrorImg,
        addImgController.addImg
)


//DELETE IMAGE
router.delete("/delete",
        verifyTokenAndAdmin, 
        deleteImgController.deleteImg
)



module.exports = router