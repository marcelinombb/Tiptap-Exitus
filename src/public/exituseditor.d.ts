interface Config {
  [key: string]: unknown
  initialHeight?: number
}

declare class Plugin {
  static get pluginName(): string
  [key: string]: (...args: unknown[]) => unknown
}

export interface ExitusEditorOptions {
  container: Element
  content: string
  editable: boolean
  toolbarOrder: string[]
  config: Config
}

export interface Commands {
  setContent: (html: string) => void
  addColarQuestao: (name: string) => void
}

export type PluginClassConstructor = typeof Plugin

declare class ExitusEditor {
  isEditable: boolean
  isEmpty: boolean
  constructor(options?: Partial<ExitusEditorOptions>)
  on(evt: string, callback: ({ editor }: { editor: ExitusEditor }) => void): void
  getHTML(): string
  getJson(): string
  setEditable(editable: boolean): void
  getPluginInstance(name: string): Plugin
  destroy(): void
  commands: Commands
}

export default ExitusEditor
