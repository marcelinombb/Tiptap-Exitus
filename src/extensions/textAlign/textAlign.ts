import { TextAlign as TextAlignBase } from '@tiptap/extension-text-align'

import centertIcon from '../../assets/icons/Editor/align-center.svg'
import justifyIcon from '../../assets/icons/Editor/align-justify.svg'
import alignLeftIcon from '../../assets/icons/Editor/align-left.svg'
import alignRightIcon from '../../assets/icons/Editor/align-right.svg'
import arrowDropDown from '../../assets/icons/Editor/arrow-drop-down-line.svg'
import { Button, createDropDown, type EventProps } from '../../editor/ui'
import type ExitusEditor from '../../ExitusEditor'

function createAlignmentButton(editor: ExitusEditor, icon: string, alignment: string) {
  return new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0'],
    events: {
      click: ({ editor }) => {
        editor.chain().focus().setTextAlign(alignment).run()
      }
    },
    checkActive: { textAlign: alignment }
  }).generateButton()
}

function initializeDropDown(editor: ExitusEditor) {
  const dropdown = createDropDown('textAlign' + editor.editorInstance, ['ex-dropdown-alignments'])
  const dropdownContent = dropdown.querySelector('.ex-dropdown-content')

  const alignLeft = createAlignmentButton(editor, alignLeftIcon, 'left')
  const alignRight = createAlignmentButton(editor, alignRightIcon, 'right')
  const justify = createAlignmentButton(editor, justifyIcon, 'justify')
  const center = createAlignmentButton(editor, centertIcon, 'center')

  dropdownContent?.append(alignLeft, alignRight, justify, center)

  window.addEventListener('click', function (event: Event) {
    const target = event.target as HTMLElement
    if (!target.matches('.dropdown')) {
      const dropdowns = document.getElementsByClassName('ex-dropdown')
      Array.from(dropdowns as HTMLCollectionOf<HTMLElement>).forEach(openDropdown => {
        if (openDropdown.style.display === 'block') {
          openDropdown.style.display = 'none'
        }
      })
    }
  })

  return dropdown
}

function showDropdown({ event, editor, button }: EventProps) {
  event.stopPropagation()
  const dropdown = document.getElementById('textAlign' + editor.editorInstance) || initializeDropDown(editor)

  if (dropdown.style.display === 'block') {
    dropdown.style.display = 'none'
  } else {
    dropdown.style.display = 'block'
    const buttonRect = button.getBoundingClientRect()
    dropdown.style.top = buttonRect.top + buttonRect.height + 'px'
    dropdown.style.left = buttonRect.left + 'px'
  }
}

export const TextAlign = TextAlignBase.extend({
  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: alignLeftIcon + arrowDropDown,
        events: {
          click: showDropdown
        }
      }
    }
  }
})
