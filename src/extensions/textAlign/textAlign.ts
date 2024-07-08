import { Button, type ButtonEventProps, Dropdown } from '@editor/ui'

import type ExitusEditor from '@src/ExitusEditor'
import { TextAlign as TextAlignBase } from '@tiptap/extension-text-align'

function createAlignmentButton(editor: ExitusEditor, dropdown: Dropdown, icon: string, alignment: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0'],
    checkActive: { textAlign: alignment }
  })

  button.bind('click', () => {
    editor.chain().focus().setTextAlign(alignment).run()
    dropdown.off()
  })

  return button.render()
}

function createDropDownContent(editor: ExitusEditor, dropdown: Dropdown) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = 'ex-dropdown-content'

  const alignLeft = createAlignmentButton(editor, dropdown, alignLeftIcon, 'left')
  const alignRight = createAlignmentButton(editor, dropdown, alignRightIcon, 'right')
  const justify = createAlignmentButton(editor, dropdown, justifyIcon, 'justify')
  const center = createAlignmentButton(editor, dropdown, centertIcon, 'center')

  dropdownContent?.append(alignLeft, alignRight, justify, center)

  return dropdownContent
}

function showDropdown({ event, dropdown }: any) {
  event.stopPropagation()
  if (dropdown.isOpen) {
    dropdown.off()
  } else {
    dropdown.on()
  }
}

function textAlignDropDown({ editor }: ButtonEventProps) {
  const dropdown = new Dropdown(editor, {
    icon: alignLeftIcon + arrowDropDown,
    tooltip: 'Alinhamento de texto',
    click: showDropdown,
    classes: ['ex-dropdown-alignments']
  })

  dropdown.setDropDownContent(createDropDownContent(editor, dropdown))

  return dropdown
}

export const TextAlign = TextAlignBase.extend({
  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: alignLeftIcon + arrowDropDown,
        dropdown: textAlignDropDown,
        tooltip: 'Alinhamento de texto'
      }
    }
  }
})
