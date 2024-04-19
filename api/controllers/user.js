const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.user_signup = (request, response, next) => {
    User.find({email:request.body.email})
    .exec()
    .then(user => {
        if (user.length >= 1) {
            return response.status(409).json({
                message: 'Mail already exists'
            });
        }else {
            bcrypt.hash(request.body.password, 10, (error, hash) =>{
                if (error){
                    return response.status(500).json({
                        error: error
                    });
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: request.body.email,
                        password: hash
                    });
                    user
                    .save()
                    .then(result => {
                        console.log(result);
                        response.status(201).json({
                            message: 'User Created'
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        response,status(500).json({
                            error: error
                        });
                    });
                }
            });
        }
    });
    
};

exports.user_login = (request, response, next) => {
    User.findOne({ email: request.body.email })
    .exec()
    .then(user => {
        if (!user) {
            return response.status(401).json({
                message: 'Authentication Failed'
            });
        }
        bcrypt.compare(request.body.password, user.password, (err, result) => {
            if (err) {
                return response.status(401).json({
                    message: 'Authentication Failed'
                });
            }
            if (result) {
                const token = jwt.sign({
                    email: user.email,
                    userId: user._id
                }, 'secret', {
                    expiresIn: '1h'
                });
                return response.status(200).json({
                    message: 'Auth successful',
                    token: token
                });
            }
            response.status(401).json({
                message: 'Authentication Failed'
            });
        });
    })
    .catch(error => {
        console.log(error);
        response.status(500).json({
            error: error
        });
    });
};


  exports.user_delete = (request, response, next) => {
    User.deleteOne({_id: request.params.userId})
    .exec()
    .then(result => {
        response.status(200).json({
            message:'User deleted' 
        });
    })
    .catch(error => {
        console.log(error);
        response.status(500).json({
            error: error
        });
    });
};