import { Plugin } from '@editor/Plugin'
import { type Tool } from '@editor/toolbar'
import { Button, Dropdown, type DropDownEventProps } from '@editor/ui'
import listFullIcon from '@icons/list-check.svg'
import listOrederedIcon from '@icons/list-ordered-2.svg'
import listIcon from '@icons/list-unordered.svg'
import BulletList from '@tiptap/extension-bullet-list'
import { ListItem } from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'

export class ListItemPlugin extends Plugin {
  static get pluginName() {
    return 'listItem'
  }

  static get requires() {
    return [ListItem, OrderedList, BulletList]
  }

  init(): void {}

  tool(): Tool {
    const dropdown = new Dropdown(
      this.editor,
      {
        icon: listIcon,
        click: showDropdown,
        tooltip: 'Listas',
        classes: []
      },
      ListItemPlugin.pluginName
    )

    dropdown.setTools(this.createDropDownContent(dropdown))

    return dropdown
  }

  listaOrdenada(dropdown: Dropdown, icon: string) {
    const button = new Button(dropdown.editor, {
      icon: icon,
      classList: ['ex-mr-0']
    })

    button.bind('click', ({ editor }) => {
      editor.chain().focus().toggleOrderedList().run()
      dropdown.off()
    })

    return button
  }

  listaBolinhaCheia(dropdown: Dropdown, icon: string) {
    const button = new Button(dropdown.editor, {
      icon: icon,
      classList: ['ex-mr-0']
    })

    button.bind('click', ({ editor }) => {
      editor.chain().focus().toggleBulletList().run()
      dropdown.off()
    })

    return button
  }

  createDropDownContent(dropdown: Dropdown) {
    const listFull = this.listaBolinhaCheia(dropdown, listFullIcon)
    const listOredered = this.listaOrdenada(dropdown, listOrederedIcon)
    return [listFull, listOredered]
  }
}

function showDropdown({ event, dropdown }: DropDownEventProps) {
  event.stopPropagation()
  if (dropdown.isOpen) {
    dropdown.off()
  } else {
    dropdown.on()
  }
}
