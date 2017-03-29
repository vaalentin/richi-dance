export function createElement(type: string, className?: string, attributes?: {[key:string]:string}): HTMLElement {
  const $element = document.createElement(type)

  if (className) {
    const classes = className.split(' ')

    for (let c of classes) {
      $element.classList.add(c)
    }
  }

  if (attributes) {
    for (let key in attributes) {
      $element.setAttribute(key, attributes[key])
    }
  }

  return $element
}

export function appendChild($element: HTMLElement, ...$children: HTMLElement[]) {
  for (let $child of $children) {
    $element.appendChild($child)
  }
}
