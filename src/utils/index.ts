import sparkMD5, { ArrayBuffer } from 'spark-md5'

// 切片，计算文件hash值
export function countFileHash(file: any, progressCb: (_number: number) => void): Promise<string> {
    const chunks: any[] = []
    let cur_i = 0
    const size = 1024 * 512  // 0.5mb

    // 根据长度，预估文件切块大小
    while (cur_i < file.size) {
        chunks.push({
            index: cur_i,
            file: file.slice(
                cur_i, cur_i + size
            )
        })
        cur_i += size
    }

    return new Promise((resolve) => {
        const spark = new sparkMD5.ArrayBuffer()
        let count = 0

        // 读取内容后，丢进spark-md5 部分hash
        const appendToSpark = async (file: any) => {
            return new Promise(resolve => {
                const reader = new FileReader()
                reader.readAsArrayBuffer(file)
                reader.onload = e => {
                    spark.append(e.target!.result as any)
                    resolve(void 0)
                }
            })
        }

        // fiber
        const workLoop: IdleRequestCallback = async deadline => {
            // deadline.timeRemaining => 当前闲置周期的预估剩余毫秒数
            while (count < chunks.length && deadline.timeRemaining() > 1) {
                await appendToSpark(chunks[count].file)
                count++
                if (count < chunks.length) {
                    progressCb(
                        Number(
                            (100 * (count / chunks.length)).toFixed(2)
                        )
                    )
                } else {
                    progressCb(100)

                    // hash结束
                    resolve(spark.end())
                }
            }
            window.requestIdleCallback(workLoop)
        }
        window.requestIdleCallback(workLoop)
    })
}
