import http from 'http'
import Koa from 'koa'
import koaBody from 'koa-body'
import koaStatic from 'koa-static'
import corsPlugin from './plugins/corsPlugin'
import uploadPlugin from './plugins/uploadPlugin'
import path from 'path'

export interface PluginContext {
    app: Koa
}

export default function createServe() {
    const app = new Koa()
    app.use(koaBody({
        multipart: true,
        formidable: {
            maxFileSize: 200 * 1024 * 1024  // 2M
        }
    }));
    app.use(koaStatic(
        path.join(process.cwd(), './userAssets')
    ))
    const server = http.createServer(app.callback())
        ;[
            corsPlugin,
            uploadPlugin
        ].forEach(m => m({
            app
        }))
    return server
}