// @ts-nocheck
import {Italic as ItalicBase} from "@tiptap/extension-italic";
import italic from '../../assets/icons/Editor/italic.svg'

function toggleItalic() {
    this.editor.chain().focus().toggleItalic().run()
}

const Italic = ItalicBase.extend({
    addStorage() {
        return {
            icon: italic,
            callbackEvent: toggleItalic
        }
    }
})

export default Italic