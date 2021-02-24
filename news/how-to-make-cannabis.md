# Okay isso não é sobre cannabis

Isso é a forma que o database trabalhará.

Nosso database é o mongodb, e ele será responsável de guardar as informações sobre a noticia

Essa é a estrutura:

{
    'title': 'Como fazer cannabis(maconha)',
    'desc' : 'Bom, hoje você irá fazer aquela bela maconha para os seus amigos ou para relaxar kkk',
    'path' : 'news/how-to-make-cannabis.md',
    'id': 'how-to-make-cannabis',
    'author' : 'admin',
    'date' : new Date('2021-02-23')
}

As noticias serão salvas no diretório 'news' e serão salvas em Markdown como no exemplo atual

Pq o Markdown?

1. Por enquanto, é a melhor forma de guardar texto formatado
2. Fácil para entender
3. Tem diversos recursos, entre eles guardar links, imagens, cabeçalhos, parágrafos e etc...