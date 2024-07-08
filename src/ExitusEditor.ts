import { type Plugin } from '@editor/Plugin'
import { Toolbar } from '@editor/toolbar'
import { createHTMLElement } from '@editor/utils'
import { type AnyExtension, Editor, type EditorOptions } from '@tiptap/core'
interface Config {
  [key: string]: any
}

export interface ExitusEditorOptions extends EditorOptions {
  container: Element
  toolbarOrder: string[]
  config: Config
}

export type PluginClassConstructor = typeof Plugin

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

class ExitusEditor extends Editor {
  editorInstance: string
  toolbar: Toolbar
  toolbarItemsDiv!: HTMLDivElement
  editorMainDiv!: HTMLDivElement
  private pluginsInstances = new Map<string, Plugin>()
  static extensions: AnyExtension[]
  static plugins: PluginClassConstructor[]
  static toolbarOrder: string[]

  constructor(options: Partial<ExitusEditorOptions> = {}) {
    const ext = ExitusEditor.plugins.reduce<AnyExtension[]>((acc, plugin) => {
      return [...acc, ...plugin.requires]
    }, [])

    super({ ...options, extensions: ext })
    this.editorInstance = generateUUID()

    const toolbarOrder: string[] = [...ExitusEditor.toolbarOrder, ...(options.toolbarOrder ?? [])]

    this.toolbar = new Toolbar(this, toolbarOrder)

    ExitusEditor.plugins.forEach(plugin => {
      const pluginInstance = new plugin(this)
      pluginInstance.init()
      this.pluginsInstances.set(plugin.pluginName, pluginInstance)
    })

    this._createUI(options.container as Element)
  }

  getPluginInstance(name: string) {
    return this.pluginsInstances.get(name)
  }

  private _generateEditorUI() {
    const toolbarItemsDiv = this.toolbar.render()
    const toolbarEditor = createHTMLElement('div', { class: 'ex-toolbar-editor' }, [toolbarItemsDiv])

    const editorMain = this.options.element
    editorMain.className = 'editor-main'
    editorMain.setAttribute('spellcheck', 'false')
    editorMain.setAttribute('id', generateUUID())
    this.editorMainDiv = editorMain as HTMLDivElement

    const editorScroller = createHTMLElement('div', { class: 'editor-scroller' }, [editorMain])

    const editorShell = createHTMLElement('div', { class: 'editor-shell' }, [toolbarEditor, editorScroller])

    this.toolbarItemsDiv = toolbarItemsDiv

    return editorShell
  }

  private _createUI(container: Element) {
    const editorUI = this._generateEditorUI()
    container.appendChild(editorUI)
  }

  destroy(): void {
    this.pluginsInstances.forEach(plugin => plugin.destroy())
    this.pluginsInstances.clear()
    super.destroy()
  }
}

export default ExitusEditor
