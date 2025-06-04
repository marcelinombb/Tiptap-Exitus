import { EventBus } from '@editor/EventBus'
import { type Plugin } from '@editor/Plugin'
import { Toolbar } from '@editor/toolbar'
import { createHTMLElement, getHTMLFromFragment } from '@editor/utils'
import { type AnyExtension, Editor, type EditorOptions } from '@tiptap/core'
interface Config {
  [key: string]: any
  initialHeight?: number
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

function loadPluginsRequirements(options: Partial<ExitusEditorOptions>) {
  const plugins = ExitusEditor.plugins.reduce<AnyExtension[]>((acc, plugin) => {
    const requirements = plugin.requires.map(p => {
      if (plugin.pluginName === p.name) {
        if (options.config?.[plugin.pluginName]) {
          return p.configure(options.config?.[plugin.pluginName])
        }
      }

      return p
    })

    return [...acc, ...requirements]
  }, [])

  return plugins
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
  private container: Element
  private config?: Config
  private _eventBus: EventBus
  constructor(options: Partial<ExitusEditorOptions>) {
    if (!options.container) {
      throw new Error('Invalid Container Element !!')
    }

    const extensions = loadPluginsRequirements(options)

    super({ ...options, extensions })
    this._eventBus = new EventBus()

    this.config = options.config
    this.editorInstance = generateUUID()

    const toolbarOrder: string[] = [...ExitusEditor.toolbarOrder, ...(options.toolbarOrder ?? [])]

    this.toolbar = new Toolbar(this, toolbarOrder)

    this.initializePlugins(options)

    this.container = options.container as Element

    this._createUI()
  }

  private initializePlugins(options: Partial<ExitusEditorOptions>) {
    ExitusEditor.plugins.forEach(plugin => {
      const config = options.config?.[plugin.pluginName]
      const pluginInstance = new plugin(this, config)
      pluginInstance.init()
      const tool = pluginInstance.tool()
      if (tool) {
        this.toolbar.setTool(plugin.pluginName, tool)
      }
      this.pluginsInstances.set(plugin.pluginName, pluginInstance)
    })
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

    const initialHeight = this.config && this.config?.initialHeight

    const editorScroller = createHTMLElement('div', { class: 'editor-scroller', style: initialHeight ? `height: ${initialHeight}px` : '' }, [
      editorMain
    ])

    const editorShell = createHTMLElement('div', { class: 'editor-shell' }, [toolbarEditor, editorScroller])

    this.toolbarItemsDiv = toolbarItemsDiv

    return editorShell
  }

  public getHTML(): string {
    return getHTMLFromFragment(this.state.doc.content, this.schema)
  }

  get eventBus() {
    return this._eventBus
  }

  private _createUI() {
    const editorUI = this._generateEditorUI()
    this.container.appendChild(editorUI)
  }

  destroy(): void {
    this.pluginsInstances.forEach(plugin => plugin.destroy())
    this.pluginsInstances.clear()
    super.destroy()
    this.container.innerHTML = ''
  }
}

export default ExitusEditor
