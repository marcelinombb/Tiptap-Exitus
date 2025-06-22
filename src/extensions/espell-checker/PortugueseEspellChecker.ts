// @ts-nocheck
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

// Hunspell-compatible Portuguese spell checker
class HunspellPortugueseSpellChecker {
  constructor(customDictionary = []) {
    this.dictionary = new Set()
    this.affixRules = new Map()
    this.customDictionary = new Set(customDictionary.map(word => word.toLowerCase()))
    this.cache = new Map()
    this.isLoaded = false
    this.loadingPromise = null
    this.fallbackWords = this.getFallbackDictionary()
  }

  // Fallback dictionary for immediate use while loading
  getFallbackDictionary() {
    return new Set([
      'a',
      'o',
      'e',
      'de',
      'que',
      'não',
      'um',
      'uma',
      'para',
      'com',
      'ser',
      'ter',
      'estar',
      'fazer',
      'ir',
      'ver',
      'dar',
      'saber',
      'poder',
      'dever',
      'querer',
      'falar',
      'dizer',
      'brasil',
      'brasileiro',
      'brasileira',
      'português',
      'portuguesa',
      'casa',
      'trabalho',
      'escola',
      'cidade',
      'país',
      'mundo',
      'pessoa',
      'tempo',
      'ano',
      'dia',
      'vida',
      'amor'
    ])
  }

  // Load LibreOffice/Hunspell dictionary files
  async loadHunspellDictionary(dicPath, affPath = null) {
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    this.loadingPromise = this._loadDictionaryFiles(dicPath, affPath)
    return this.loadingPromise
  }

  async _loadDictionaryFiles(dicPath, affPath) {
    try {
      console.log('Loading Hunspell dictionary...')

      // Load .dic file (word list)
      const dicResponse = await fetch(dicPath)
      if (!dicResponse.ok) {
        throw new Error(`Failed to load dictionary: ${dicResponse.status}`)
      }
      const dicText = await dicResponse.text()

      // Load .aff file (affix rules) if provided
      let affText = ''
      if (affPath) {
        try {
          const affResponse = await fetch(affPath)
          if (affResponse.ok) {
            affText = await affResponse.text()
          }
        } catch (e) {
          console.warn('Could not load affix file:', e.message)
        }
      }

      await this.parseDictionaryFiles(dicText, affText)
      this.isLoaded = true
      console.log(`Loaded ${this.dictionary.size} words from Hunspell dictionary`)
    } catch (error) {
      console.error('Failed to load Hunspell dictionary:', error)
      console.log('Using fallback dictionary')
      this.dictionary = new Set(this.fallbackWords)
      this.isLoaded = true
    }
  }

  async parseDictionaryFiles(dicText, affText) {
    // Parse affix rules first
    if (affText) {
      this.parseAffixFile(affText)
    }

    // Parse dictionary
    const lines = dicText.split('\n')
    const wordCount = parseInt(lines[0]) || 0

    for (let i = 1; i < lines.length && i <= wordCount; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const [word, flags] = line.split('/')
      if (word) {
        this.dictionary.add(word.toLowerCase())

        // Generate word variants using affix rules
        if (flags) {
          const variants = this.generateWordVariants(word, flags)
          variants.forEach(variant => this.dictionary.add(variant.toLowerCase()))
        }
      }
    }
  }

