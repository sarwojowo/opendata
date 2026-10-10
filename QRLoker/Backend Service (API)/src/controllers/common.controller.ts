import type { Request, Response } from 'express';
import fetch, { Headers as FetchHeaders } from 'node-fetch'; // Install node-fetch if your Node.js version is older

const INSECURE_BASE_URL = 'http://36.66.3.44:9000';

/**
 * Express handler for proxying images from a secured external host.
 */
export const imageProxyHandler = async (req: Request, res: Response) => {
    // 1. Get the 'url' parameter from the Express query object
    const externalImageUrl = req.query.url as string;

    if (!externalImageUrl) {
        return res.status(400).send('Missing "url" parameter');
    }

    // 2. Security Check: Ensure the source is the allowed base URL
    if (!externalImageUrl.startsWith(INSECURE_BASE_URL)) {
        return res.status(403).send('Invalid image source. URL must start with the expected base.');
    }

    try {
        // 3. Fetch the image from the external source
        const imageResponse = await fetch(externalImageUrl);

        if (!imageResponse.ok) {
            console.error(`External server responded with status: ${imageResponse.status}`);
            return res.status(500).send('Failed to load image from external source.');
        }

        // 4. Set Headers: Copy Content-Type and set caching
        const contentType = imageResponse.headers.get('content-type');

        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }

        // Set strong caching headers for better client performance
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

        // Optional: If you want to forward other headers like 'Content-Length', you can do so here.
        // res.setHeader('Content-Length', imageResponse.headers.get('content-length') || '');

        // 5. Pipe/Stream the image data directly to the Express response
        // This is the key difference from the Next.js Response object
        if (imageResponse.body) {
            imageResponse.body.pipe(res);
        } else {
            res.status(500).send('Image response body is empty.');
        }
    } catch (error) {
        console.error('Image proxying failed:', error);
        res.status(500).send('Internal proxy error.');
    }
};