// const mongoose = require('mongoose');
import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
    brandTitle: {
        type: String,
        required: true
    },
    brandURL: {
        type: String,
        required: true
    },
    brandLogoUrl: {
        type: String,
        required: true
    },
    brandDescription: {
        type: String,
        required: true
    },
    keywords: [String],
    typography: [String],
    brandColors: [String]
});

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
// module.exports = Brand;
