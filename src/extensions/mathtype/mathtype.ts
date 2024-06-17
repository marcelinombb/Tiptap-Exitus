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

import chemIcon from './icons/ckeditor5-chem.svg'
import mathIcon from './icons/ckeditor5-formula.svg'
import { ExitusEditorIntegration } from './mathtype-integration'

function _addIntegration(editor: Editor, integrationParameters) {
  /**
   * Integration model constructor attributes.
   * @type {integrationModelProperties}
   */
  const integrationProperties = {}
  integrationProperties.environment = {}
  integrationProperties.environment.editor = 'ExitusEditor'
  integrationProperties.environment.editorVersion = '1.x'
  integrationProperties.version = '1.0.0'
  integrationProperties.editorObject = editor
  integrationProperties.serviceProviderProperties = {}
  integrationProperties.serviceProviderProperties.URI = 'https://www.wiris.net/demo/plugins/app'
  integrationProperties.serviceProviderProperties.server = 'java'
  integrationProperties.target = editor.view.dom.parentElement
  integrationProperties.scriptName = 'bundle.js'
  integrationProperties.managesLanguage = true
  integrationProperties.integrationParameters = integrationParameters['mathTypeParameters']

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

  return integration
}

function getExtensionStorage(editor) {
  return editor.extensionManager.extensions.find(extension => extension.name === 'mathtype').storage
}

function openEditor(editorType: string | null) {
  return ({ editor }) => {
    try {
      const integration = getExtensionStorage(editor).currentInstances.get(editor.editorInstance)
      if (editorType == null) {
        integration.core.getCustomEditors().disable()
      } else {
        integration.core.getCustomEditors().enable(editorType)
      }

      integration.core.editionProperties.dbclick = false
      const image = null
      if (typeof image !== 'undefined' && image !== null && image.classList.contains(WirisPlugin.Configuration.get('imageClassName'))) {
        integration.core.editionProperties.temporalImage = image
        integration.openExistingFormulaEditor()
      } else {
        integration.openNewFormulaEditor()
      }
    } catch (e) {
      console.error(e)
    }
  }
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
      currentInstances: new Map(),
      toolbarButtonConfig: [
        {
          icon: mathIcon,
          click: ({ editor }: ButtonEventProps) => {
            editor.commands.openMathEditor()
          },
          tooltip: 'Fórmulas Matemáticas - MathType'
        },
        {
          icon: chemIcon,
          click: ({ editor }: ButtonEventProps) => {
            editor.commands.openChemEditor()
          },
          tooltip: 'Fórmulas Quimicas - ChemType'
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
      const dom = document.createElement('span')
      dom.className = 'ex-mathype tiptap-widget'
      const img = document.createElement('img')
      Object.keys(node.attrs).forEach(key => {
        if (node.attrs[key] == null) return
        img.setAttribute(key, node.attrs[key])
      })
      dom.appendChild(img)
      return {
        dom,
        selectNode() {
          dom.classList.add('ex-selected')
        },
        deselectNode() {
          dom.classList.remove('ex-selected')
        }
      }
    }
  },
  addCommands() {
    return {
      openMathEditor: () => openEditor(),
      openChemEditor: () => openEditor('chemistry')
    }
  },
  onCreate({ editor }) {
    try {
      if (getExtensionStorage(editor).currentInstances.has(editor.editorInstance)) return

      const integration = _addIntegration(editor, this.options)
      getExtensionStorage(editor).currentInstances.set(editor.editorInstance, integration)

      window.WirisPlugin = {
        Core,
        Parser,
        Image,
        MathML,
        Util,
        Configuration,
        Listeners,
        IntegrationModel,
        currentInstance: integration,
        Latex
      }
    } catch (e) {
      console.error(e)
    }
  },
  addOptions() {
    return {
      mathTypeParameters: {
        editorParameters: {
          fontFamily: 'Arial',
          fontStyle: 'normal',
          fontSize: '14px',
          fonts: [
            {
              id: 'inherit',
              label: 'Arial'
            }
          ],
          language: 'pt_br'
        }
      }
    }
  },
  onDestroy() {
    this.storage.currentInstances.get(this.editor.editorInstance).destroy()
    this.storage.currentInstances.delete(this.editor.editorInstance)
  }
})
