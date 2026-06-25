const Image = require('../models/Image');
const { uploadToCloudinary } = require('../helpers/cloudinary-helper');
const fs = require('fs')
const cloudinary = require('../config/cloudinary')

const uploadImageController = async(req, res) => {
    try{
        // check if file is missing in req object
        if(!req.file){
            return res.status(400).json({
                success: false,
                message: 'File is required. Please upload an image'
            })
        }
         
        // upload to cloudinary
        const { url, publicId } = await uploadToCloudinary(req.file.path)

        // store image url and publicId along with the uploaded userid in the database
        const newlyUploadedImage = new Image({
            url,
            publicId,
            uploadedBy: req.userInfo.userId
        })

        await newlyUploadedImage.save();

        // delete file from local storage
        fs.unlinkSync(req.file.path)

        res.status(201).json({
            success: true,
            message: 'Image uploaded usccessfully',
            image: newlyUploadedImage
        })

    } catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong please try again.'
        })
    }
}

const fetchImagesController = async(req, res) => {
    try{

        const page = parseInt(req.query.page) || 1; //current page
        const limit = parseInt(req.query.limit) || 2;
        const skip = (page - 1) * limit;

        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const totalImages = await Image.countDocuments();
        const totalPages = Math.ceil(totalImages/ limit)

        const sortObj = {};
        sortObj[sortBy] = sortOrder ;

        const images = await Image.find().sort(sortObj).skip(skip).limit(limit);

        if (images.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No images found"
            });
        }

        if(images){
            res.status(200).json({
                success: true,
                currentPage: page,
                totalPages: totalPages,
                totalImages: totalImages,
                data: images
            })
        }

    } catch(e){
        console.log(e)
            return res.status(500).json({
            success: false,
            message: 'Something went wrong please try again.'
        })
    }
};

const deleteImageController = async(req, res) => {
    try{
        const getCurrentImageID = req.params.id;
        const userID = req.userInfo.userId;

        const image = await Image.findById(getCurrentImageID);

        if(!image){
            return res.status(404).json({
                success: false,
                message: 'image not found'
            })
        }

        // check if image is uploaded by the current user who wants to delete it

        if(image.uploadedBy.toString() !== userID){
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this image'
            })
        }

        // delete the image from cloudinary first
        await cloudinary.uploader.destroy(image.publicId);

        // delete image from mongoDB 
        await Image.findByIdAndDelete(getCurrentImageID);

        res.status(200).json({
            success: true,
            message: "Image deleted successfully!"
        })

    } catch(e){
        console.log(e)
            return res.status(500).json({
            success: false,
            message: 'Something went wrong please try again.'
        })
    }
}

module.exports = {
    uploadImageController,
    fetchImagesController,
    deleteImageController
}