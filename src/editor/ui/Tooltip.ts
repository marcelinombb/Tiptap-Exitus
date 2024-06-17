export class Tooltip {
  tooltipBalloon: HTMLElement
  constructor(parent: HTMLElement, text: string) {
    this.tooltipBalloon = document.createElement('div')
    this.tooltipBalloon.className = 'ex-tooltip-balloon ex-reset-all ex-hidden'
    const tooltipText = document.createElement('span')
    tooltipText.className = 'ex-tooltip-text'
    tooltipText.innerHTML = text
    this.tooltipBalloon.appendChild(tooltipText)
    parent.appendChild(this.tooltipBalloon)
    parent.addEventListener('mouseenter', () => {
      const cancel = setTimeout(() => this.show(), 500)
      parent.addEventListener('mouseleave', () => {
        clearTimeout(cancel)
        this.hide()
      })
    })
  }

  show() {
    this.tooltipBalloon.classList.remove('ex-hidden')
  }

  hide() {
    this.tooltipBalloon.classList.add('ex-hidden')
  }
}
