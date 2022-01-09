const ELEMENT_ID = '#editor-content'

type ArrayTree = {
    parent: Node,
    childrens: Node[]
}[]

// 更改选中区域文字的内容
export function textNodeReplace(cb: (_str: string) => string) {
    const selectContent = window.getSelection()!
    let str = ''
    const parent = selectContent?.focusNode?.parentNode
    let range = window.getSelection()?.getRangeAt(0)
    let initialEndOffest = range?.endOffset!
    let focusNode = selectContent?.focusNode!
    let anchorNode = selectContent?.anchorNode!

    // 遍历树，返回在光标下的textNode
    const textNode = traversalNode(
        document.querySelector(ELEMENT_ID)!, []
    )

    let focusNodeIndex = textNode.indexOf(focusNode as Text)
    let anchorNodeIndex = textNode.indexOf(anchorNode as Text)

    let start = 0
    let inOrder = focusNodeIndex > anchorNodeIndex
    let count = selectContent?.focusOffset!

    // 光标前后元素转换
    if (focusNode !== anchorNode) {
        if (anchorNode.nodeType === 3) {
            if (selectContent.anchorOffset === 0) {
                (anchorNode as Text).replaceData(0, (anchorNode as Text).length, cb((anchorNode as Text).wholeText));
            } else {
                // 从下向上选择
                if (!inOrder) {
                    ; (anchorNode as Text).replaceData(0, selectContent.anchorOffset, cb((anchorNode as Text).wholeText.slice(0, selectContent.anchorOffset)));
                } else {
                    ; (anchorNode as Text).replaceData(selectContent.anchorOffset, (anchorNode as Text).length, cb((anchorNode as Text).wholeText.slice(selectContent.anchorOffset, (anchorNode as Text).length)));
                }
            }
            textNode.splice(
                textNode.indexOf(anchorNode as Text), 1
            )
        }

        if (focusNode.nodeType === 3) {
            // 从下向上选择
            if (!inOrder) {
                start = count
                count = (focusNode as Text).length
            }
            ; (focusNode as Text).replaceData(start, count, cb((focusNode as Text).wholeText.slice(start, count)));
            textNode.splice(
                textNode.indexOf(focusNode as Text), 1
            )
        }

        // 中间元素转换
        for (let i = 0; i < textNode.length; i++) {
            (textNode[i] as Text).replaceData(0, (textNode[i] as Text).length, cb((textNode[i] as Text).wholeText));
        }

        // 修改后 需要重新定位光标
        range?.setEnd(range?.endContainer!, initialEndOffest)
    } else {
        // 单行
        if (selectContent?.focusNode && (str = selectContent?.toString())) {
            let textNode = selectContent.focusNode as Text
            if (textNode.nodeType !== 3) {
                return
            }
            const count = Math.abs(selectContent.focusOffset - selectContent.anchorOffset)
            const start = selectContent.anchorOffset > selectContent.focusOffset
                ? selectContent.focusOffset : selectContent.anchorOffset
            textNode.replaceData(start, count, cb(str))

            // 修改后光标也需要重新定位
            range?.setStart(textNode, start)
            range?.setEnd(textNode, count + start)
        }
    }
}


// 插入元素
export function appendElement(Element: HTMLElement, padSpan = true) {
    const selectContent = window.getSelection()
    const textNode = selectContent?.anchorNode as Text

    if (!didSelectionAnchorInsideRoot()) {
        // 当光标聚焦于其他地方 将直接插入到编辑面板的最底部
        document.querySelector(ELEMENT_ID)?.appendChild(
            Element
        )
        return
    }

    if (textNode && selectContent && textNode.nodeName === '#text') {
        // 切开再添加元素
        const parent = textNode.parentElement!
        const newNode = textNode.splitText(selectContent.anchorOffset)
        parent.insertBefore(Element, newNode)

        // 是否在前后添加上空白span作为间距
        if (padSpan) {
            const span = document.createElement('span')
            span.innerHTML = '&nbsp;'
            parent.insertBefore(span, Element)
            parent.insertBefore(span.cloneNode(), newNode)
        }

        // 合并已经切开的子节点
        parent.normalize()
    } else {
        textNode.parentElement?.insertBefore(
            Element,
            textNode
        )
    }
}

