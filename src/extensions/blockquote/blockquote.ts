import { Blockquote as BlockquoteBase} from "@tiptap/extension-blockquote";


import quote from '../../assets/icons/Editor/double-quotes-l.svg'
import { ButtonEventProps } from "../../editor/ui";

function toggleBlockQuote({ editor, button }: ButtonEventProps) {
  editor.chain().focus().toggleBlockquote().run()
  if (editor.isActive('blockquote')) {
    button.on()
  } else {
    button.off()
  }
}

export const Blockquote = BlockquoteBase.extend({
    addStorage() {
        return {
            toolbarButtonConfig: {
                icon: quote,
                events: {
                    click: toggleBlockQuote
                },
                checkActive: this.name
            }
        }
    }
})