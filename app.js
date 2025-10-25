// -----------------------------------------------------------------------------
// Configurações principais (edite aqui conforme necessário)
// -----------------------------------------------------------------------------
// Número de WhatsApp para envio (formato internacional, sem sinais).
// Substitua pelo número da pizzaria: 55 (BR) + DDD + número, sem espaços ou sinais.
// Exemplo: '5511999999999'
const WHATSAPP_NUMBER = '5511999999999'; // substitua pelo seu número

// Lista de sabores disponíveis (texto exibido nos checkboxes). Para adicionar/remover
// sabores, edite este array. Os nomes são usados também para colorir as fatias
// na visualização e para montar a mensagem enviada ao WhatsApp.
const flavors = [
  'Mussarela', 'Calabresa', 'Portuguesa', 'Frango com Catupiry', 'Marguerita', 'Pepperoni',
  '4 Queijos', 'Vegetariana', 'Bacon', 'Atum', 'Napolitana', 'Banana com Canela'
];

// Bairros e respectivas taxas de entrega (em R$). Para alterar bairros/taxas,
// edite os objetos abaixo. O índice no array é usado no <select> e na mensagem.
const neighborhoods = [
  {name:'Centro', fee:8}, {name:'Jardim Alvorada', fee:9}, {name:'Vila Nova', fee:10},
  {name:'Bela Vista', fee:11}, {name:'São Pedro', fee:9}, {name:'Santa Luzia', fee:12},
  {name:'Boa Esperança', fee:8}, {name:'Parque das Flores', fee:10}, {name:'Monte Verde', fee:11},
  {name:'Recanto', fee:9}, {name:'Residencial', fee:8}, {name:'Areal', fee:12}
];

// Limites de sabores por tamanho. Chaves: broto, p, m, g, familia.
// Altere os valores se desejar mudar a política de quantos sabores cada tamanho permite.
const sizeLimits = {broto:1,p:2,m:3,g:4,familia:6};

// Preço base por tamanho (em R$). Edite aqui para alterar os preços exibidos e
// usados no cálculo total. O total estimado mostrado é basePrice + taxa de
// entrega (não inclui custos por sabor adicional — se quiser isso, posso
// adicionar facilmente).
const sizePrices = {broto:15.00, p:25.00, m:35.00, g:45.00, familia:60.00};

// Mapa de cores utilizadas para cada sabor — apenas para a visualização das
// fatias na pizza. Você pode trocar as cores por outras em formato HEX.
const flavorColors = {
  'Mussarela':'#f9e79f','Calabresa':'#e67e22','Portuguesa':'#d98880','Frango com Catupiry':'#f7dc6f',
  'Marguerita':'#a3e4d7','Pepperoni':'#c0392b','4 Queijos':'#f5cba7','Vegetariana':'#82e0aa',
  'Bacon':'#784212','Atum':'#85c1e9','Napolitana':'#f1948a','Banana com Canela':'#f8c471'
};

// elementos
const flavorsListDiv = document.getElementById('flavorsList');
const neighborhoodSelect = document.getElementById('neighborhood');
const pizzaBase = document.getElementById('pizzaBase');
const previewList = document.getElementById('previewList');
const limitNote = document.getElementById('limitNote');
const flavorNote = document.getElementById('flavorNote');
const deliveryFeeDiv = document.getElementById('deliveryFee');
const orderSummary = document.getElementById('orderSummary');
const priceBreakdown = document.getElementById('priceBreakdown');
const confirmBtn = document.getElementById('confirmBtn');

let selectedSize = null;
let maxFlavors = 0;
let selectedFlavors = [];

/**
 * Inicialização do script. Renderiza sabores, bairros, liga os listeners e
 * atualiza preços exibidos na UI.
 */
function init(){
  renderFlavors();        // cria os checkboxes de sabores
  renderNeighborhoods();  // popula o select de bairros
  setupSizeListeners();   // configura seleção de tamanho e habilita sabores
  updatePricesInUI();     // preenche os preços ao lado dos tamanhos
  document.getElementById('confirmBtn').addEventListener('click', sendWhatsApp);
  updateUI();             // atualiza resumo/estado inicial
}

/**
 * Preenche os elementos <span class="price" data-size="..."> com os valores
 * definidos em `sizePrices` para que os preços apareçam ao lado dos tamanhos.
 */