  parseAffixFile(affText) {
    const lines = affText.split('\n')
    let currentRule = null

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      // Parse suffix rules (SFX)
      if (trimmed.startsWith('SFX ')) {
        const parts = trimmed.split(/\s+/)
        if (parts.length >= 4) {
          const flag = parts[1]
          const crossProduct = parts[2] === 'Y'
          const count = parseInt(parts[3])

          if (!this.affixRules.has(flag)) {
            this.affixRules.set(flag, { type: 'suffix', rules: [], crossProduct })
          }
          currentRule = this.affixRules.get(flag)
        }
      }
      // Parse prefix rules (PFX)
      else if (trimmed.startsWith('PFX ')) {
        const parts = trimmed.split(/\s+/)
        if (parts.length >= 4) {
          const flag = parts[1]
          const crossProduct = parts[2] === 'Y'
          const count = parseInt(parts[3])

          if (!this.affixRules.has(flag)) {
            this.affixRules.set(flag, { type: 'prefix', rules: [], crossProduct })
          }
          currentRule = this.affixRules.get(flag)
        }
      }
      // Parse individual affix rules
      else if (currentRule && trimmed.match(/^[A-Z]+\s+/)) {
        const parts = trimmed.split(/\s+/)
        if (parts.length >= 4) {
          const flag = parts[0]
          const strip = parts[1] === '0' ? '' : parts[1]
          const add = parts[2] === '0' ? '' : parts[2]
          const condition = parts[3] || '.'

          currentRule.rules.push({ strip, add, condition })
        }
      }
    }
  }

  generateWordVariants(word, flags) {
    const variants = []
    const flagArray = flags.split('')

    for (const flag of flagArray) {
      const rule = this.affixRules.get(flag)
      if (!rule) continue

      for (const affixRule of rule.rules) {
        let variant = word

        if (rule.type === 'suffix') {
          // Remove suffix if needed
          if (affixRule.strip && word.endsWith(affixRule.strip)) {
            variant = word.slice(0, -affixRule.strip.length)
          }
          // Add new suffix
          if (affixRule.add) {
            variant += affixRule.add
          }
        } else if (rule.type === 'prefix') {
          // Remove prefix if needed
          if (affixRule.strip && word.startsWith(affixRule.strip)) {
            variant = word.slice(affixRule.strip.length)
          }
          // Add new prefix
          if (affixRule.add) {
            variant = affixRule.add + variant
          }
        }

        if (variant !== word && variant.length > 1) {
          variants.push(variant)
        }
      }
    }

    return variants
  }

  // Load from URL or file input
  async loadFromUrl(dictionaryUrl, affixUrl = null) {
    return this.loadHunspellDictionary(dictionaryUrl, affixUrl)
  }

  // Load from file input element
  async loadFromFiles(dicFile, affFile = null) {
    try {
      const dicText = await this.readFileAsText(dicFile)
      let affText = ''

      if (affFile) {
        affText = await this.readFileAsText(affFile)
      }

      await this.parseDictionaryFiles(dicText, affText)
      this.isLoaded = true
      console.log(`Loaded ${this.dictionary.size} words from uploaded files`)
    } catch (error) {
      console.error('Failed to load dictionary files:', error)
      throw error
    }
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsText(file, 'utf-8')
    })
  }

  addToCustomDictionary(word) {
    this.customDictionary.add(word.toLowerCase())
    this.cache.clear()
  }

  removeFromCustomDictionary(word) {
    this.customDictionary.delete(word.toLowerCase())
    this.cache.clear()
  }

  isCorrect(word) {
    console.log(`Checking word: "${word}"`)
    const lowerWord = word.toLowerCase()

    // Check cache first
    if (this.cache.has(lowerWord)) {
      return this.cache.get(lowerWord)
    }

    let result = false

    // Skip numbers and very short words
    if (/^\d+$/.test(word) || word.length < 2) {
      result = true
    }
    // Check custom dictionary
    else if (this.customDictionary.has(lowerWord)) {
      result = true
    }
    // Check main dictionary
    else if (this.dictionary.has(lowerWord)) {
      result = true
    }
    // Check without accents
    else if (this.dictionary.has(this.removeAccents(lowerWord))) {
      result = true
    }
    // If not loaded yet, use fallback
    else if (!this.isLoaded && this.fallbackWords.has(lowerWord)) {
      result = true
    }
    // Check for obvious typos
    else if (this.hasObviousErrors(word)) {
      result = false
    }
    // Default to correct for unknown words (conservative approach)
    else {
      result = !this.isLoaded || this.dictionary.size < 1000 // Only mark as incorrect if we have a good dictionary
    }

    // Cache the result
    this.cache.set(lowerWord, result)
    console.log(`Checking word: "${word}"`, result)
    return result
  }

  removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  hasObviousErrors(word) {
    // Repeated characters (more than 2 in a row)
    if (/(.)\1{2,}/.test(word)) return true

    // Mixed scripts
    if (/[^\p{Script=Latin}\p{N}\p{P}\p{Z}]/u.test(word)) return true

    // Too many consonants
    if (/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{5,}/.test(word)) return true

    // Extremely long words
    if (word.length > 30) return true

    return false
  }

  getSuggestions(word) {
    const suggestions = []
    const lowerWord = word.toLowerCase()
    const maxSuggestions = 8

    // Find similar words using edit distance
    const candidates = Array.from(this.dictionary)
      .filter(dictWord => Math.abs(dictWord.length - lowerWord.length) <= 3)
      .map(dictWord => ({
        word: dictWord,
        distance: this.getEditDistance(lowerWord, dictWord)
      }))
      .filter(item => item.distance <= 3)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxSuggestions)
      .map(item => item.word)

    return candidates
  }

  getEditDistance(str1, str2) {
    const matrix = []
    const len1 = str1.length
    const len2 = str2.length

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        }
      }
    }

    return matrix[len2][len1]
  }

  getLoadingStatus() {
    return {
      isLoaded: this.isLoaded,
      wordCount: this.dictionary.size,
      affixRuleCount: this.affixRules.size
    }
  }
}

