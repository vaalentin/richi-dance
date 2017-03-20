export function createElement(type: string, className?: string, attributes?: {[key:string]:string}): HTMLElement {
  const $element = document.createElement(type)

  if (className) {
    $element.classList.add(className)
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
