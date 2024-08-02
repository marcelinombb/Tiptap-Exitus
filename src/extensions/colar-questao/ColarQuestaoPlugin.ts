import './style.css'
import { Plugin } from '@editor/Plugin'
import { DOMSerializer, type Node } from '@tiptap/pm/model'

import { ColarQuestao } from './colar-questao'

export class ColarQuestaoPlugin extends Plugin {
  static get pluginName(): string {
    return 'colarQuestao'
  }

  static get requires() {
    return [ColarQuestao]
  }

  init() {}

  getColarQuestao() {
    const nodes: { [key: string]: string } = {}
    const nodeType = 'colarQuestao'

    const traverse = (node: Node) => {
      if (node.type.name === nodeType) {
        nodes[node.attrs.title] = this.getNodeHTML(node)
      }

      node.forEach(child => {
        traverse(child)
      })
    }
    traverse(this.editor.state.doc)
    return nodes
  }

  getNodeHTML(node: Node) {
    let nodeHTML = ''

    const schema = this.editor.schema
    const fragment = schema.nodeFromJSON(node.toJSON())
    const div = document.createElement('div')
    const serializer = DOMSerializer.fromSchema(schema)
    const dom = serializer.serializeFragment(fragment.content)
    div.appendChild(dom)
    nodeHTML = div.innerHTML

    return nodeHTML
  }
}
