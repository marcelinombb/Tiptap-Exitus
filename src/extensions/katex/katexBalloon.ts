import { Balloon, type BalloonOptions, Button } from '@editor/ui'
import { createHTMLElement } from '@editor/utils'
import check from '@icons/check-line.svg'
import close from '@icons/close-line.svg'
import { type Editor } from '@tiptap/core'

import { updateLatexDisplay } from './katexView'

export class KatexBalloon {
  editor: Editor
  balloon: Balloon
  input: HTMLInputElement
  checkboxDisplay: HTMLInputElement
  preview: Element

  constructor(
    editor: Editor,
    latexConfig: any,
    confirmCallback: (katexBalloon: KatexBalloon) => void,
    cancelCallback: (katexBalloon: KatexBalloon) => void,
    position: BalloonOptions['position']
  ) {
    const { display, latexFormula } = latexConfig
    this.editor = editor
    this.balloon = new Balloon(editor, {
      position: position
    })

    this.input = createHTMLElement('input', {
      type: 'text',
      class: 'latex-input-text',
      value: latexFormula.trim(),
      placeholder: '\\sqrt{2}',
      contentEditable: 'true'
    })

    this.checkboxDisplay = createHTMLElement('input', { type: 'checkbox', checked: display, id: 'emBloco' })
    this.checkboxDisplay.checked = display

    this.preview = createHTMLElement('div', { class: 'latex-editting-preview' })
    this.preview.classList.toggle('katex-display', display)

    this.input.addEventListener('keyup', () => {
      updateLatexDisplay(this.input.value, this.preview)
      this.preview.classList.toggle('katex-display', this.checkboxDisplay.checked)
    })

    this.checkboxDisplay.addEventListener('change', () => {
      this.preview.classList.toggle('katex-display', this.checkboxDisplay.checked)
    })

    const confirmButton = new Button(editor, {
      label: check,
      classList: ['latex-confirm']
    })

    confirmButton.bind('click', () => confirmCallback(this))

    const cancelButton = new Button(editor, {
      label: close,
      classList: ['latex-cancel']
    })

    cancelButton.bind('click', () => cancelCallback(this))

    const inputDisplay = createHTMLElement('div', { class: 'latex-editting-input' }, [this.input, confirmButton.render(), cancelButton.render()])

    const label = createHTMLElement('label', { for: 'emBloco', class: 'checkbox-label' })
    label.textContent = 'Em Bloco'

    const displayCheckbox = createHTMLElement('div', { class: 'latex-editting-displayCheckbox' }, [label, this.checkboxDisplay])

    const divConteiner = createHTMLElement('div', { class: 'latex-editting-container' }, [inputDisplay, displayCheckbox, this.preview])

    this.balloon.ballonPanel.appendChild(divConteiner)
  }

  getBalloon() {
    return this.balloon.getBalloon()
  }

  show() {
    this.balloon.show()
  }

  hide() {
    this.balloon.hide()
  }
}
