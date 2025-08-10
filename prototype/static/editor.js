import { EditorView, basicSetup } from "https://esm.sh/@codemirror/basic-setup";
import { EditorState } from "https://esm.sh/@codemirror/state";
import { oneDark } from "https://esm.sh/@codemirror/theme-one-dark";

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

let updatePreview = debounce(() => {
  const content = view.state.doc.toString();
  fetch('/compile', {
    method: 'POST',
    body: new URLSearchParams({ 'content': content })
  })
    .then(response => {
      if (response.ok) return response.blob();
      throw new Error('Error compiling Typst code');
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      document.getElementById('pdf-viewer').src = url;
    })
    .catch(error => alert(error.message));
}, 1000);

const view = new EditorView({
  state: EditorState.create({
    doc: "",
    extensions: [
      basicSetup,
      oneDark,
      EditorView.updateListener.of(update => {
        if (update.docChanged) updatePreview();
      })
    ]
  }),
  parent: document.getElementById("editor-container")
});
