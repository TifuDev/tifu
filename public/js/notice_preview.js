window.onload = () => {
    let title = document.getElementById('title'),
    desc = document.getElementById('desc'),
    content = document.getElementById('content'),
    preview = document.getElementById('preview'),
    converter = new showdown.Converter();
    
    function formatDocument(){
        let document = `# ${title.innerHTML}\n\n${desc.innerText}\n\n`    
        return document+content.value
    }

    let empty_elems = document.querySelectorAll('[contenteditable]')
    for (let i = 0; i < empty_elems.length; i++) {
        empty_elems[i].oninput = (e) => {
            if(empty_elems[i].innerText !== ""){
                empty_elems[i].classList.remove('empty')
            }else{ 
                empty_elems[i].classList.add('empty')
            } 
        }        
    }
    content.oninput = () => {
        preview.innerHTML = converter.makeHtml(formatDocument())
    }

    document.getElementById('publish').onclick = async () => {
        const fd = new FormData()

        fd.append('title', title.innerText)
        fd.append('desc', desc.innerText),
        fd.append('id', toUrlSafe(title.innerText))
        fd.append('content', formatDocument())
        
        await fetch('/editor', {
            method: 'POST',
            body: fd,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
    }
}

function toUrlSafe(str){
    str = str.replaceAll(/ç/gm, '%C7')
    .replaceAll(/~/gm, '%7E')
    .replaceAll(/ã/gm, '%C3')

    return str.replaceAll(' ', "_").toLowerCase(1)
}