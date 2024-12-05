# Exitus Editor

Exitus Editor is a customizable rich text editor with support for advanced features like math typesetting, image handling, and custom content manipulation. This README provides a guide on setting up and using the editor in your project.
Exitus Editor is built using [Tiptap](https://tiptap.dev/docs), a headless rich-text editor framework based on ProseMirror. Tiptap provides the flexibility to build highly customizable and feature-rich text editors.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Installation](#installation)
3. [Basic Usage](#basic-usage)
4. [Configuration Options](#configuration-options)
5. [API Methods](#api-methods)
6. [Events](#events)
7. [Example](#example)
8. [Development](#development)

---

## Getting Started

The Exitus Editor requires minimal setup. The base HTML structure and necessary JavaScript files are included in this repository.

## Installation

Clone this repository and include the required files in your project.

### Required Files:
- `exituseditor.js`
- `favicon.ico`

Place these files in the root directory of your project.

## Basic Usage

Exitus Editor requires an HTML element reference to be rendered within. Below is an example of how to set up and initialize the editor:

### Example HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="./favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exitus Editor</title>
  <script src="./exituseditor.js"></script>
</head>
<body>
  <div class="element"></div>
</body>
</html>
```

### Initializing the Editor:

```javascript
const defaultText = '(any html content)';

const exitusEditor = new ExitusEditor({
  container: document.querySelector('.element'),
  content: defaultText,
  config: {
    mathtype: {
      mathTypeParameters: {
        editorParameters: {
          fontFamily: "Arial",
          fontStyle: "normal",
          fontSize: "14px",
          fonts: [{ 'id': 'inherit', 'label': 'Arial' }],
          language: "pt_br",
        },
      },
    },
    image: {
      proxyUrl: "https://example.com/proxy",
      inline: true,
      allowBase64: true,
    },
    initialHeight: 400,
  },
});
```

## Configuration Options

- **Mathtype:** Math editor configuration.
- **Image:** Image proxy and handling options.
- **Initial Height:** Sets the editor's initial height.

## API Methods

### `getHTML(): string`
Retrieves the editor content as html.
### `getJson(): string`
Retrieves the editor content as Json.
### `setEditable(editable: boolean): void`
Update editable state of the editor.
### `getPluginInstance(name: string): Plugin`
Retrieves a plugin instance.
### `destroy(): void`
destroy the editor and remove from dom.

## Events

### `on('create', callback)`
Triggered when the editor is initialized.

### `on('update', callback)`
Triggered when the editor content is updated.

## Example

```javascript
const exitusEditor = new ExitusEditor({
  container: document.querySelector('.element'),
  content: '(any html content)',
});

exitusEditor.on('create', ({ editor }) => {
  const htmlContent = document.querySelector('#testeHtml');
  htmlContent.innerHTML = editor.getHTML();
});

exitusEditor.on('update', ({ editor }) => {
  const htmlContent = document.querySelector('#testeHtml');
  htmlContent.innerHTML = editor.getHTML();
});
```

---

## Development

Clone this repository and install the npm dependencies.

```javascript
npm install
npm run dev
```
