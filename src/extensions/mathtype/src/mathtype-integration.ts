//@ts-nocheck
import { type Editor } from '@tiptap/core'
import Configuration from '@wiris/mathtype-html-integration-devkit/src/configuration'
import IntegrationModel, { type IntegrationModelProperties } from '@wiris/mathtype-html-integration-devkit/src/integrationmodel'
//import Latex from '@wiris/mathtype-html-integration-devkit/src/latex'
import MathML from '@wiris/mathtype-html-integration-devkit/src/mathml'
import Parser from '@wiris/mathtype-html-integration-devkit/src/parser'
import Telemeter from '@wiris/mathtype-html-integration-devkit/src/telemeter'
import Util from '@wiris/mathtype-html-integration-devkit/src/util'

function getExtensionOptions(editor: Editor, extensionName: string) {
  // Find the extension in the editor schema
  const extension = editor.extensionManager.extensions.find(ext => ext.name === extensionName)

  if (!extension) {
    return null
  }

  // Return the extension's options
  return extension.options
}
export class ExitusEditorIntegration extends IntegrationModel {
  integrationFolderName: string
  editor: Editor
  constructor(integrationModelProperties: IntegrationModelProperties) {
    const editor = integrationModelProperties.editorObject as Editor

    let options

    if (typeof editor !== 'undefined' && (options = getExtensionOptions(editor, 'mathtype')) !== null) {
      integrationModelProperties.integrationParameters = options
    }
    /**
     * ExitusEditor Integration.
     */
    super(integrationModelProperties)
    this.editor = editor
    /**
     * Folder name used for the integration inside CKEditor plugins folder.
     */
    this.integrationFolderName = 'exitus_wiris'
  }

