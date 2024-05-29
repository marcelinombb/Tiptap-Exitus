//@ts-nocheck
import { type ButtonEventProps } from '@editor/ui'
import { type Editor, Node } from '@tiptap/core'
import Configuration from '@wiris/mathtype-html-integration-devkit/src/configuration'
import Core from '@wiris/mathtype-html-integration-devkit/src/core.src'
import Image from '@wiris/mathtype-html-integration-devkit/src/image'
import IntegrationModel from '@wiris/mathtype-html-integration-devkit/src/integrationmodel'
import Latex from '@wiris/mathtype-html-integration-devkit/src/latex'
import Listeners from '@wiris/mathtype-html-integration-devkit/src/listeners'
import MathML from '@wiris/mathtype-html-integration-devkit/src/mathml'
import Parser from '@wiris/mathtype-html-integration-devkit/src/parser'
import Util from '@wiris/mathtype-html-integration-devkit/src/util'

import mathIcon from './icons/ckeditor5-formula.svg'
import chemIcon from './icons/ckeditor5-chem.svg'
import { ExitusEditorIntegration } from './mathtype-integration'

function _addIntegration(editor: Editor) {
  //const { editor } = this
  //editor.emit()
  /**
   * Integration model constructor attributes.
   * @type {integrationModelProperties}
   */
  const integrationProperties = {}
  integrationProperties.environment = {}
  integrationProperties.environment.editor = 'CKEditor5'
  integrationProperties.environment.editorVersion = '5.x'
  integrationProperties.version = '1.0.0'
  integrationProperties.editorObject = editor
  integrationProperties.serviceProviderProperties = {}
  integrationProperties.serviceProviderProperties.URI = 'https://www.wiris.net/demo/plugins/app'
  integrationProperties.serviceProviderProperties.server = 'java'
  integrationProperties.target = editor.view.dom.parentElement
  integrationProperties.scriptName = 'bundle.js'
  integrationProperties.managesLanguage = true
  // etc

  // There are platforms like Drupal that initialize CKEditor but they hide or remove the container element.
  // To avoid a wrong behaviour, this integration only starts if the workspace container exists.
  let integration
  if (integrationProperties.target) {
    // Instance of the integration associated to this editor instance
    integration = new ExitusEditorIntegration(integrationProperties)
    integration.init()
    integration.listeners.fire('onTargetReady', {})

    integration.checkElement()

    editor.view.dom.addEventListener('click', evt => {
      if (evt.detail === 2) {
        integration.doubleClickHandler(evt.target, evt)
      }
    })
  }
  console.log('create instance of integration')

  return integration
}

export const MathType = Node.create({
  name: 'mathtype',

  group: 'inline',

  inline: true,

  atom: true,

  content: 'inline*',

  draggable: true,

  addStorage() {
    return {
      toolbarButtonConfig: [
        {
          icon: mathIcon,
          events: {
            click: ({ editor }: ButtonEventProps) => {
              editor.commands.openEditor()
            }
          }
        },
        {
          icon: chemIcon,
          events: {
            click: ({ editor }: ButtonEventProps) => {
              editor.commands.openChemEditor()
            }
          }
        }
      ]
    }
  },
  parseHTML() {
    return [
      {
        tag: 'img',
        getAttrs(node) {
          return (node as HTMLElement).classList.contains('Wirisformula') && null
        },
        priority: 100
      }
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', { class: 'ex-mathype' }, ['img', HTMLAttributes]]
  },
  addAttributes() {
    return {
      class: {
        default: 'Wirisformula'
      },
      style: {
        default: '',
        parseHTML(element) {
          return element.getAttribute('style')
        }
      },
      width: {
        default: '',
        parseHTML(element) {
          return element.getAttribute('width')
        }
      },
      height: {
        default: '',
        parseHTML(element) {
          return element.getAttribute('height')
        }
      },
      'data-mathml': {
        default: '',
        parseHTML(element) {
          return element.getAttribute('data-mathml')
        }
      },
      'data-custom-editor': {
        default: null,
        parseHTML(element) {
          return element.getAttribute('data-custom-editor')
        }
      },
      src: {
        default: null
      }
    }
  },
  addNodeView() {
    return ({ node }) => {
      console.log(node.attrs)

      const dom = document.createElement('span')
      dom.className = 'ex-mathype'
      const img = document.createElement('img')
      Object.keys(node.attrs).forEach(key => {
        if (node.attrs[key] == null) return
        img.setAttribute(key, node.attrs[key])
      })
      dom.appendChild(img)
      return {
        dom
      }
    }
  },
  addCommands() {
    return {
      openEditor: () => () => {
        const integration = this.options.currentInstance
        integration.core.getCustomEditors().disable()

        integration.core.editionProperties.dbclick = false
        const image = null
        if (typeof image !== 'undefined' && image !== null && image.classList.contains(WirisPlugin.Configuration.get('imageClassName'))) {
          integration.core.editionProperties.temporalImage = image
          integration.openExistingFormulaEditor()
        } else {
          integration.openNewFormulaEditor()
        }
      },
      openChemEditor: () => () => {
        const integration = this.options.currentInstance
        integration.core.getCustomEditors().enable('chemistry')

        integration.core.editionProperties.dbclick = false
        const image = null
        if (typeof image !== 'undefined' && image !== null && image.classList.contains(WirisPlugin.Configuration.get('imageClassName'))) {
          integration.core.editionProperties.temporalImage = image
          integration.openExistingFormulaEditor()
        } else {
          integration.openNewFormulaEditor()
        }
      }
    }
  },
  onCreate() {
    this.options.currentInstance = _addIntegration(this.editor)
    //console.log(this.options.currentInstance)

    window.WirisPlugin = {
      Core,
      Parser,
      Image,
      MathML,
      Util,
      Configuration,
      Listeners,
      IntegrationModel,
      currentInstance: this.options.currentInstance,
      Latex
    }
  },
  onDestroy() {
    this.options.currentInstance.destroy()
    this.options.currentInstance = null
  },
  addOptions() {
    return {
      currentInstance: null
    }
  }
})