export const BrazilianPortugueseSpellcheck = Extension.create({
  name: 'brazilianPortugueseSpellcheck',

  addOptions() {
    return {
      enabled: true,
      language: 'pt-BR',
      errorClass: 'spellcheck-error',
      debounceDelay: 300,
      customDictionary: [],
      useBrowserSpellcheck: false,
      showSuggestions: true,
      maxSuggestions: 5,
      // Hunspell dictionary options
      dictionaryUrl: null, // URL to .dic file
      affixUrl: null, // URL to .aff file (optional)
      autoLoadDictionary: true,
      // Default LibreOffice URLs (you need to host these files)
      defaultDictionaryUrl: './dictionaries/pt_BR.dic',
      defaultAffixUrl: './dictionaries/pt_BR.aff'
    }
  },

  addStorage() {
    return {
      spellChecker: null // Instance of HunspellPortugueseSpellChecker
    }
  },

  /* onCreate() {
    this.storage.spellChecker = new HunspellPortugueseSpellChecker(this.options.customDictionary)

    // Auto-load dictionary if URLs provided
    if (this.options.autoLoadDictionary) {
      const dicUrl = this.options.dictionaryUrl || this.options.defaultDictionaryUrl
      const affUrl = this.options.affixUrl || this.options.defaultAffixUrl

      if (dicUrl) {
        this.storage.spellChecker.loadFromUrl(dicUrl, affUrl).catch(error => {
          console.warn('Failed to auto-load dictionary:', error)
        })
      }
    }
  }, */

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          spellcheck: {
            default: null,
            parseHTML: element => element.getAttribute('spellcheck'),
            renderHTML: attributes => {
              if (!attributes.spellcheck) {
                return {}
              }
              return {
                spellcheck: attributes.spellcheck
              }
            }
          }
        }
      }
    ]
  },

  addProseMirrorPlugins() {
    const options = this.options

    this.storage.spellChecker = new HunspellPortugueseSpellChecker(this.options.customDictionary)

    // Auto-load dictionary if URLs provided
    if (this.options.autoLoadDictionary) {
      const dicUrl = this.options.dictionaryUrl || this.options.defaultDictionaryUrl
      const affUrl = this.options.affixUrl || this.options.defaultAffixUrl

      if (dicUrl) {
        this.storage.spellChecker.loadFromUrl(dicUrl, affUrl).catch(error => {
          console.warn('Failed to auto-load dictionary:', error)
        })
      }
    }

    const spellChecker = this.storage.spellChecker

    return [
      new Plugin({
        key: new PluginKey('brazilianPortugueseSpellcheck'),

        state: {
          init() {
            return {
              decorations: DecorationSet.empty,
              timeoutId: null
            }
          },

          apply(tr, pluginState, oldState, newState) {
            if (!options.enabled) {
              return { decorations: DecorationSet.empty, timeoutId: null }
            }

            // Clear existing timeout
            if (pluginState.timeoutId) {
              clearTimeout(pluginState.timeoutId)
            }

            // Handle meta updates
            const meta = tr.getMeta(this.key)
            if (meta?.decorations) {
              return {
                decorations: meta.decorations,
                timeoutId: pluginState.timeoutId
              }
            }

            // If document hasn't changed, keep existing decorations
            if (tr.docChanged) {
              if (spellChecker) {
                const decorations = createSpellcheckDecorations(tr.doc, options, spellChecker)
                /*  view.dispatch(
                    view.state.tr.setMeta(this.key, { decorations })
                  ) */
                return {
                  decorations,
                  timeoutId: pluginState.timeoutId
                }
              }
            }

            // Set up debounced spellcheck
            /*  const timeoutId = setTimeout(() => {
              if (spellChecker) {
                decorations = createSpellcheckDecorations(tr.doc, options, spellChecker)
                console.log(decorations)
              }
            }, options.debounceDelay) */

            return pluginState
          }
        },

        props: {
          decorations(state) {
            return this.getState(state)?.decorations || DecorationSet.empty
          },

          attributes: {
            spellcheck: options.useBrowserSpellcheck ? 'true' : 'false',
            lang: options.language
          },

          handleClick(view, pos, event) {
            if (!options.showSuggestions) return false

            const decorations = this.getState(view.state)?.decorations

            if (!decorations) return false

            const decoration = decorations.find(pos, pos + 1)[0]
            if (!decoration) return false

            if (decoration && decoration.type.attrs.class === options.errorClass) {
              const word = decoration.type.attrs.word
              const suggestions = spellChecker.getSuggestions(word)
              if (suggestions.length > 0) {
                showSuggestionMenu(view, decoration.from, word, suggestions, event, options, spellChecker)
                return true
              }
            }

            return false
          }
        },

        view() {
          return {
            update: (view, prevState) => {
              // Handle any view updates if needed
            }
          }
        }
      })
    ]
  },

  addCommands() {
    return {
      toggleSpellcheck:
        () =>
        ({ commands }) => {
          this.options.enabled = !this.options.enabled
          return commands.focus()
        },

      loadHunspellDictionary:
        ({ dictionaryUrl, affixUrl = null }) =>
        ({ editor }) => {
          return this.storage.spellChecker.loadFromUrl(dictionaryUrl, affixUrl)
        },

      loadDictionaryFromFiles:
        ({ dicFile, affFile = null }) =>
        ({ editor }) => {
          return this.storage.spellChecker.loadFromFiles(dicFile, affFile)
        },

      addToCustomDictionary:
        word =>
        ({ commands }) => {
          this.storage.spellChecker.addToCustomDictionary(word)
          return commands.focus()
        },

      removeFromCustomDictionary:
        word =>
        ({ commands }) => {
          this.storage.spellChecker.removeFromCustomDictionary(word)
          return commands.focus()
        },

      recheckSpelling:
        () =>
        ({ editor, view }) => {
          if (!this.options.enabled) return false

          const plugin = this.editor.view.state.plugins.find(p => p.key.key === 'brazilianPortugueseSpellcheck$')
          if (plugin) {
            const decorations = this.storage.spellChecker
              ? createSpellcheckDecorations(view.state.doc, this.options, this.storage.spellChecker)
              : DecorationSet.empty
            view.dispatch(view.state.tr.setMeta(plugin.key, { decorations }))
          }

          return true
        },

      getDictionaryStatus:
        () =>
        ({ editor }) => {
          return this.storage.spellChecker.getLoadingStatus()
        }
    }
  }
})