// 根据光标 获取所有节点的TextNode
// TextNode需要切割 多行 单行
// 知道光标位置 进行切割
// 最后通过splitElement，切分树
// 后续把树给恢复，在光标最初始的位置 插入提取出来的TextNode
export async function removeElementFormat() {
    const selectContent = window.getSelection()!
    const anchorNode = selectContent.anchorNode!
    const focusNode = selectContent.focusNode!

    if (anchorNode === focusNode) { // 单  行
        // 位置转换
        let firstSlice = selectContent.anchorOffset
        let secondSlice = selectContent.focusOffset - firstSlice
        if (selectContent.focusOffset < selectContent.anchorOffset) {
            firstSlice = selectContent.focusOffset
            secondSlice = selectContent.anchorOffset - firstSlice
        }

        ; (anchorNode.nodeType === 3) && (anchorNode as Text)?.splitText(firstSlice).splitText(secondSlice)
    } else {
        // console.log(anchorNode, focusNode)
        // 两行 需要是节点为TextNode才进行分割
        ; (anchorNode.nodeType === 3) && (anchorNode as Text)?.splitText(selectContent.anchorOffset)
        ; (focusNode.nodeType === 3) && (focusNode as Text)?.splitText(selectContent.focusOffset)
    }

    // 遍历树，返回在光标下的textNode
    let textNode = traversalNode(
        document.querySelector(ELEMENT_ID)!, []
    )

    // 重新构建结构
    const arrayTreeCollection: {
        arrayTree: ArrayTree,
        insertNode: Node // 需要在此位置前插入元素
        initialNode: Node // 初始元素，用于后续单独插入
    }[] = []



    let db: Set<Node> = new Set() // 不需要渲染的TextNode列表
    textNode.forEach(v => {
        isInLeftSideTree(v, textNode.slice()
            .filter(_v => _v !== v)).forEach(v => db.add(v))
    })
    textNode = textNode.filter(v => !db.has(v))
    // console.log('不需要渲染的Node列表', db, '需要渲染的Node列表', textNode)

    // 构造新的元素，并删除选择中的TextNode
    for (let v of textNode) {
        const arrayTree: ArrayTree = []
        const { insertNode, disableNode } = splitElement(v, arrayTree, v, textNode.slice().filter(_v => _v !== v))
        arrayTreeCollection.push({
            arrayTree,
            insertNode,
            initialNode: v
        })
    }

    // 最后一个插入的初始元素
    let lastAppendChild: Node | null = null

    // 创建元素并插入
    arrayTreeCollection.forEach(v => {
        // 不需要渲染 已经在最顶层
        if (v.arrayTree.length === 0) {
            // console.log(v, '不需要渲染')
            return
        }
        // console.log(v, '需要渲染')
        const dom = createElementTree(v.arrayTree, db)
        document.querySelector(ELEMENT_ID)?.insertBefore(v.initialNode, v.insertNode)
        document.querySelector(ELEMENT_ID)?.insertBefore(dom, v.initialNode)
        lastAppendChild = v.initialNode
        // console.log(dom, v.insertNode)
    })

    db.forEach(v => {
        // 删除不需要渲染TextNode元素
        v.parentElement?.removeChild(v)
    })

    let _db = [...db]

    for (let i = 0; i < _db.length; i++) {
        const dom = _db[i]
        dom.parentElement?.removeChild(dom)
        // console.log(dom, '删除列')
        // 插入禁止渲染列表中的TextNode
        document.querySelector(ELEMENT_ID)?.insertBefore(dom, lastAppendChild!)
    }

    // console.log(arrayTreeCollection, '????')

    // 切片了的合并还原
    document.querySelector(ELEMENT_ID)?.normalize()
}

// 返回光标下的所有TextNode
function traversalNode(element: Node, res: Text[]) {
    element.childNodes?.forEach((v: Node) => {
        // TextNode
        if (v.nodeType === 3) {
            // 在光标下
            if (
                window.getSelection()?.containsNode(
                    v, true
                )
            ) {
                res.push(v as Text)
            }
        } else {
            traversalNode(v, res)
        }
    })
    return res
}

