const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const Product = require("../models/product");


exports.products_get_all = (request, response, next) => {
    Product.find()
    .select("name price _id productImage")
    .exec()
    .then(docs => {
        const res = {
            count: docs.length,
            products: docs.map(doc =>{
                return{
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    _id: doc._id,
                    req: {
                        type: 'GET',
                        url: 'http://localhost:3001/products/' + doc._id
                    }
                }
            })
        };
        //if(docs.length >= 0){

        response.status(200).json(res);

        //}else {
            //response.status(404).json({
                //message: 'No entries found' 
            //});
        //}
    })
    .catch(error =>{
        console.log(error);
        response.status(500).json({
            error: error
        });
    });
};

exports.products_create_product = (request, response, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: request.body.name,
        price: request.body.price,
        productImage: request.file.path
    });
    product
        .save()
        .then(result =>{
        console.log(result);
        response.status(201).json ({
            message: "Creating product successfully",
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                req: {
                    type: 'GET',
                    url: 'http://localhost:3001/products/' + result._id
                }
            }
        });
    })
    .catch(error => {
        console.log(error);
        response.status(500).json({
            error: error
        })
    });
};

exports.products_get_product = (request, response, next) => {
    const id = request.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc =>{
            console.log(doc);
            if (doc){
                response.status(200).json({
                    product: doc,
                    req: {
                        type: 'GET',
                        url: 'http://localhost:3001/products'
                    }
                });
            } else {
                response.status(404).json({message: 'No valid entry found in provided ID'});
            }
            
        })
        .catch(error => {
            console.log(error);
            response.status(500).json({error: error});
        });
    };
  
    exports.products_update_product = (request, response, next) => {
        const id = request.params.productId;
        const updateOps = {};
        for (const ops of request.body) {
            updateOps[ops.propName] = ops.value;
        }
        Product.updateOne({ _id: id}, {$set: updateOps})
        .exec()
        .then(result => {
            
            response.status(200).json({
                message: 'Product updated',
                req: {
                    type: 'GET',
                    url: 'http://localhost:3001/products/' + id
                }
            });
        })
        .catch(error => {
            console.log(error);
            response.status(500).json({
                error: error
            });
        });
    };

    exports.products_delete = (request, response, next) => {
        const id = request.params.productId;
        Product.deleteOne({ _id: id})
        .exec()
        .then(result =>{
            response.status(200).json({
                message: 'Product Deleted',
                req: {
                    type: 'POST',
                    url: 'http://localhost:3001/products/',
                    body: { name: 'String', price: 'Number'}
                }
            });
        })
        .catch(error =>{
            console.log(error);
            response.status(500).json({
                error: error
            });
        });
    };

