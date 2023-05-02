import mongoose from 'mongoose';
import Brand from '../models/brand.js';

const dbName = 'brandDetails';
const host = '127.0.0.1';
const port = '27017';
const url = `mongodb://${host}:${port}/${dbName}`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', function () {
    console.log('MongoDB connection opened successfully!');
});

export function saveBrand(data) {
    const brand = new Brand({
        brandURL: data.brandURL,
        brandTitle: data.brandTitle,
        brandDescription: data.brandDescription,
        brandLogoUrl: data.brandLogoUrl,
        keywords: data.keywords,
        typography: data.typography,
        brandColors: data.brandColors
    });

    console.log(brand);

    db.collection('brands').insertOne(brand, function (err, r) {
        if (err) {
            console.error(err);
        } else {
            console.log('Data saved successfully!');
            db.close();
        }
    });
};


