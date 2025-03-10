import express, { Application } from 'express';
import { json } from 'body-parser';
import router from './routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }

  private config(): void {
    this.app.use(json());
  }

  private routes(): void {
    this.app.use(router);
  }
}

export default new App().app;