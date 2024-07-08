import { Plugin } from "@editor/Plugin"
import { Button, Dropdown, DropDownEventProps } from "@editor/ui"
import { TextAlign } from '@tiptap/extension-text-align'
import centertIcon from '@icons/align-center.svg'
import justifyIcon from '@icons/align-justify.svg'
import alignLeftIcon from '@icons/align-left.svg'
import alignRightIcon from '@icons/align-right.svg'
import arrowDropDown from '@icons/arrow-drop-down-line.svg'
import ExitusEditor from "@src/ExitusEditor"

export class TextAlignPlugin extends Plugin {
    static get pluginName() {
        return 'textalign'
    }

    static get requires() {
        return [TextAlign]
    }

    init(): void {

        const dropdown = new Dropdown(this.editor, {
            icon: alignLeftIcon + arrowDropDown,
            click: this.showDropdown,
            tooltip: 'Alinhamento de texto',
            classes: ['ex-dropdown-alignments']
        })
        dropdown.setParentToolbar(this.editor.toolbar)
        dropdown.setDropDownContent(this.createDropDownContent(this.editor, dropdown))
        this.editor.toolbar.setTool(TextAlignPlugin.pluginName, dropdown)
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
        const dropdownContent = document.createElement('div')
        dropdownContent.className = 'ex-dropdown-content'
      
        const alignLeft = createAlignmentButton(editor, dropdown, alignLeftIcon, 'left')
        const alignRight = createAlignmentButton(editor, dropdown, alignRightIcon, 'right')
        const justify = createAlignmentButton(editor, dropdown, justifyIcon, 'justify')
        const center = createAlignmentButton(editor, dropdown, centertIcon, 'center')
      
        dropdownContent?.append(alignLeft, alignRight, justify, center)
      
        return dropdownContent
      }
}

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