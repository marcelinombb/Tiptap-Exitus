import { Plugin } from '@editor/Plugin'

import { Tab } from './tab'

export class TabPlugin extends Plugin {
  static get pluginName() {
    return 'teclatab'
  }

  static get requires() {
    return [Tab]
  }

  init() {}
}
