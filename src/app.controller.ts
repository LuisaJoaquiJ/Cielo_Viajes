import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async getHealth() {
    const health = await this.appService.getHealth();

    return `
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Health Check</title>
          <style>
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              background: #f4f7fb;
              color: #14213d;
            }
            main {
              max-width: 680px;
              margin: 48px auto;
              background: #ffffff;
              border-radius: 16px;
              padding: 32px;
              box-shadow: 0 10px 30px rgba(20, 33, 61, 0.08);
            }
            h1 {
              margin-top: 0;
            }
            .ok {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 999px;
              background: #d8f3dc;
              color: #1b4332;
              font-weight: 700;
            }
            dl {
              margin: 24px 0 0;
            }
            dt {
              font-weight: 700;
              margin-top: 12px;
            }
            dd {
              margin: 4px 0 0;
            }
            a {
              color: #0b6e4f;
            }
          </style>
        </head>
        <body>
          <main>
            <span class="ok">OK</span>
            <h1>Conexion activa</h1>
            <dl>
              <dt>Base de datos</dt>
              <dd>${health.database}</dd>
              <dt>Hora del servidor</dt>
              <dd>${health.serverTime}</dd>
            </dl>
            <p>
              Ver respuesta JSON:
              <a href="/health.json">/health.json</a>
            </p>
          </main>
        </body>
      </html>
    `;
  }

  @Get('health.json')
  getHealthJson() {
    return this.appService.getHealth();
  }
}
