// Troque o número e o nome do método só aqui.
const WHATSAPP = "5541998824094";   // só números, com 55 na frente
const METODO_NOME = "LUCRO 360°";   // isolado para troca pós-INPI
const MERCADO_PAGO = "https://mpago.la/14SBgW3";
const PRECO_RAIOX = 397;

const MENSAGENS = {
  "RAIOX-TOPO": "Oi Anderson, vi a sua página e quero entender o Raio-X da Cozinha.",
  "RAIOX-TRIAGEM": "Oi Anderson, meu faturamento é menor, queria saber o que dá para fazer.",
  "RAIOX-FINAL": "Oi Anderson, quero conversar sobre o Raio-X.",
  "RAIOX-FIXO": "Oi Anderson, vim pela página do Raio-X da Cozinha.",
  "RAIOX-AGENDA": "Oi Anderson, quero marcar o Raio-X da Cozinha (R$ 397)."
};

// Monta o pedido de agendamento com o que a pessoa preencheu
function pedidoTexto(e) {
  const negocio = e.negocio ? e.negocio + (e.casa ? " · " + e.casa : "") : "a combinar";
  return [
    "Oi Anderson, quero marcar o Raio-X da Cozinha (R$ 397).",
    "",
    "Nome: " + (e.nome || ""),
    "Negócio: " + negocio,
    "Bairro e cidade: " + (e.bairro || ""),
    "Dia de preferência: " + (e.dia || "a combinar"),
    "Período: " + (e.periodo || "a combinar"),
    "Prefiro resposta por: " + (e.canal || "mensagem no WhatsApp") + (e.canal === "ligação" && e.telefone ? ", no " + e.telefone : ""),
    "",
    "Sei que o horário só fica marcado depois da sua confirmação."
  ].join("\n");
}

function linkWhats(chave, texto) {
  const mensagem = (texto || MENSAGENS[chave]) + " [" + chave + "]";
  return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(mensagem);
}

// Conta da calculadora. Com 1% é a mesma regra da versão anterior: mil reais × 10.
function perdaMensal(milReais, percentual) {
  return Math.round(milReais * 1000 * percentual / 100);
}
function diasParaPagar(perdaPorMes) {
  return Math.round(PRECO_RAIOX / perdaPorMes * 30);
}

const reais = (v) => "R$ " + Math.round(v).toLocaleString("pt-BR");
const porcento = (v) => String(v).replace(".", ",") + "%";

// 1. Links de WhatsApp, pagamento e nome do método
document.querySelectorAll("[data-wa]").forEach((a) => { a.href = linkWhats(a.dataset.wa); });
document.querySelectorAll("[data-pagar]").forEach((a) => { a.href = MERCADO_PAGO; });
document.querySelectorAll("[data-metodo]").forEach((e) => { e.textContent = METODO_NOME; });

// 2. Menu do celular: abre e fecha, fecha com Esc e ao escolher uma seção
const menuBotao = document.querySelector(".menu-botao");
const menu = document.getElementById("menu");
if (menuBotao && menu) {
  const fechar = () => { menu.classList.remove("aberto"); menuBotao.setAttribute("aria-expanded", "false"); };
  menuBotao.addEventListener("click", () => {
    const abrir = !menu.classList.contains("aberto");
    menu.classList.toggle("aberto", abrir);
    menuBotao.setAttribute("aria-expanded", String(abrir));
    if (abrir) menu.querySelector("a").focus();
  });
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) fechar(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("aberto")) { fechar(); menuBotao.focus(); } });
}

// 3. Barra fixa no celular: aparece depois da primeira tela e some quando a agenda está na tela
const barraFixa = document.querySelector(".barra-fixa");
if (barraFixa && "IntersectionObserver" in window) {
  const naTela = new Set();
  const observador = new IntersectionObserver((itens) => {
    itens.forEach((item) => { naTela[item.isIntersecting ? "add" : "delete"](item.target); });
    barraFixa.classList.toggle("visivel", naTela.size === 0);
  });
  ["topo", "agendar", "fechamento"].forEach((id) => { const e = document.getElementById(id); if (e) observador.observe(e); });
}

