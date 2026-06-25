const express = require('express')

const authMiddleware = require('../middleware/auth-middleware')
const adminMiddleware = require('../middleware/admin-middleware')
const uploadMiddleware = require('../middleware/upload-middleware')
const {
        uploadImageController,
        fetchImagesController,
        deleteImageController
} = require('../controllers/image-controller') 

const router = express.Router()

// upload img
router.post('/upload',
        authMiddleware,
        adminMiddleware,
        uploadMiddleware.single('image'),
        uploadImageController);

// get all imgs
router.get('/get',authMiddleware, fetchImagesController);

// delete image route
router.delete('/delete/:id', authMiddleware, adminMiddleware, deleteImageController);

module.exports = router

// 6a35348ae9ab007a59d7a1bb