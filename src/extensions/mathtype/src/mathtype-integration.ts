import { type Editor } from '@tiptap/core'
import Configuration from '@wiris/mathtype-html-integration-devkit/src/configuration'
import IntegrationModel, { type IntegrationModelProperties } from '@wiris/mathtype-html-integration-devkit/src/integrationmodel'
import Latex from '@wiris/mathtype-html-integration-devkit/src/latex'
import Util from '@wiris/mathtype-html-integration-devkit/src/util'
export class ExitusEditorIntegration extends IntegrationModel {
  integrationFolderName: string
  constructor(integrationModelProperties: IntegrationModelProperties) {
    const editor = integrationModelProperties.editorObject

    if (typeof editor.config !== 'undefined' && typeof editor.config.get('mathTypeParameters') !== 'undefined') {
      integrationModelProperties.integrationParameters = editor.config.get('mathTypeParameters')
    }
    /**
     * ExitusEditor Integration.
     */
    super(integrationModelProperties)
    /**
     * Folder name used for the integration inside CKEditor plugins folder.
     */
    this.integrationFolderName = 'exitus_wiris'
  }

  addEditorListeners() {
    const editor = this.editorObject

    if (typeof editor.config.wirislistenersdisabled === 'undefined' || !editor.config.wirislistenersdisabled) {
      this.checkElement()
    }
  }

  checkElement() {
    const editor = this.editorObject as Editor
    const newElement = editor.view.dom

    // If the element wasn't treated, add the events.
    if (!newElement.wirisActive) {
      this.setTarget(newElement)
      this.addEvents()
      // Set the element as treated
      newElement.wirisActive = true
    }
  }

  doubleClickHandler(element: HTMLElement, event: MouseEvent) {
    this.core.editionProperties.dbclick = true
    if ((this.editorObject as Editor).isEditable === false) {
      if (element.nodeName.toLowerCase() === 'img') {
        if (Util.containsClass(element, Configuration.get('imageClassName'))) {
          // Some plugins (image2, image) open a dialog on Double-click. On formulas
          // doubleclick event ends here.
          if (typeof event.stopPropagation !== 'undefined') {
            // old I.E compatibility.
            event.stopPropagation()
          } else {
            event.returnValue = false
          }
          this.core.getCustomEditors().disable()
          const customEditorAttr = element.getAttribute(Configuration.get('imageCustomEditorName'))
          if (customEditorAttr) {
            this.core.getCustomEditors().enable(customEditorAttr)
          }
          this.core.editionProperties.temporalImage = element
          this.openExistingFormulaEditor()
        }
      }
    }
  }

  openNewFormulaEditor() {
    // Store the editor selection as it will be lost upon opening the modal
    this.core.editionProperties.selection = (this.editorObject as Editor).view.state.selection

    return super.openNewFormulaEditor()
  }

  notifyWindowClosed() {
    ;(this.editorObject as Editor).commands.focus()
  }
}