// 创建dom元素树
function createElementTree(arrayTree: ArrayTree, db: Set<Node>, preNode?: Node): Node {
    const childrens = arrayTree[0].childrens
    const parent = arrayTree[0].parent

    for (let i of childrens) {
        // 直接插入 不在渲染下的TextNode会根据遍历db去删除
        parent.appendChild(i)
    }

    // 需要把上一个Node给放置在最后
    if (preNode) {
        parent.appendChild(preNode)
    }

    // 出队列
    arrayTree.shift()
    if (arrayTree.length) {
        return createElementTree(arrayTree, db, parent)
    } else {
        return parent
    }
}

// 去除元素格式所用
// 用于分割树
function splitElement(element: Node, arrayTree: ArrayTree, initialElement: Node, brotherNode: Node[], disableNode: Node[] = [])
    : {
        insertNode: Node,
        disableNode: Node[]
    } {
    const childrens: Node[] = []
    let findElement = false

    // 不会出现没有父级元素的情况

    // 原始层不需要再处理
    if (element.parentElement === document.querySelector(ELEMENT_ID)) {
        return { insertNode: element, disableNode }
    }

    const parent = element.parentElement!

    parent.childNodes.forEach((v) => {
        if (v === element) {
            findElement = true
            // 初始的需要删除 但是不放入childrens
            if (v === initialElement) {
                // console.log('去除', v)
                parent.removeChild(v)
            }
        } else {
            // left tree
            if (!findElement) {
                if (brotherNode.includes(v)) {
                    disableNode.push(v)
                    // console.log(brotherNode.includes(v), '左树遍历的过程中是否包含兄弟节点？', v, brotherNode)
                }
                childrens.push(v)
                // console.log('去除', v, '左边的树收集起来')
            }
        }
    })

    arrayTree.push({
        parent: parent.cloneNode()!,
        childrens
    })

    // 单独提取删除 避免影响遍历（初始Node可以直接删除，是因为后续的循环没有任何操作了）
    childrens.forEach((v: Node) => {
        parent.removeChild(v)
    })

    return splitElement(parent, arrayTree, initialElement, brotherNode, disableNode)
}

function isInLeftSideTree(target: Node, brotherNode: Node[], res: Node[] = []): Node[] {
    const parent = target.parentNode!
    if (parent === document.querySelector(ELEMENT_ID)) {
        return res
    } else {
        let findTarget = false
        parent.childNodes.forEach((v) => {
            if (v == target) {
                findTarget = true
            } else {
                if (!findTarget) {
                    // console.log(target, '在寻找左树的', v)
                    // 左树兄弟中 || 在左树中 => 都不能渲染
                    if (brotherNode.includes(v)) {   
                        // 节点
                        res.push(v)
                    } else if (v.childNodes.length) {
                        let findDeepChildrens: Node[] = []
                        hasChildNode(v, brotherNode, findDeepChildrens)
                        findDeepChildrens.forEach(v => res.push(v))
                    }
                }
            }
        })

        return isInLeftSideTree(parent, brotherNode, res)
    }
}

// 判断树中节点有没有目标元素 向下寻找
function hasChildNode(root: Node, target: Node[], res: Node[]) {
    // console.log('正在寻找树中是否有节点', root, target)
    for (let i = 0; i < root.childNodes.length; i++) {
        const child = root.childNodes[i]
        if (target.includes(child)) {
            // console.log('寻找到：', child)
            res.push(child)
        }

        // 有节点 需要遍历
        if (child.childNodes.length) {
            hasChildNode(child, target, res)
        }
    }
}

// 判断光标是否在输入面板上
function didSelectionAnchorInsideRoot(): boolean {
    const selectContent = window.getSelection()
    if (selectContent?.anchorNode) {
        let res: Node[] = []
        hasChildNode(document.querySelector(ELEMENT_ID)!, [selectContent?.anchorNode], res)
        if (!res.length) {
            return false
        } else {
            return true
        }
    }
    return false
}