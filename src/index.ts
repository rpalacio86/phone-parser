import { argv, exit } from 'process';
import App from './app';

const rootPath = argv[2];
const app = new App(rootPath);

try {
  app.run();
} catch (err) {
  console.error('Error', err);
  exit(1);
}
