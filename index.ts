import homepage from './src/index.html';
import qrscanner from './src/qrscanner.html';
import qrgenerator from './src/qrgenerator.html';

const server = Bun.serve({
  port: process.env.PORT || 4321,
  routes: {
    '/': homepage,
    '/qrscanner': qrscanner,
    '/qrgenerator': qrgenerator
  },
  development: false
});
