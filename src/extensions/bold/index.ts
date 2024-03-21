import {Bold as BoldBase} from '@tiptap/extension-bold'
import bold from '../../assets/icons/Editor/bold.svg'

const Bold = BoldBase.extend({
    addOptions() {
        return {
          ...this.parent?.(),
          icon: bold,
        };
      },
})

export default Bold