import type ExitusEditor from '@src/ExitusEditor'
import { type AnyExtension } from '@tiptap/core'

export class Plugin {
  config: Record<string, string>
  constructor(
    readonly editor: ExitusEditor,
    config: Record<string, string>
  ) {
    this.config = config
  }
  init(): void {
    throw new Error('init must be implemented in the derived class')
  }
  destroy(): void {}
  static get pluginName(): string {
    throw new Error('pluginName must be implemented in the derived class')
  }
  static get requires(): AnyExtension[] {
    return []
  }
}
