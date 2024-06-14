import { Button, Dropdown, type DropDownEventProps } from '@editor/ui'
import arrowDropDown from '@icons/arrow-drop-down-line.svg'
import listFullIcon from '@icons/list-check.svg'
import listOrederedIcon from '@icons/list-ordered-2.svg'
import listIcon from '@icons/list-unordered.svg'
import type ExitusEditor from '@src/ExitusEditor'
import { ListItem as ListitemBase } from '@tiptap/extension-list-item'

function listaOrdenada(editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    editor.chain().focus().toggleOrderedList().run()
    dropdown.off()
  })

  return button.render()
}

function listaBolinhaCheia(editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    editor.chain().focus().toggleBulletList().run()
    dropdown.off()
  })

  return button.render()
}

function createDropDownContent(editor: ExitusEditor, dropdown: Dropdown) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = 'ex-dropdownList-content'

  const listFull = listaBolinhaCheia(editor, dropdown, listFullIcon)
  const listOredered = listaOrdenada(editor, dropdown, listOrederedIcon)

  dropdownContent?.append(listFull, listOredered)

  return dropdownContent
}

function showDropdown({ event, dropdown }: DropDownEventProps) {
  event.stopPropagation()
  if (dropdown.isOpen) {
    dropdown.off()
  } else {
    dropdown.on()
  }
}

function listItemDropDown({ editor }: any) {
  const dropdown = new Dropdown(editor, {
    events: {
      open: showDropdown
    },
    classes: ['ex-dropdown-listItem']
  })

  dropdown.setDropDownContent(createDropDownContent(editor, dropdown))

  return dropdown
}

export const ListItem = ListitemBase.extend({
  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: listIcon + arrowDropDown,
        dropdown: listItemDropDown
      }
    }
  }
})
