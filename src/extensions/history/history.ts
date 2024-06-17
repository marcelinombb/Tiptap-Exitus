import { type ButtonEventProps } from '@editor/ui'
import quote from '@icons/arrow-go-back-line.svg'
import quote2 from '@icons/arrow-go-forward-line.svg'
import { History as HistoryBase } from '@tiptap/extension-history'

function goBack({ editor, button }: ButtonEventProps) {
  editor.chain().focus().undo().run()
  if (editor.isActive('history')) {
    button.on()
  } else {
    button.off()
  }
}

function goFoward({ editor, button }: ButtonEventProps) {
  editor.chain().focus().redo().run()
  if (editor.isActive('history')) {
    button.on()
  } else {
    button.off()
  }
}

export const History = HistoryBase.extend({
  addStorage() {
    return {
      toolbarButtonConfig: [
        {
          icon: quote,
          click: goBack,
          checkActive: this.name,
          tooltip: 'Desfazer (Ctrl + Z))'
        },
        {
          icon: quote2,
          click: goFoward,
          checkActive: this.name,
          tooltip: 'Refazer (Ctrl + Y))'
        }
      ]
    }
  }
})
