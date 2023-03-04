import { WsAdapter } from '@nestjs/platform-ws'

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as session from 'express-session'
import * as passport from 'passport'
import { type NestExpressApplication } from '@nestjs/platform-express'
import * as cookieParser from 'cookie-parser'
import { Response } from 'express';

async function bootstrap () {
  const logger = new Logger()
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const port = process.env.BACK_PORT!
  const cors = {
    origin: ['http://localhost:80', 'http://localhost', '*'],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: ['Accept', 'Content-Type', 'Authorization']
  }
  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: process.env.JWT_SECRET!
    })
  )
  app.use(cookieParser())
  app.use(passport.initialize())
  app.use(passport.session())
  app.enableCors(cors)
  app.useWebSocketAdapter(new WsAdapter(app))
    await app.listen(port)
    logger.log(`Application listening on port ${port}`)
}
bootstrap()
