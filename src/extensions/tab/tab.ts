// @ts-nocheck
import { Node } from '@tiptap/core'


function addTab ({ editor }) {
    document.addEventListener('keydown', (event) => {
            event.preventDefault();
            editor.commands.insertContentAt(editor.view.state.selection.$anchor.pos, `<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`, {
                updateSelection: true,
                parseOptions: {
                  preserveWhitespace: 'full'
                }
              })
            
        })
    }


export const Tab = Node.create({
  name: 'teclatab',

  group: 'inline',

  inline: true,

  content: 'text*',

  atom: true,


  addCommands() {
    return {
      tabIndent: () => ({ tr, state, dispatch, editor }) => {
        addTab({ editor });
        return true;
      },
        
        tabOutdent: () => ({ tr, state, dispatch, editor }) => {
            
            console.log("tirou o espaço");
            return true
        },
    }
},
addKeyboardShortcuts() {
    return {
      Tab: () => { if (!(this.editor.isActive('bulletList') || this.editor.isActive('orderedList'))) return this.editor.commands.tabIndent() },
      'Shift-Tab': () => { if (!(this.editor.isActive('bulletList') || this.editor.isActive('orderedList'))) return this.editor.commands.tabOutdent() },
      //Backspace: () => { if (!(this.editor.isActive('bulletList') || this.editor.isActive('orderedList'))) return this.editor.commands.outdent() },
    }
  },

})

