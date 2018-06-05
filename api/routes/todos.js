const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/user');
const TODO = require('../models/todo');
const checkAuth = require('../middleware/check-auth');


router.get('/', checkAuth, (req, res, next) => {
    let author = req.payload.email;
    //console.log(req);
    User.findOne({email: author})
    .populate('todos')
    .exec()
    .then(user => {
        if(!user){
            return res.status(404).json({
                error: 'User not found'
            });
        }
        console.log(user);
        return res.status(200).json({
            todos: user.todos
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    });
});

router.post('/', checkAuth, (req, res, next) => {
    let author = req.payload.email;
    User.findOne({email: author})
    .exec()
    .then(user => {
        if(!user){
            return res.status(404).json({
                error: "User not found!"
            });
        }
        const todo = new TODO({
            _id: new mongoose.Types.ObjectId(),
            date: Date.now(),
            text: req.body.text,
            email: author,
            completed: false
        });
        todo.save()
        .then(result => {
            console.log(user);
            user.todos.push(result._id);
            user.save();
            return res.status(201).json({
                createdTodo: result
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                error: err
            });
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    });
});


router.patch('/:todoId', checkAuth, (req, res, next) => {
    const id = req.params.todoId;
    
    TODO.update({_id: id}, {$set: req.body})
    .exec()
    .then(result => {
        return res.status(200).json({
            updatedTodo: result
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    });
});

router.delete('/:todoId', checkAuth, (req, res, next) => {
    const id = req.params.todoId;
    let author = req.payload.email;
    User.findOne({email: author})
    //.populate('todos')
    .exec()
    .then(user => {
        if(!user){
            return res.status(500).json({
                error: "User not found"
            });
        }
        console.log(user);
        user.todos = user.todos.filter(function(e) { return e !== id});
        user.save();
        TODO.remove({_id: id})
        .exec()
        .then(response => {
            if(!response){
                return res.status(404).json({
                    err: 'Not found'
                });
            }
            return res.status(200).json(response);
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            });
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    });
});

module.exports = router;