  addEditorListeners() {
    const editor = this.editorObject

    //if (typeof editor.config.wirislistenersdisabled === 'undefined' || !editor.config.wirislistenersdisabled) {
    this.checkElement()
    //}
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

  createViewImage(formula: string): string {
    /*  output = formula.replaceAll('"<"', '"&lt;"')
        .replaceAll('">"', '"&gt;"')
        .replaceAll('><<', '>&lt;<');
 */
    // Ckeditor retrieves editor data and removes the image information on the formulas
    // We transform all the retrieved data to images and then we Parse the data.
    const imageFormula = Parser.initParse(formula)
    return imageFormula
  }

  //@ts-ignore
  doubleClickHandler(element: HTMLElement, event: MouseEvent) {
    this.core.editionProperties.dbclick = true

    if ((this.editorObject as Editor).isEditable) {
      if (element.nodeName.toLowerCase() === 'img') {
        //console.log(Util.containsClass(element, Configuration.get('imageClassName')))
        if (Util.containsClass(element, Configuration.get('imageClassName'))) {
          //console.log(element)
          // Some plugins (image2, image) open a dialog on Double-click. On formulas
          // doubleclick event ends here.
          if (typeof event.stopPropagation !== 'undefined') {
            // old I.E compatibility.
            event.stopPropagation()
          } else {
            event.returnValue = false
          }
          this.core.getCustomEditors().disable()
          console.log(this.core.getCustomEditors().getActiveEditor())
          const customEditorAttr = element.getAttribute(Configuration.get('imageCustomEditorName'))
          if (customEditorAttr) {
            console.log(customEditorAttr)
            this.core.getCustomEditors().enable(customEditorAttr)
          }
          //@ts-ignore
          this.core.editionProperties.temporalImage = element
          this.openExistingFormulaEditor()
        }
      }
    }
  }

  openNewFormulaEditor() {
    // Store the editor selection as it will be lost upon opening the modal
    this.core.editionProperties.selection = this.editor.view.state.selection

    return super.openNewFormulaEditor()
  }

  callbackFunction() {
    super.callbackFunction()
    this.addEditorListeners()
  }

  notifyWindowClosed() {
    this.editor.commands.focus()
  }

  insertMathml(mathml: string): HTMLElement | null {
    // This returns the value returned by the callback function (writer => {...})
    const { view } = this.editor
    const tr = view.state.tr

    const core = this.getCore()
    const selection = view.state.selection

    const modelElementNew = document.createElement('mathml')
    modelElementNew.setAttribute('formula', mathml)
    //console.log(core.editionProperties.isNewElement)
    if (core.editionProperties.isNewElement) {
      // Don't bother inserting anything at all if the MathML is empty.
      if (!mathml) return null

      const viewSelection = this.core.editionProperties.selection || selection
      const pos = viewSelection.$anchor.pos
      const { from, to } = viewSelection
      ///const modelPosition = this.editorObject.editing.mapper.toModelPosition(viewSelection.getLastPosition())

      //this.editorObject.model.insertObject(modelElementNew, modelPosition)
      const formulaImg = this.createViewImage(mathml)

      this.editor.commands.insertContentAt(pos, formulaImg, {
        updateSelection: true,
        parseOptions: {
          preserveWhitespace: true
        }
      })

      // Remove selection
      if (!(from == to)) {
        this.editor.view.dispatch(tr.delete(pos, pos + 1))
        /* for (const range of viewSelection.getRanges()) {
          writer.remove(this.editorObject.editing.mapper.toModelRange(range))
        } */
      }

      // Set carret after the formula
      //const position = this.editorObject.model.createPositionAfter(modelElementNew)
      //writer.setSelection(position)
    } else {
      //const img = core.editionProperties.temporalImage
      //const viewElement = this.editorObject.editing.view.domConverter.domToView(img).parent
      //const modelElementOld = this.editorObject.editing.mapper.toModelElement(viewElement)

      // Insert the new <mathml> and remove the old one
      //const position = this.editorObject.model.createPositionBefore(modelElementOld)

      // If the given MathML is empty, don't insert a new formula.
      if (mathml) {
        const pos = selection.$anchor.pos
        this.editor.commands.insertContentAt(pos, modelElementNew, {
          updateSelection: true,
          parseOptions: {
            preserveWhitespace: true
          }
        })
        //this.editorObject.model.insertObject(modelElementNew, position)
      }
      //writer.remove(modelElementOld)
    }

    // eslint-disable-next-line consistent-return
    return modelElementNew
  }

  insertFormula(_focusElement: HTMLElement, windowTarget: Window, mathml: string, _wirisProperties: object) {
    const returnObject = {}
    console.log(mathml)
    let mathmlOrigin
    if (!mathml) {
      this.insertMathml('')
    } else {
      mathmlOrigin = this.core.editionProperties.temporalImage?.dataset.mathml

      try {
        returnObject.node = this.insertMathml(mathml)
      } catch (e) {
        const x = e.toString()
        if (x.includes("CKEditorError: Cannot read property 'parent' of undefined")) {
          this.core.modalDialog.cancelAction()
        }
      }
    }

    // Build the telemeter payload separated to delete null/undefined entries.

    const payload = {
      mathml_origin: mathmlOrigin ? MathML.safeXmlDecode(mathmlOrigin) : mathmlOrigin,
      mathml: mathml ? MathML.safeXmlDecode(mathml) : mathml,
      elapsed_time: Date.now() - this.core.editionProperties.editionStartTime,
      editor_origin: null, // TODO read formula to find out whether it comes from Oxygen Desktop
      toolbar: this.core.modalDialog.contentManager.toolbar,
      size: mathml?.length
    }
    //console.log(payload)

    // Remove desired null keys.
    Object.keys(payload).forEach(key => {
      if (key === 'mathml_origin' || key === 'editor_origin') !payload[key] ? delete payload[key] : {}
    })

    try {
      //@ts-ignore
      Telemeter.telemeter.track('INSERTED_FORMULA', {
        ...payload
      })
    } catch (err) {
      console.error(err)
    }

    /* Due to PLUGINS-1329, we add the onChange event to the CK4 insertFormula.
        We probably should add it here as well, but we should look further into how */
    // this.editorObject.fire('change');

    // Remove temporal image of inserted formula
    //@ts-ignore
    this.core.editionProperties.temporalImage = null

    return returnObject
  }
}
