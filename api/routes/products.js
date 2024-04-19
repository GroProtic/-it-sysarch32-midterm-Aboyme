const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const ProductsController = require('../controllers/products');


const storage = multer.diskStorage({
    destination: function(request, file, cb){
        cb(null,'./uploads/');
    },filename: function(request, file, cb){
        const timestamp = new Date().toISOString().replace(/:/g, '-'); // Replace colons with hyphens to make the filename valid
        cb(null, timestamp + '_' + file.originalname);
    }
});

const fileFilter = (request, file, cb) =>{
//reject file
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
    cb(null, true);
    }else{
     cb(null, false);
    }
};

const upload = multer({storage: storage,
     limits: {
    fileSize: 1024 * 1024 * 5
},
    fileFilter: fileFilter
});

const Product = require('../models/product');

router.get("/", ProductsController.products_get_all);

router.post("/", checkAuth, upload.single('productImage'), ProductsController.products_create_product);

router.get("/:productId", ProductsController.products_get_product);

router.patch("/:productId", checkAuth, ProductsController.products_update_product);

router.delete("/:productId", checkAuth, ProductsController.products_delete);
        
module.exports = router;
