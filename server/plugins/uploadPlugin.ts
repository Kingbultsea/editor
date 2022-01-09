import { PluginContext } from '../server'
import fs from 'fs'
import path from 'path'

const userAssets = fs.readdirSync(path.join(
    process.cwd(),
    './userAssets'
))
export default function uploadPlugin({ app }: PluginContext) {
    app.use(async (ctx, next) => {
        ctx.set('Access-Control-Allow-Origin', "*")
        if (ctx.path === '/post-formdata') {
            let files = undefined
            let hash: string[] | undefined = undefined

            if ((files = ctx.request.files?.file) && (hash = ctx.request.body?.hash)) {
                if (!Array.isArray(hash)) {
                    hash = [hash]
                }

                if (!Array.isArray(files)) {
                    files = [files]
                }

                files = files.map((file, index) => {
                    return new Promise((resolve) => {

                        // if hash undefinded
                        if (!hash![index]) {
                            return resolve(undefined)
                        }
                        const fileName = hash![index] + file.name!.replace(/.*\./, '.')
                        const filePath = path.join(
                            process.cwd(),
                            `./userAssets/${fileName}`
                        )

                        // is in cache
                        if (userAssets.includes(fileName)) {
                            console.log(`文件已在仓库中: ${filePath}`)
                            return resolve(fileName)
                        } else {
                            userAssets.push(fileName)
                        }
                        
                        const reader = fs.createReadStream(file.path)
                        const upStream = fs.createWriteStream(
                            filePath
                        )
                        
                        reader.pipe(upStream)
                        upStream.on('close', () => {
                            console.log(`上传文件：${filePath}`)
                            resolve(fileName)
                        })
                    })
                })

                await Promise.all(files).then((res) => {
                    ctx.body = res;
                    ctx.status = 200
                })
            }
        }
        await next()
    })
}