function updatePricesInUI(){
  document.querySelectorAll('.price[data-size]').forEach(span=>{
    const key = span.getAttribute('data-size');
    const price = sizePrices[key];
    if(typeof price === 'number'){
      span.textContent = `R$ ${price.toFixed(2)}`;
    } else {
      span.textContent = '';
    }
  });
}

/**
 * Renderiza os sabores como checkboxes dentro de #flavorsList. Inicialmente
 * os inputs ficam desabilitados até que o usuário escolha um tamanho.
 */
function renderFlavors(){
  flavorsListDiv.innerHTML = '';
  flavors.forEach((f, i)=>{
    const div = document.createElement('div');
    div.className = 'flavorItem';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'flv_'+i;
    input.value = f;
    input.disabled = true; // habilitado apenas após escolher tamanho
    input.addEventListener('change', onFlavorChange);
    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.innerText = f;
    div.appendChild(input);
    div.appendChild(label);
    flavorsListDiv.appendChild(div);
  });
}

/**
 * Popula o <select> de bairros a partir do array `neighborhoods` e mostra a
 * taxa selecionada em #deliveryFee quando o usuário escolher.
 */
function renderNeighborhoods(){
  neighborhoodSelect.innerHTML = '<option value="">Selecione um bairro</option>';
  neighborhoods.forEach((b, idx)=>{
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `${b.name} (taxa R$ ${b.fee.toFixed(2)})`;
    neighborhoodSelect.appendChild(opt);
  });
  neighborhoodSelect.addEventListener('change', ()=>{
    const idx = neighborhoodSelect.value;
    if(idx!==''){
      deliveryFeeDiv.textContent = `Taxa de entrega: R$ ${neighborhoods[idx].fee.toFixed(2)}`;
    } else deliveryFeeDiv.textContent = '';
  });
}

/**
 * Configura os radio buttons de tamanho. Quando o usuário escolhe um tamanho:
 * - Atualiza `selectedSize` e `maxFlavors` de acordo com `sizeLimits`.
 * - Habilita os checkboxes de sabores.
 * - Reseta a seleção de sabores atual.
 */
function setupSizeListeners(){
  const radios = document.querySelectorAll('input[name="size"]');
  radios.forEach(r=>r.addEventListener('change', ()=>{
    selectedSize = r.value;
    maxFlavors = sizeLimits[selectedSize] || 1;
    // habilitar checkboxes
    document.querySelectorAll('#flavorsList input[type=checkbox]').forEach(cb=>cb.disabled=false);
    // desmarcar todos os sabores
    document.querySelectorAll('#flavorsList input[type=checkbox]').forEach(cb=>cb.checked=false);
    selectedFlavors = [];
    updateUI();
  }))
}

/**
 * Handler para mudança de cada checkbox de sabor. Mantém `selectedFlavors`
 * sincronizado e impede o usuário de selecionar mais sabores que o limite do
 * tamanho escolhido. Atualiza a visualização da pizza e o resumo.
 */
function onFlavorChange(e){
  const val = e.target.value;
  if(e.target.checked){
    if(selectedFlavors.length>=maxFlavors){
      // desfaz check e mostra aviso amigável
      e.target.checked = false;
      alert(`Máximo de ${maxFlavors} sabor(es) para o tamanho selecionado.`);
      return;
    }
    selectedFlavors.push(val);
  } else {
    selectedFlavors = selectedFlavors.filter(s=>s!==val);
  }
  updatePizzaPreview();
  updateUI();
}

/**
 * Atualiza a visualização da pizza (#pizzaBase). Para cada sabor selecionado
 * é criada uma "fatia" (div.slice) com cor definida em `flavorColors`.
 * A animação é feita alterando a transform/opacity via requestAnimationFrame.
 */
function updatePizzaPreview(){
  // limpa fatias
  pizzaBase.innerHTML = '';
  if(selectedFlavors.length===0) { previewList.textContent = 'Nenhum sabor selecionado.'; return; }
  previewList.textContent = selectedFlavors.join(' • ');

  const n = selectedFlavors.length;
  const offset = -90; // Começa do topo
  if (n === 0) return;
  const anglePer = 360 / n;
  selectedFlavors.forEach((flav, i) => {
    const startAngle = offset + i * anglePer;
    const endAngle = startAngle + anglePer;
    const startRad = startAngle * Math.PI / 180;
    const endRad = endAngle * Math.PI / 180;
    const x1 = 50 + 50 * Math.cos(startRad);
    const y1 = 50 + 50 * Math.sin(startRad);
    const x2 = 50 + 50 * Math.cos(endRad);
    const y2 = 50 + 50 * Math.sin(endRad);
    const slice = document.createElement('div');
    slice.className = 'slice';
    const topping = document.createElement('div');
    topping.className = 'topping';
    topping.style.background = flavorColors[flav] || '#ccc';
    topping.style.clipPath = `polygon(50% 50%, ${x1}% ${y1}%, ${x2}% ${y2}%)`;
    slice.appendChild(topping);
    slice.style.transform = `translate(-50%,-50%)`;
    pizzaBase.appendChild(slice);
    requestAnimationFrame(() => {
      slice.style.opacity = '1';
    });
  });
}

