const mongoose = require("mongoose");

const Order = require('../models/order');
const Product = require("../models/product");

exports.orders_get_all = (request, response,next) => {
    Order.find()
    .select('product quantity _id')
    .populate('product', 'name')
    .exec()
    .then(docs => {
        response.status(200).json({
            count: docs.length,
            orders: docs.map(doc =>{
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3001/orders/' +doc._id
                    }
                }
            })
        });
    })
    .catch(error => {
        response.status(500).json({
            error: error
        });
    });
}

exports.orders_create_order = (request, response, next) => {
    Product.findById(request.body.productId)
        .then(product => {
            if (!product){
                return response.status(404).json({
                    message: "Product not found"
                });
            }
            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                quantity: request.body.quantity,
                product: request.body.productId
            });
           return order.save();
            
        })
        .then(result => {
            console.log(result);
            response.status(201).json({
                message: 'Order Stored',
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request:{
                    type:'GET',
                    url: 'http://localhost:3001/orders/' +result._id
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

exports.orders_get_order = (request, response, next) => {
    Order.findById(request.params.orderId)
    .populate('product')
    .exec()
    .then(order => {
        if(!order){
            return response.status(404).json({
                message: "Order not found"
            });
        }
        response.status(200).json({
            order: order,
            req: {
                type: 'GET',
                url: 'http://localhost:3001/orders'
            }
        });
    });
};

  exports.orders_delete_order = (request, response, next) => {
    Order.deleteOne({_id: request.params.orderId})
    .exec()
    .then(result => {
        response.status(200).json({
            message: 'Order deleted',
            req: {
                type: 'POST',
                url: 'http://localhost:3001/orders',
                body: {productId: 'ID', quantity: 'Number' }
            }
        });
    })
    .catch(error => {
        response.status(500).json({
            error: error
        });
    });
};
  