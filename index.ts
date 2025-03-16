import homepage from './src/index.html';
import qrscanner from './src/qrscanner.html';
import qrgenerator from './src/qrgenerator.html';
import header from './header.ts';

const server = Bun.serve({
  routes: {
    '/': homepage,
    '/qrscanner': qrscanner,
    '/qrgenerator': qrgenerator
  },
  development: false,
  fetch: async (req: Request) => {
    const pathname = new URL(req.url).pathname;
    const file = await Bun.file(`${Bun.cwd}/${pathname}`)
    const ext = pathname.split('.').pop();
    if (!(await file.exists())) {
      return new Response('Archivo no encontrado', header({status: 404}));
    }
    return new Response(file, header({ext: ext}))
  }
});
