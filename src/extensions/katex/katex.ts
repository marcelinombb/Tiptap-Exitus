import formula from '@icons/formula.svg'
import { Node } from '@tiptap/core'
import katex from 'katex'
// -disable-next-line import/no-unresolved
import '../../../node_modules/katex/dist/katex.css'

import { type ButtonEventProps } from '../../editor/ui'

function click({ editor }: ButtonEventProps) {
  editor.commands.insertContentAt(editor.view.state.selection.$anchor.pos, `<span class="math-tex">\\(\\sqrt{2}\\)</span>`, {
    updateSelection: true,
    parseOptions: {
      preserveWhitespace: 'full'
    }
  })
}

export const Katex = Node.create({
  name: 'katex',

  group: 'inline',

  draggable: true,

  inline: true,

  content: 'text*',

  atom: true,

  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: formula,
        events: {
          click: click
        },
        checkActive: this.name
      }
    }
  },
  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: node => {
          return (node as HTMLElement).className === 'math-tex' && null
        },
        priority: 9999
      }
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', { class: 'math-tex' }, 0]
  },
  addAttributes() {
    return {
      class: {
        default: ''
      },
      contentLatex: {
        default: 'none'
      },
      renderedLatex: {
        default: 'inline'
      }
    }
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div')
      dom.className = 'math-tex tiptap-widget'
      const formula = node.content.firstChild?.textContent as string

      const matches = parseLatex(formula)

      const latexFormula = matches.join('')

      const contentLatex = document.createElement('div')
      const renderedLatex = document.createElement('div')
      renderedLatex.style.display = 'inline'
      renderedLatex.contentEditable = 'false'

      contentLatex.innerText = latexFormula
      contentLatex.style.display = 'none'

      renderedLatex.innerHTML = katex.renderToString(latexFormula, {
        output: 'html'
      })

      dom.addEventListener('dblclick', event => {
        event.stopPropagation()
        //dom.classList.add('ex-selected')
        console.log('dblclick')
        //contentLatex.style.display = 'inline-block'
        //renderedLatex.style.display = 'none'

        window.addEventListener('click', function (event) {
          const target = event.target as HTMLElement

          if (!target.matches('.ex-image-wrapper')) {
            dom.classList.remove('ex-selected')
          }
        })
      })

      dom.append(contentLatex, renderedLatex)

      return {
        dom,
        contentDOM: contentLatex,
        update(newNode) {
          if (newNode.type !== node.type) {
            return false
          }
          return true
        }
      }
    }
  }
})

function parseLatex(text: string) {
  const regex = /\\\((.*?)\\\)/g
  const matches = []
  let match

  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1])
  }
  return matches
}
