# Cardápio Interativo — Pizzaria do Mezequiel

Este é um protótipo de cardápio interativo para uma pizzaria. Ele permite:

- Selecionar o tamanho da pizza (broto, P, M, G, família).
- Escolher sabores (limites variam por tamanho; broto = 1, família = até 6).
- Visualizar em tempo real a montagem da pizza com animação (fatias/colorizações).
- Preencher nome, telefone, endereço e escolher um dos 12 bairros (taxas entre R$8 e R$12).
- Enviar o pedido para um número de WhatsApp com todos os dados preenchidos.

Arquivos:

- `index.html` — interface principal (tudo organizado em DIVs por seção).
- `style.css` — estilos e animação da pizza.
- `app.js` — lógica: limites por tamanho, preços por tamanho, atualização da visualização, bairros/taxas e envio ao WhatsApp.

Como usar:

1. Copie a pasta para seu servidor local (por exemplo no XAMPP em `htdocs`).
2. Abra no navegador: `http://localhost/pizzariadomezequiel/` (ou caminho onde colocou o projeto).
3. Selecione o tamanho, escolha os sabores (até o limite indicado), e veja a pizza ser montada.
4. Preencha nome, telefone, endereço e selecione o bairro.
5. Clique em "Confirmar pedido via WhatsApp" — isso abrirá o WhatsApp Web/Aplicativo com a mensagem pronta.

Customizações importantes:

- Número do WhatsApp: edite a constante `WHATSAPP_NUMBER` no arquivo `app.js` para o número real no formato internacional (ex: `5511999999999`).
- Lista de sabores: edite o array `flavors` em `app.js`.
- Taxas e nomes de bairros: edite o array `neighborhoods` em `app.js`.
- Preços por tamanho: edite o objeto `sizePrices` em `app.js` para ajustar os preços base de cada tamanho.

Notas técnicas / limitações:

- A animação é uma representação visual simples: cada sabor vira uma "fatia" colorida. O sistema agora calcula o preço estimado automaticamente com base no preço base do tamanho escolhido e na taxa de entrega selecionada. O total é mostrado no resumo e incluído na mensagem do WhatsApp.
- Tudo foi implementado em front-end puro (HTML/CSS/JS). Não há persistência de pedidos do lado do servidor — a confirmação é feita via WhatsApp.

Próximos passos sugeridos (opcionais):

- Adicionar preços por tamanho e por sabor e calcular total.
- Validar formato de telefone e mascarar entrada.
- Salvar pedidos em servidor (API) ou integrar com sistema de PDV.

Caso deseje, posso implementar qualquer um desses itens adicionais.

---
Feito: interface e lógica básica de montagem e envio ao WhatsApp.
