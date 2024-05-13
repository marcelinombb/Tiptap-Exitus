export function createHTMLElement(tagName: string, attributes: { [x: string]: string }, childrens?: Element[]): Element {
  // Create the element
  const element = document.createElement(tagName)

  // Set attributes if provided
  if (attributes) {
    for (const key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        element.setAttribute(key, attributes[key])
      }
    }
  }

  // Set content if provided
  if (childrens) {
    element.append(...childrens)
  }

  return element
}