// 4. Calculadora: faturamento e percentual escolhidos pela pessoa
const calc = document.getElementById("calc");
if (calc) {
  const fat = document.getElementById("calc-fat");
  const faixa = document.getElementById("calc-fat-faixa");
  const pct = document.getElementById("calc-pct");
  const barras = document.getElementById("calc-barras");
  const linha = document.getElementById("calc-linha");
  const linhaTxt = document.getElementById("calc-linha-txt");
  const escrever = (id, texto) => { document.getElementById(id).textContent = texto; };
  const preencher = (el) => { el.style.setProperty("--p", ((el.value - el.min) / (el.max - el.min) * 100) + "%"); };

  function atualizar() {
    let mil = Number(fat.value);
    if (!Number.isFinite(mil) || mil <= 0) mil = 20;
    mil = Math.min(500, Math.max(20, mil));
    const p = Number(pct.value);
    const ponto = perdaMensal(mil, p);
    const dias = diasParaPagar(ponto);
    escrever("calc-pct-txt", porcento(p));
    escrever("calc-mes", reais(ponto));
    escrever("calc-ano", reais(ponto * 12));
    escrever("calc-dias", "Se o Raio-X ajudar a segurar só esse " + porcento(p) + ", ele se paga em " +
      (dias < 1 ? "menos de um dia" : "cerca de " + dias + (dias === 1 ? " dia" : " dias")) + ". É conta, não promessa.");
    // gráfico: perda acumulada em 12 meses contra o preço do Raio-X
    const topo = Math.max(ponto * 12, PRECO_RAIOX * 1.2);
    const largura = 320 / 12;
    let svg = "";
    for (let m = 1; m <= 12; m++) {
      const v = ponto * m;
      const h = Math.max(1, v / topo * 100);
      svg += '<rect x="' + ((m - 1) * largura + 2).toFixed(1) + '" y="' + (110 - h).toFixed(1) + '" width="' + (largura - 4).toFixed(1) + '" height="' + h.toFixed(1) + '"' + (v >= PRECO_RAIOX ? ' class="passou"' : "") + "/>";
    }
    barras.innerHTML = svg;
    const y = (110 - PRECO_RAIOX / topo * 100).toFixed(1);
    linha.setAttribute("d", "M0 " + y + "H320");
    linhaTxt.setAttribute("y", String(Math.max(10, Number(y) - 5)));
    [faixa, pct].forEach(preencher);
  }
  fat.addEventListener("input", () => { if (Number(fat.value) >= 20 && Number(fat.value) <= 200) faixa.value = fat.value; atualizar(); });
  fat.addEventListener("change", () => { const v = Math.min(500, Math.max(20, Number(fat.value) || 20)); fat.value = v; atualizar(); });
  faixa.addEventListener("input", () => { fat.value = faixa.value; atualizar(); });
  pct.addEventListener("input", atualizar);
  calc.addEventListener("submit", (e) => e.preventDefault());
  atualizar();
}

// 5. Leitor do relatório: setas, índice, teclado, contador e página ampliada
const folhas = document.getElementById("folhas");
if (folhas) {
  const paginas = [...folhas.querySelectorAll(".pagina")];
  const indice = [...document.querySelectorAll(".leitor-indice button")];
  const setas = [...document.querySelectorAll(".leitor-seta")];
  const contador = document.getElementById("leitor-atual");
  let atual = 0;
  const marcar = (n) => {
    atual = n;
    contador.textContent = String(n + 1);
    indice.forEach((b, i) => b.setAttribute("aria-current", String(i === n)));
    setas[0].disabled = n === 0;
    setas[1].disabled = n === paginas.length - 1;
    // a moldura acompanha a altura da página da vez, sem buraco embaixo das páginas curtas
    folhas.style.height = (paginas[n].offsetHeight + 26) + "px";
  };
  addEventListener("resize", () => marcar(atual));
  const ir = (n) => {
    n = Math.max(0, Math.min(paginas.length - 1, n));
    const caixa = folhas.getBoundingClientRect(), pag = paginas[n].getBoundingClientRect();
    folhas.scrollTo({ left: folhas.scrollLeft + pag.left - caixa.left - (caixa.width - pag.width) / 2 });
    marcar(n);
  };
  indice.forEach((b, i) => b.addEventListener("click", () => ir(i)));
  setas.forEach((b) => b.addEventListener("click", () => ir(atual + Number(b.dataset.passo))));
  folhas.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); ir(atual + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); ir(atual - 1); }
  });
  // ao deslizar com o dedo, descobre a página que ficou no meio
  let espera = 0;
  folhas.addEventListener("scroll", () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      const meio = folhas.getBoundingClientRect().left + folhas.clientWidth / 2;
      let melhor = 0, menor = Infinity;
      paginas.forEach((p, i) => { const r = p.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - meio); if (d < menor) { menor = d; melhor = i; } });
      if (melhor !== atual) marcar(melhor);
    }, 90);
  }, { passive: true });
  marcar(0);

  const dialogo = document.getElementById("ampliada");
  const corpo = document.getElementById("ampliada-corpo");
  const ampliar = document.getElementById("leitor-ampliar");
  if (dialogo && typeof dialogo.showModal === "function") {
    ampliar.addEventListener("click", () => {
      const copia = paginas[atual].cloneNode(true);
      copia.removeAttribute("aria-label");
      corpo.replaceChildren(copia);
      document.getElementById("ampliada-titulo").textContent = "Página " + (atual + 1) + " de " + paginas.length + " · demonstração";
      dialogo.showModal();
      corpo.scrollTop = 0;
    });
    document.getElementById("ampliada-fechar").addEventListener("click", () => dialogo.close());
    dialogo.addEventListener("click", (e) => { if (e.target === dialogo) dialogo.close(); });
    dialogo.addEventListener("close", () => ampliar.focus());
  } else if (ampliar) {
    ampliar.hidden = true;
  }
}

