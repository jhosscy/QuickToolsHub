import header from './header.ts';
import { eTag, ifNoneMatch } from './etag.ts';
import homepage from './src/index.html' with { type: 'text' };
import qrscanner from './src/qrscanner.html' with { type: 'text' };
import qrgenerator from './src/qrgenerator.html' with { type: 'text' };

const server = Bun.serve({
  port: process.env.PORT || 4321,
  routes: {
    '/': {
      GET: (req: Request) => {
        return new Response(homepage, header({ ext: 'html' }));
      }
    },
    '/qrscanner': {
      GET: (req: Request) => {
        return new Response(qrscanner, header({ ext: 'html' }))
      }
    },
    '/qrgenerator': {
      GET: (req: Request) => {
        return new Response(qrgenerator, header({ ext: 'html' }))
      }
    }
  },
  development: false,
  async fetch(req: Request) {
    const pathname = new URL(req.url).pathname;
    const fileExtension = pathname.split('.').pop() || '';
    const publicFilePath = `${Bun.cwd}${pathname}`;
    const file = Bun.file(publicFilePath);
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    if (imageExtensions.includes(fileExtension.toLowerCase())) {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const computedETag = await eTag(uint8Array);
      const ifNone = req.headers.get("if-none-match");
      if (!ifNoneMatch(ifNone, computedETag)) {
        return new Response(null, header({
          status: 304,
          customHeaders: {
            "Cache-Control": "max-age=7200,must-revalidate"
          }
        }));
      }
      return new Response(file, header({
        ext: fileExtension,
        customHeaders: {
          "etag": computedETag,
          "Cache-Control": "max-age=7200,must-revalidate"
        }
      }));
    }
    const build = await Bun.build({
      entrypoints: [publicFilePath],
      minify: true
    })
    const output = await build.outputs[0].text();
    const computedETag = await eTag(output);
    const ifNone = req.headers.get("if-none-match");
    if (!ifNoneMatch(ifNone, computedETag)) {
      return new Response(null, createResponseHeaders({
        status: 304,
        customHeaders: {
          "Cache-Control": "public,max-age=3600,must-revalidate"
        }
      }));
    }
    return new Response(output, header({
      ext: fileExtension,
      customHeaders: {
        "etag": computedETag,
        "Cache-Control": "public,max-age=3600,must-revalidate"
      }
    }));
  }
});
