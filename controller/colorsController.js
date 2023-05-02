import getColors from 'get-image-colors';
import STATUS_CODES from '../models/statusCodes.js';
import { fileTypeFromFile } from 'file-type';

export const scrapColors = async (req, res) => {
    try {
        console.log('\n\n REQ', req.file);
        const buffer = req.file.buffer;
        const fileBuffer = new Uint8Array(buffer);
        let colors;
        const type = req.file.mimetype;
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
        } else {
            throw new Error('Unsupported image type');
        }

        const finalColors = colors.map(color => color.hex());

        const resColor = {
            statusCode: STATUS_CODES.OK,
            success: true,
            message: `Colors fetched from image successfully`,
            colors: finalColors
        };
        return res.status(STATUS_CODES.OK).send(resColor);
    }
    catch (error) {
        console.error(error);
        const errorResponse = {
            statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
            success: false,
            errorMessage: `Something went wrong: ${error}`,
        }
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(errorResponse);
    }
}