// 6. Agendamento: valida, monta o pedido e abre o WhatsApp. Nada fica salvo.
const agenda = document.getElementById("agenda");
if (agenda) {
  // Próximos 8 dias, de segunda a sábado, começando em dois dias
  const formato = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
  const lista = document.getElementById("agenda-dias");
  const dia = new Date();
  dia.setDate(dia.getDate() + 2);
  for (let n = 0; n < 8; dia.setDate(dia.getDate() + 1)) {
    if (dia.getDay() === 0) continue;
    const nome = formato.format(dia).replace(".", "");
    const opcao = document.createElement("label");
    opcao.className = "opcao";
    opcao.innerHTML = '<input type="radio" name="dia" value="' + nome + '"' + (n === 0 ? " required" : "") + "><span>" + nome + "</span>";
    lista.append(opcao);
    n++;
  }

  const regras = [
    { campo: "nome", texto: true, msg: "Escreva o seu nome." },
    { campo: "negocio", msg: "Escolha o tipo de estabelecimento." },
    { campo: "bairro", texto: true, msg: "Escreva o bairro e a cidade." },
    { campo: "dia", msg: "Escolha um dia de preferência." },
    { campo: "periodo", msg: "Escolha o período." },
    { campo: "canal", msg: "Escolha como prefere que eu responda." },
    { campo: "telefone", msg: "Escreva o telefone com DDD para eu ligar.", quando: () => valor("canal") === "ligação" }
  ];
  // telefone só aparece (e só é obrigatório) quando a resposta for por ligação
  const campoTelefone = document.getElementById("campo-telefone");
  const digitos = (t) => t.replace(/\D/g, "").length;
  const caixaErros = document.getElementById("agenda-erros");
  const valor = (nome) => {
    const el = agenda.elements[nome];
    return (el && typeof el.value === "string" ? el.value : "").trim();
  };
  const bloco = (nome) => agenda.querySelector('[data-campo="' + nome + '"]');
  const alvo = (nome) => agenda.querySelector('[name="' + nome + '"]');
  const marcarErro = (r, errado) => {
    const b = bloco(r.campo);
    b.classList.toggle("com-erro", errado);
    b.querySelector(".campo-erro").textContent = errado ? r.msg : "";
    agenda.querySelectorAll('[name="' + r.campo + '"]').forEach((el) => {
      if (errado) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
    });
  };
  const invalido = (r) => {
    if (r.quando && !r.quando()) return false;
    if (r.campo === "telefone") { const d = digitos(valor("telefone")); return d < 10 || d > 13; }
    return r.texto ? valor(r.campo).length < 2 : !valor(r.campo);
  };

  agenda.addEventListener("input", (e) => {
    const r = regras.find((x) => x.campo === e.target.name);
    if (r && bloco(r.campo).classList.contains("com-erro") && !invalido(r)) marcarErro(r, false);
  });
  agenda.addEventListener("change", (e) => {
    if (e.target.name === "canal") {
      const ligar = valor("canal") === "ligação";
      campoTelefone.hidden = !ligar;
      document.getElementById("f-telefone").required = ligar;
      if (!ligar) marcarErro(regras.find((x) => x.campo === "telefone"), false);
    }
    const r = regras.find((x) => x.campo === e.target.name);
    if (r && !invalido(r)) marcarErro(r, false);
    if (!caixaErros.hidden && regras.every((x) => !invalido(x))) caixaErros.hidden = true;
  });

  agenda.addEventListener("submit", (e) => {
    e.preventDefault();
    const erros = regras.filter(invalido);
    regras.forEach((r) => marcarErro(r, erros.includes(r)));
    if (erros.length) {
      const ul = caixaErros.querySelector("ul");
      ul.replaceChildren(...erros.map((r) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#" + (alvo(r.campo).id || "agenda");
        a.textContent = r.msg;
        a.addEventListener("click", (ev) => { ev.preventDefault(); alvo(r.campo).focus(); });
        li.append(a);
        return li;
      }));
      caixaErros.hidden = false;
      caixaErros.focus();
      return;
    }
    caixaErros.hidden = true;
    const dados = {};
    ["nome", "casa", "negocio", "bairro", "dia", "periodo", "canal", "telefone"].forEach((n) => { dados[n] = valor(n); });
    const link = linkWhats("RAIOX-AGENDA", pedidoTexto(dados));
    const aba = window.open(link, "_blank", "noopener");
    if (!aba) window.location.href = link;
  });
}

