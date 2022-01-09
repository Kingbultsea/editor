import { PluginContext } from '../server'

export default function corsPlugin({ app }: PluginContext) {
    app.use(async (ctx, next) => {
        if (ctx.method === 'OPTIONS') {
            ctx.set('Access-Control-Allow-Origin', "*")
            ctx.set('Access-Control-Allow-Headers', '*')
            ctx.set('Access-Control-Allow-Credentials', 'true')
            ctx.set("Access-Control-Max-Age", "1728000")
        }
        await next()
    })
}