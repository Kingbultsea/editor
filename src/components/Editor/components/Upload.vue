<script lang="ts">
import { defineComponent } from 'vue'
import request from '@request/api'
import { appendElement } from '../util'
import { countFileHash } from '@utils/index'

// 本组件功能 不进行封装
export async function uploadFile(files: File[], autoAppend = true): Promise<Element[]> {
    {
        let params = new FormData()
        let appendImageDoms: Element[] = []

        for (let i of files) {
            const fileHash = await countFileHash(i, (progress) => {
                // todo 进度条
                console.log(`hash(${i.name})` + progress + '%')
            })

            params.append('hash', fileHash)
            params.append('file', i)
        }

        let config = {
            headers: { 'Content-Type': 'multipart/form-data' }
        }
        await request.post('post-formdata', params, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then((res) => {
            // 服务端饭回图片地址，创建元素并插入到光标中
            if (res.status === 200 && res.data) {
                for (let i = 0; i < res.data.length; i++) {
                    const imgElement = document.createElement('img')
                    console.log(import.meta.env.VITE_HOST)
                    imgElement.style.width = '10rem'
                    imgElement.src = import.meta.env.VITE_HOST + '/' + res.data[i]
                    if (autoAppend) {
                        appendElement(imgElement)
                    } else {
                        appendImageDoms.push(imgElement)
                    }
                }
            }
            // appendElement
        })

        return appendImageDoms
    }
}

export default defineComponent({
    name: 'Upload',
    setup() {
        return {
            upload: (e: Event) => {
                uploadFile(Array.from((e.target as any).files))
            }
        }
    }
})
</script>

<template>
    <h5 class="h5-upload">
        插入图片(多图)
        <input
            @mousedown="(e) => e && e.preventDefault()"
            name="file"
            type="file"
            accept="image/png, image/gif, image/jpeg"
            @change="upload"
            multiple
        />
    </h5>
</template>

<style scoped>
/*a  upload */
.h5-upload {
    position: relative;
    cursor: pointer;
    overflow: hidden;
}

.h5-upload input {
    position: absolute;
    font-size: 100px;
    right: 0;
    top: 0;
    opacity: 0;
    filter: alpha(opacity=0);
    cursor: pointer;
}
</style>
