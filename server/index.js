const getIPv4AddressList = require('../dist/utils').getIPv4AddressList

const createServe = require("../dist/server").default
let port = 3001
const server = createServe().listen(port)

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.log(`Port ${port}被占用，尝试使用使用其他端口`)
        setTimeout(() => {
            server.close()
            server.listen(++port)
        }, 100)
    } else {
        console.error(e)
    }
})

server.on('listening', () => {
    console.log(`服务开启：`)
    getIPv4AddressList().forEach((ip) => {
        console.log(`  > http://${ip}:${port}`)
    })
    console.log(' ')
})