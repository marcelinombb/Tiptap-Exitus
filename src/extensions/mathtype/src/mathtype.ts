//@ts-nocheck
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

import { ExitusEditorIntegration } from './mathtype-integration'

function createViewImage(formula: string): string {

  const mathString = formula.replaceAll('ref="<"', 'ref="&lt;"');
  const imgHtml = Parser.initParse(mathString, integration.getLanguage());
  return imgHtml 
}

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
  integrationProperties.target = editor.view.dom
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
      //console.log(evt)

      /* if (data.domEvent.detail === 2) {
        integration.doubleClickHandler(data.domTarget, data.domEvent)
        evt.stop()
      } */
    })

    /* this.listenTo(
      editor.editing.view.document,
      'click',
      (evt, data) => {
        // Is Double-click
        if (data.domEvent.detail === 2) {
          integration.doubleClickHandler(data.domTarget, data.domEvent)
          evt.stop()
        }
      },
      { priority: 'normal' }
    ) */
  }
  console.log('create instance of integration')

  return integration
}

export const MathType = Node.create({
  name: 'mathtype',
  parseHTML() {
    return [
      {
        tag: 'img',
        getAttrs(node) {
          return (node as HTMLElement).classList.contains('Wirisformula') && null
        }
      }
    ]
  },
  addCommands() {
    return {
      openEditor: () => () => {
        const integration = this.options.currentInstance
        //console.log(this.options.currentInstance)
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
    console.log(this.options.currentInstance)

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
