import './style.css'
import { Plugin } from '@editor/Plugin'
import { getHTMLFromFragment } from '@editor/utils'

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
    const nodes: Record<string, string> = {}

    this.editor.$nodes(ColarQuestaoPlugin.pluginName)?.forEach(n => {
      nodes[n.attributes.title] = getHTMLFromFragment(n.content, this.editor.schema)
    })

    return nodes
  }
}