function showSuggestionMenu(view, pos, word, suggestions, event, options, spellChecker) {
  const menu = document.createElement('div')
  menu.className = 'spellcheck-suggestions'
  menu.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            border-radius: 6px;
            padding: 4px 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            max-width: 250px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          `

  // Show loading status
  const status = spellChecker.getLoadingStatus()
  if (!status.isLoaded) {
    const loadingItem = document.createElement('div')
    loadingItem.textContent = `Carregando dicionário... (${status.wordCount} palavras)`
    loadingItem.style.cssText = `
              padding: 8px 12px;
              font-size: 12px;
              color: #666;
              font-style: italic;
              border-bottom: 1px solid #eee;
            `
    menu.appendChild(loadingItem)
  }

  // Add suggestions
  suggestions.slice(0, options.maxSuggestions).forEach(suggestion => {
    const item = document.createElement('div')
    item.className = 'spellcheck-suggestion'
    item.textContent = suggestion
    item.style.cssText = `
              padding: 8px 12px;
              cursor: pointer;
              font-size: 14px;
              transition: background-color 0.2s ease;
            `

    item.addEventListener('mouseenter', () => {
      item.style.backgroundColor = '#f0f0f0'
    })

    item.addEventListener('mouseleave', () => {
      item.style.backgroundColor = 'transparent'
    })

    item.addEventListener('click', () => {
      const tr = view.state.tr.replaceWith(pos, pos + word.length, view.state.schema.text(suggestion))
      view.dispatch(tr)
      document.body.removeChild(menu)
    })

    menu.appendChild(item)
  })

  if (suggestions.length === 0) {
    const noSuggestionsItem = document.createElement('div')
    noSuggestionsItem.textContent = 'Nenhuma sugestão encontrada'
    noSuggestionsItem.style.cssText = `
              padding: 8px 12px;
              font-size: 14px;
              color: #999;
              font-style: italic;
            `
    menu.appendChild(noSuggestionsItem)
  }

  // Add "Add to dictionary" option
  const addToDictItem = document.createElement('div')
  addToDictItem.className = 'spellcheck-add-to-dict'
  addToDictItem.textContent = `Adicionar "${word}" ao dicionário`
  addToDictItem.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            font-size: 14px;
            border-top: 1px solid #eee;
            color: #666;
            transition: background-color 0.2s ease;
          `

  addToDictItem.addEventListener('mouseenter', () => {
    addToDictItem.style.backgroundColor = '#f0f0f0'
  })

  addToDictItem.addEventListener('mouseleave', () => {
    addToDictItem.style.backgroundColor = 'transparent'
  })

  addToDictItem.addEventListener('click', () => {
    spellChecker.addToCustomDictionary(word)
    const decorations = this.storage.spellChecker ? createSpellcheckDecorations(view.state.doc, options, spellChecker) : DecorationSet.empty
    //view.dispatch(view.state.tr.setMeta(this.key, { decorations }))
    document.body.removeChild(menu)
  })

  menu.appendChild(addToDictItem)

  // Position menu
  const rect = view.dom.getBoundingClientRect()
  const x = rect.left + (event.clientX - rect.left)
  const y = rect.top + (event.clientY - rect.top) + 20

  menu.style.left = `${Math.min(x, window.innerWidth - 260)}px`
  menu.style.top = `${Math.min(y, window.innerHeight - 200)}px`

  document.body.appendChild(menu)

  // Remove menu on outside click
  function removeMenu (e) {
    if (!menu.contains(e.target)) {
      if (document.body.contains(menu)) {
        document.body.removeChild(menu);
      }
      document.removeEventListener('click', removeMenu)
    }
  }

  setTimeout(() => {
    document.addEventListener('click', removeMenu)
  }, 0)
}

function createSpellcheckDecorations(doc, options, spellChecker) {
  console.log(`Creating spellcheck decorations for document with ${doc.content.size} characters`)

  const decorations = []
  const wordPattern = /\b[\p{L}\p{N}]+\b/gu

  doc.descendants((node, pos) => {
    if (!node.isText) return

    const text = node.text
    let match

    while ((match = wordPattern.exec(text)) !== null) {
      const word = match[0]
      const start = pos + match.index
      const end = start + word.length

      if (!spellChecker.isCorrect(word)) {
        const status = spellChecker.getLoadingStatus()
        const title = status.isLoaded
          ? `Erro ortográfico: "${word}". Clique para sugestões.`
          : `Possível erro: "${word}". Dicionário carregando... (${status.wordCount} palavras)`

        decorations.push(
          Decoration.inline(start, end, {
            class: options.errorClass,
            title,
            word: word
          })
        )
      }
    }
  })

  return DecorationSet.create(doc, decorations)
}