// 7. Visita interativa: o boneco anda pela rota até a parada escolhida
const planta = document.querySelector(".planta svg");
if (planta && planta.querySelector("#boneco")) {
  const rota = planta.querySelector(".planta-rastro");
  const feito = planta.querySelector("#planta-feito");
  const boneco = planta.querySelector("#boneco");
  const total = rota.getTotalLength();
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const marcas = [...planta.querySelectorAll(".parada")];
  const botoes = [...document.querySelectorAll(".rota-legenda button")];
  const texto = (id, valor) => { document.getElementById(id).textContent = valor; };
  feito.style.strokeDasharray = total;
  // onde cada parada fica na rota, sempre depois da anterior
  const posicao = [];
  let inicio = 0;
  marcas.forEach((m) => {
    const [x, y] = m.dataset.xy.split(" ").map(Number);
    let melhor = inicio, menor = Infinity;
    for (let s = inicio; s <= total; s += 2) {
      const p = rota.getPointAtLength(s);
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < menor) { menor = d; melhor = s; }
      if (d < 4) break;
    }
    posicao.push(melhor);
    inicio = melhor;
  });
  let atual = 0, quadro = 0, passeio = 0;
  const colocar = (s) => {
    const p = rota.getPointAtLength(s);
    boneco.setAttribute("transform", "translate(" + p.x + " " + p.y + ")");
    feito.style.strokeDashoffset = total - s;
  };
  colocar(0);
  function andar(destino, pronto) {
    cancelAnimationFrame(quadro);
    const de = atual, dur = calmo ? 0 : Math.min(2600, Math.abs(destino - de) * 3 + 300), t0 = performance.now();
    boneco.classList.add("andando");
    const passo = (t) => {
      const k = dur ? Math.min(1, (t - t0) / dur) : 1;
      atual = de + (destino - de) * (k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
      colocar(atual);
      if (k < 1) quadro = requestAnimationFrame(passo);
      else { boneco.classList.remove("andando"); if (pronto) pronto(); }
    };
    quadro = requestAnimationFrame(passo);
  }
  function mostrar(n) {
    const det = botoes[n].parentElement.querySelector(".rota-detalhe").children;
    texto("rota-rotulo", "Parada " + (n + 1) + " · " + botoes[n].querySelector("span").textContent);
    texto("rota-titulo", det[0].textContent);
    texto("rota-faz", det[1].textContent);
    document.getElementById("rota-recebe").innerHTML = det[2].innerHTML;
    marcas.forEach((m, i) => { m.classList.toggle("ativa", i === n); m.classList.toggle("feita", i < n); });
    botoes.forEach((b, i) => b.setAttribute("aria-pressed", String(i === n)));
  }
  const ir = (n) => { clearTimeout(passeio); mostrar(n); andar(posicao[n]); };
  marcas.forEach((m, i) => {
    m.addEventListener("click", () => ir(i));
    m.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ir(i); } });
  });
  botoes.forEach((b, i) => b.addEventListener("click", () => ir(i)));
  document.getElementById("rota-tour").addEventListener("click", () => {
    let n = 0;
    atual = 0;
    const seguir = () => { mostrar(n); andar(posicao[n]); if (++n < marcas.length) passeio = setTimeout(seguir, 4200); };
    clearTimeout(passeio);
    seguir();
  });
}

// 8. Entrada suave dos blocos ao rolar (some com movimento reduzido)
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const alvos = document.querySelectorAll("main .bloco .cabeca, .problema-grade, .area, .calc, .exemplo, .leitor, .fase, .visita, .investiga, .entregas, .antes-depois, .escada, .quem-id, .quem-texto, .investimento, .regras, .nao, .agenda-lado, .agenda, .perguntas");
  const vigia = new IntersectionObserver((itens) => {
    itens.forEach((item) => { if (item.isIntersecting) { item.target.classList.add("visto"); vigia.unobserve(item.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  alvos.forEach((a) => { a.classList.add("revelar"); vigia.observe(a); });
}