/**
 * Atualiza o estado da interface: notas de limite, resumo do pedido e cálculo
 * de preços. Também habilita/desabilita o botão de confirmação.
 */
function updateUI(){
  if(!selectedSize) {
    limitNote.textContent = 'Selecione um tamanho.';
    flavorNote.textContent = 'Escolha os sabores após selecionar o tamanho.';
    document.querySelectorAll('#flavorsList input[type=checkbox]').forEach(cb=>cb.disabled=true);
  } else {
    limitNote.textContent = `Tamanho: ${selectedSize.toUpperCase()} — máximo de ${maxFlavors} sabor(es).`;
    flavorNote.textContent = `Escolha até ${maxFlavors} sabor(es).`;
  }

  // resumo
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const nbIdx = neighborhoodSelect.value;

  let summary = '';
  if(selectedSize) summary += `Tamanho: ${selectedSize.toUpperCase()}\n`;
  if(selectedFlavors.length) summary += `Sabores: ${selectedFlavors.join(', ')}\n`;
  if(name) summary += `Nome: ${name}\n`;
  if(phone) summary += `Telefone: ${phone}\n`;
  if(address) summary += `Endereço: ${address}\n`;
  if(nbIdx!=='') summary += `Bairro: ${neighborhoods[nbIdx].name} (Taxa R$ ${neighborhoods[nbIdx].fee.toFixed(2)})\n`;
  orderSummary.textContent = summary || 'Nenhum pedido montado.';

  // cálculo de preço: base + taxa de entrega (total estimado exibido)
  let basePrice = 0;
  if(selectedSize && sizePrices[selectedSize]) basePrice = sizePrices[selectedSize];
  const fee = (nbIdx!=='' ? neighborhoods[nbIdx].fee : 0);
  const total = basePrice + fee;

  // exibe detalhamento de valores (base, taxa, total)
  if(selectedSize){
    priceBreakdown.textContent = `Preço base: R$ ${basePrice.toFixed(2)} • Taxa entrega: R$ ${fee.toFixed(2)} • Total estimado: R$ ${total.toFixed(2)}`;
  } else {
    priceBreakdown.textContent = '';
  }

  // habilita botão somente se ter tamanho, pelo menos 1 sabor, e dados do cliente
  const canSend = selectedSize && selectedFlavors.length>0 && name && phone && address && nbIdx!=='';
  confirmBtn.disabled = !canSend;
}

function sendWhatsApp(){
  // valida novamente
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const nbIdx = neighborhoodSelect.value;
  if(!selectedSize){alert('Selecione o tamanho.');return}
  if(selectedFlavors.length===0){alert('Escolha pelo menos um sabor.');return}
  if(!name||!phone||!address||nbIdx===''){alert('Preencha todos os dados de entrega.');return}

  const fee = neighborhoods[nbIdx].fee.toFixed(2);
  const basePrice = (sizePrices[selectedSize] ? sizePrices[selectedSize].toFixed(2) : '0.00');
  const totalPrice = (parseFloat(basePrice) + parseFloat(neighborhoods[nbIdx].fee)).toFixed(2);

  let msg = `Olá, gostaria de fazer um pedido:\n`;
  msg += `Tamanho: ${selectedSize.toUpperCase()}\n`;
  msg += `Sabores: ${selectedFlavors.join(', ')}\n`;
  msg += `Nome: ${name}\nTelefone: ${phone}\nEndereço: ${address}\nBairro: ${neighborhoods[nbIdx].name} (Taxa R$ ${fee})\n`;
  msg += `Valor estimado: R$ ${totalPrice} (inclui taxa R$ ${fee}).\n`;
  msg += `Por favor confirmar o valor e o tempo de entrega.`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// event listeners for form fields to update resumo
['name','phone','address'].forEach(id=>{
  document.getElementById(id).addEventListener('input', updateUI);
});
neighborhoodSelect.addEventListener('change', updateUI);

// inicialização
init();
