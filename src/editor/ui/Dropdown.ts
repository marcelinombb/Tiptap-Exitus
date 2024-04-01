export function createDropDown(name: string, classlist: string[] = []) {
  const dropdown = document.createElement('div')
  dropdown.className = 'ex-dropdown'
  dropdown.setAttribute('id', name)

  const dropdownContent = document.createElement('div')
  dropdownContent.classList.add('ex-dropdown-content', ...classlist)
  // dropdownContent.setAttribute('id', 'ex-dropdown-content')

  dropdown.appendChild(dropdownContent)
  document.body.appendChild(dropdown)

  return dropdown
}
