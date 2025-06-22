import { Plugin } from '@editor/Plugin'
import { BrazilianPortugueseSpellcheck } from './PortugueseEspellChecker'
import './style.css'

export class EspellCheckerPlugin extends Plugin {
  static get requires() {
    return [BrazilianPortugueseSpellcheck]
  }

  static get pluginName() {
    return 'espellChecker'
  }

  init() {
    BrazilianPortugueseSpellcheck.configure({
      defaultDictionaryUrl: './dictionaries/pt_BR.dic',
      defaultAffixUrl: './dictionaries/pt_BR.aff',
      autoLoadDictionary: true,
    })
  }
}
