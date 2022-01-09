<script lang="ts">
import { defineComponent, ref } from 'vue'
import Upload, { uploadFile } from './components/Upload.vue'
import { textNodeReplace, appendElement, removeElementFormat } from './util'

// static code
async function parsePaste(e: ClipboardEvent) {
  e.preventDefault()
  // return

  const itemsLength = e.clipboardData!.items.length
  // console.log('黏贴内容item数量：', itemsLength)

  // 倒序
  for (let i = itemsLength - 1; i >= 0; i--) {
    const item = e.clipboardData!.items[i]
    // 标签内容
    if (item.kind === 'string' && item.type === 'text/html') {
      item.getAsString((data) => {
        const dom = document.createElement('span')
        dom.innerHTML = data
        appendElement(dom, false)
      })
    }

    if (item.kind === 'file' && /^image.*/.test(item.type)) {
      console.log(item.getAsFile())
      await uploadFile([item.getAsFile()!]) // 自动植入
    }
  }
}

// static code
const eidtorFeatures = [
  {
    callback() {
      removeElementFormat()
    },
    desc: '格式清空'
  },
  {
    callback() {
      textNodeReplace((str) => (str || '').toUpperCase())
    },
    desc: '大写转换'
  },
  {
    callback() {
      textNodeReplace((str) => (str || '').toLowerCase())
    },
    desc: '小写转换'
  },
  {
    callback() {
      // 创建元素
      const htmlAnchorElemnt = document.createElement('a')
      htmlAnchorElemnt.setAttribute('href', 'qq.mail.com')
      htmlAnchorElemnt.innerText = '超链接'

      appendElement(htmlAnchorElemnt)
    },
    desc: '添加链接'
  },
  {
    callback() {
      // 创建元素
      const htmlAnchorElemnt = document.createElement('table')
      htmlAnchorElemnt.setAttribute('border', '1')
      htmlAnchorElemnt.innerHTML =
        ` <tr>
                   <th>Foo</th>
                   <th>Savings</th>
                </tr>
                <tr>
                   <td>January</td>
                   <td>hello</td>
                </tr>`
      appendElement(htmlAnchorElemnt)
    },
    desc: '添加表格'
  },
]

// static
function drop(e: DragEvent) {
  e.dataTransfer &&
    e.dataTransfer!.files.length > 0 &&
    uploadFile(Array.from(e.dataTransfer!.files))
}

export default defineComponent({
  name: 'Editor',
  components: {
    Upload
  },
  props: {
    msg: String
  },
  setup() {
    return {
      parsePaste,
      eidtorFeatures,
      drop
    }
  }
})
</script>

<template>
  <div class="editor">
    <div class="feature">
      <h5
        @mousedown="(e) => e && e.preventDefault()"
        v-for="(li, index) in eidtorFeatures"
        :key="index"
        @click="li.callback"
      >{{ li.desc }}</h5>
      <Upload />
    </div>
    <div id="editor-content" contenteditable @paste="parsePaste" @drop="drop">
      {{ msg }}123456abc
      <div>
        23
        <div>
          9899abccc
          <div>-</div>
        </div>3abcc
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.feature {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  > h5 {
    margin: 5px 12px;
    cursor: pointer;
    min-width: max-content;
  }
}

#editor-content {
  padding: 5px 10px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  text-align: left;
  flex-grow: 1;
}
</style>
