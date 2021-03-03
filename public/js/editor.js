const showdown = window.showdown

const classMap = {
    h1: 'my-2 text-2xl underline font-semibold',
    p: 'my-2 font-light',
    strong: 'font-light',
    li:'list-disc'
}

const bindings = Object.keys(classMap)
    .map(key => ({
      type: 'output',
      regex: new RegExp(`<${key}(.*)>`, 'g'),
      replace: `<${key} class="${classMap[key]}" $1>`
    }));

const converter = new showdown.Converter({
    noHeaderId: true,
    extensions: [bindings]
})

window.onload = () => {
    let content = document.getElementById('content')
    let preview = document.getElementById('preview')
    content.onchange = (e) => {
        preview.innerHTML = converter.makeHtml(content.value)
    }
}