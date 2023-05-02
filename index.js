const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');


const APP_PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const STATUS_CODES = {
    OK: 200,
    INTERNAL_SERVER_ERROR: 500,
    NOT_FOUND: 404
};

app.post('/scrap', async (req, res) => {
    const url = req.body.url;
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const title = $('head title').text();

        const description = $('head meta[name="description"]').attr('content') || $('head meta[name="Description"]').attr('content') || '';
        const brandLogoUrl = $('head link[rel="shortcut icon"]').attr('href') || $('meta[property="og:image"]').attr('content') || $('img').prop('src') || '';
        const typography = [];
        const brandColors = [];
        var keywords = $('meta[name="keywords"]').attr('content') || $('meta[name="Keywords"]').attr('content') || '';

        // if(keywords)
        // keywords = keywords.split(",");

        console.log("=======================================================")
        $('meta').each((i, el) => {
            const name = $(el).attr('name');
            const content = $(el).attr('content');
            console.log(`Property ${name}: | Value >> ${content} <<`);
        });
        console.log("=======================================================")

        $('*[style]').each((i, el) => {
            const style = $(el).attr('style');
            const fontFamilyRegex = /font-family:[^;]+;/g;
            const colorRegex = /color:[^;]+;/g;
            const fontFamilies = style.match(fontFamilyRegex);
            const colors = style.match(colorRegex);
            if (fontFamilies) {
                typography.push(...fontFamilies);
            }
            if (colors) {
                colors.forEach(color => {
                    const colorCodeRegex = /#[0-9a-fA-F]{3,6}/g;
                    const colorCodes = color.match(colorCodeRegex);
                    if (colorCodes) {
                        brandColors.push(...colorCodes);
                    }
                });
            }
        });

        $('meta[name="theme-color"], meta[name="msapplication-TileColor"]').each((i, el) => {
            const content = $(el).attr('content');
            if (content) {
                brandColors.push(`${content}`);
            }
        });

        const response = {
            statusCode: STATUS_CODES.OK,
            success: true,
            successMessage: "URL Scapped Successfully",
            data: {
                brandTitle: title,
                brandURL: url,
                brandLogoUrl: brandLogoUrl,
                brandDescription: description.trim(),
                keywords: keywords,
                typography: typography,
                brandColors: brandColors,
            }
        };

        return res.status(STATUS_CODES.OK).send(response);

    } catch (error) {
        console.log(`Something went wrong: ${error}`);
        const errorResponse = {
            statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
            success: false,
            errorMessage: `Something went wrong: ${error}`,
        }
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(errorResponse);
    }
});

app.listen(APP_PORT, () => {
    console.log(`Server is running on port ${APP_PORT}`);
});

function saveBrand(data) {
    var db = db.insertOne(data, function (err, res) {
        if (err) throw err;

        console.log('Data inserted successfully');

        client.close();
    });
}