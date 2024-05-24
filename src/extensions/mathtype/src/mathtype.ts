import { Node } from '@tiptap/core'

export const MathType = Node.create({
  name: 'mathtype',
  onDestroy() {
    this.options.currentInstance = null
  },
  addOptions() {
    return {
      currentInstance: null
    }
  }
})
