import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { JSDOM } from 'jsdom'
import { json, urlencoded } from 'express';

import { AbortController } from "node-abort-controller";

const navigator = require("navigator");
global.navigator = navigator;
global.abortController = new AbortController();
const dom = new JSDOM(`<!DOCTYPE html><div class="render-katex"></div>`);
global.window = dom.window;
global.document = dom.window.document;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.HTMLVideoElement = dom.window.HTMLVideoElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.HTMLElement = dom.window.Node;
global.Text = dom.window.Text;

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.use(json({limit:'50mb'}));
  app.use(urlencoded({extended:true,limit:'50mb'}));
  await app.listen(Number(process.env.LOCAL_PORT || 4000), process.env.LOCAL_HOST || '0.0.0.0');

  const server = app.getHttpServer();
  console.log(await app.getUrl());
  const router = server._events.request._router;

  const availableRoutes: [] = router.stack
    .map(layer => {
      if (layer.route) {
        return {
          route: {
            path: layer.route?.path,
            method: layer.route?.stack[0].method,
          },
        };
      }
    })
    .filter(item => item !== undefined);
    console.log(availableRoutes);
}
bootstrap();
