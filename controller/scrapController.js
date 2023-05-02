import axios from 'axios';
import * as cheerio from 'cheerio';
import getColors from 'get-image-colors';
import sharp from 'sharp';
import STATUS_CODES from '../models/statusCodes.js';
import { saveBrand } from '../database/mongo.js';

export const scrap = async (req, res) => {
    const url = req.body.url;
    try {
        const { data } = await axios.get(url, { timeout: 5 * 1000 });
        const $ = cheerio.load(data);
        const title = $('head title').text();

        const description = $('head meta[name="description"]').attr('content') || $('head meta[name="Description"]').attr('content') || '';
        const brandLogoUrl = $('head link[rel="shortcut icon"]').attr('href') || $('meta[property="og:image"]').attr('content') || $('img').prop('src') || '';
        const keywords = $('meta[name="keywords"]').attr('content') || $('meta[name="Keywords"]').attr('content') || '';
        const typography = [];
        const brandColors = [];

        console.log("=======================================================")
        $('meta').each((i, el) => {
            const name = $(el).attr('name');
            const content = $(el).attr('content');
            console.log(`Property ${name}: | Value >> ${content} <<`);
        });
        console.log("=======================================================")

        $('*[style]').each((i, el) => {
            const style = $(el).attr('style');
            const fontFamilyRegex = /font-family:\s*([\w\s'"-,]+)\s*[;,]/g;
            const fontFamilies = [];
            let match;

            while (match = fontFamilyRegex.exec(style)) {
                console.log("match: ", match[1]);
                fontFamilies.push(match[1]);
            }

            if (fontFamilies.length) {
                typography.push(...fontFamilies);
            }
        });

        if (brandLogoUrl) {
            try {
                let cols = await getImageColors(brandLogoUrl)
                brandColors.push(...cols);
                brandColors.splice(10);
            } catch (error) {
                console.log(`Failed to get image colors: ${error}`);
            }
        }

        const response = {
            statusCode: STATUS_CODES.OK,
            success: true,
            successMessage: "URL Scrapped Successfully",
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
        saveBrand(response.data);
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
}


async function getImageColors(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'utf-8');

    let colors;

    // get image type
    const type = response.headers['content-type'];
    console.log("IMAGE TYPE: ", type);

    // get colors based on image type
    if (type === 'image/jpeg') {
        colors = await getColors(buffer, 'image/jpeg');
    } else if (type === 'image/png') {
        colors = await getColors(buffer, 'image/png');
    } else if (type === 'image/gif') {
        colors = await getColors(buffer, 'image/gif');
    } else if (type === 'image/svg+xml') {
        const cheerioSvg = cheerio.load(buffer.toString('utf-8'), { xmlMode: true });
        const svgColors = [];
        cheerioSvg('path').each(function () {
            const fill = cheerioSvg(this).attr('fill');
            if (fill) {
                svgColors.push(fill);
            }
        });
        colors = await getColors(svgColors, 'image/svg+xml');
    } else if (type === 'image/x-icon') {
        colors = await getIconColors(buffer);
    }
    else {
        throw new Error('Unsupported image type');
    }

    const finalColors = colors.map(color => color.hex());
    return finalColors;
}


async function getIconColors(buffer) {
    const image = sharp(buffer);
    const { format, width, height } = await image.metadata();
    const frame = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const colors = await getColors(frame.data, format, { count: 10 });
    const colorPalette = colors.map(color => color.hex());
    console.log("colorPalette", colorPalette);
    return colorPalette;
}