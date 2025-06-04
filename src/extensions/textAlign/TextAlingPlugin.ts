import { Plugin } from '@editor/Plugin'
import { Button, Dropdown, type DropDownEventProps } from '@editor/ui'
import centertIcon from '@icons/align-center.svg'
import justifyIcon from '@icons/align-justify.svg'
import alignLeftIcon from '@icons/align-left.svg'
import alignRightIcon from '@icons/align-right.svg'
import type ExitusEditor from '@src/ExitusEditor'
import { TextAlign } from '@tiptap/extension-text-align'

export class TextAlignPlugin extends Plugin {
  static get pluginName() {
    return 'textAlign'
  }

  static get requires() {
    return [
      TextAlign.configure({
        types: ['heading', 'paragraph']
      })
    ]
  }

  init(): void {}

  tool() {
    const dropdown = new Dropdown(
      this.editor,
      {
        icon: alignLeftIcon,
        click: this.showDropdown,
        tooltip: 'Alinhamento de texto',
        classes: ['ex-dropdown-alignments']
      },
      TextAlignPlugin.pluginName
    )

    dropdown.setTools(this.createDropDownContent(this.editor, dropdown))

    return dropdown
  }

  showDropdown({ event, dropdown }: DropDownEventProps) {
    event.stopPropagation()
    if (dropdown.isOpen) {
      dropdown.off()
    } else {
      dropdown.on()
    }
  }

  createDropDownContent(editor: ExitusEditor, dropdown: Dropdown) {

    const alignLeft = createAlignmentButton(editor, dropdown, alignLeftIcon, 'left', 'esquerda')
    const alignRight = createAlignmentButton(editor, dropdown, alignRightIcon, 'right', 'direita')
    const center = createAlignmentButton(editor, dropdown, centertIcon, 'center', 'centro')
    const justify = createAlignmentButton(editor, dropdown, justifyIcon, 'justify', 'justificar')

    return [alignLeft, alignRight, center, justify]

  }
}

function createAlignmentButton(editor: ExitusEditor, dropdown: Dropdown, icon: string, alignment: string, direcao: string) {
  const tooltipText = direcao === 'justificar' ? 'Justificar texto' : direcao === 'centro' ? `Alinhar ao ${direcao}` : `Alinhar à ${direcao}`
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0'],
    checkActive: { textAlign: alignment },
    tooltip: tooltipText
  })

  button.bind('click', () => {
    editor.chain().focus().setTextAlign(alignment).run()
    dropdown.off()
  })

  return button
}
