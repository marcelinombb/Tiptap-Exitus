// @ts-nocheck
import {Italic as ItalicBase} from "@tiptap/extension-italic";
import italic from '../../assets/icons/Editor/italic.svg'
import Button from "../../editor/ui/Button";

function toggleItalic() {
    this.editor.chain().focus().toggleItalic().run()
}

const Italic = ItalicBase.extend({
    addStorage() {
        return {
            toolbarButton: new Button(
                {
                    icon: italic,
                    events: {
                        'click' : toggleItalic
                    }
                }
            )
        }
    }
})

export default Italic