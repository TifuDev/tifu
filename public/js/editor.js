window.onload = function(){
    $('#title').on('click', () => {
        $(document).on('keydown', (e) => {
            let text = $('#title').text()
            if(text.length > 0){
                $('#title').removeClass('empty')
            }else{
                $('#title').addClass('empty')
            }
            if(e.which == 8 || e.which == 46){
                $('#title').text(text.substring(0, text.length-1))
            }else{
                $('#title').text(text+e.key)
            }
        })
    })
}