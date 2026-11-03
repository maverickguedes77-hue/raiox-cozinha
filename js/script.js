// Troque o número e o nome do método só aqui.
const WHATSAPP = "5541998824094";   // só números, com 55 na frente
const METODO_NOME = "LUCRO 360°";   // isolado para troca pós-INPI
const MERCADO_PAGO = "https://mpago.la/14SBgW3";

const MENSAGENS = {
  "RAIOX-TOPO": "Oi Anderson, vi a sua página e quero entender o Raio-X da Cozinha.",
  "RAIOX-TRIAGEM": "Oi Anderson, meu faturamento é menor, queria saber o que dá para fazer.",
  "RAIOX-FINAL": "Oi Anderson, quero conversar sobre o Raio-X.",
  "RAIOX-FIXO": "Oi Anderson, vim pela página do Raio-X da Cozinha.",
  "RAIOX-AGENDA": pedidoTexto({})
};

function pedidoTexto(e) {
  return [
    "Oi Anderson, quero marcar o Raio-X da Cozinha (R$ 397).",
    "",
    "Negócio: " + (e.negocio || "a combinar"),
    "Dia de preferência: " + (e.dia || "a combinar"),
    "Período: " + (e.periodo || "a combinar"),
    "",
    "Nome do negócio: ",
    "Bairro: ",
    "",
    "Sei que o horário só fica marcado depois da sua confirmação."
  ].join("\n");
}

function linkWhats(chave, texto) {
  const mensagem = (texto || MENSAGENS[chave]) + " [" + chave + "]";
  return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(mensagem);
}

// 1. Links de WhatsApp, pagamento e nome do método
document.querySelectorAll("[data-wa]").forEach((a) => { a.href = linkWhats(a.dataset.wa); });
document.querySelectorAll("[data-pagar]").forEach((a) => { a.href = MERCADO_PAGO; });
document.querySelectorAll("[data-metodo]").forEach((e) => { e.textContent = METODO_NOME; });

// 2. Barra fixa no celular: aparece depois da primeira tela e some quando a agenda está na tela
const barraFixa = document.querySelector(".barra-fixa");
if (barraFixa && "IntersectionObserver" in window) {
  const naTela = new Set();
  const observador = new IntersectionObserver((itens) => {
    itens.forEach((item) => { naTela[item.isIntersecting ? "add" : "delete"](item.target); });
    barraFixa.classList.toggle("visivel", naTela.size === 0);
  });
  ["topo", "agendar"].forEach((id) => observador.observe(document.getElementById(id)));
}

// 3. Calculadora: quanto vale 1% do que a casa vende
const calc = document.getElementById("calc-fat");
if (calc) {
  const reais = (v) => "R$ " + v.toLocaleString("pt-BR");
  const escrever = (id, texto) => { document.getElementById(id).textContent = texto; };
  calc.addEventListener("input", () => {
    const mil = Number(calc.value);
    const ponto = mil * 10;
    escrever("calc-fat-txt", "R$ " + mil + " mil");
    escrever("calc-mes", reais(ponto));
    escrever("calc-ano", reais(ponto * 12));
    escrever("calc-dias", "Se o Raio-X ajudar a segurar só esse 1%, ele se paga em cerca de " + Math.round(397 / ponto * 30) + " dias. É conta, não promessa.");
  });
}

// 4. Agendamento: monta o pedido e abre o WhatsApp. Nada fica salvo.
const agenda = document.getElementById("agenda");
if (agenda) {
  const escolha = { negocio: "", dia: "", periodo: "" };
  const resumo = document.getElementById("agenda-resumo");
  const botao = document.getElementById("botao-envio");

  // Próximos 8 dias, de segunda a sábado, começando em dois dias
  const formato = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
  const dia = new Date();
  dia.setDate(dia.getDate() + 2);
  for (let n = 0; n < 8; dia.setDate(dia.getDate() + 1)) {
    if (dia.getDay() === 0) continue;
    const nome = formato.format(dia).replace(".", "");
    const opcao = document.createElement("label");
    opcao.className = "opcao";
    opcao.innerHTML = '<input type="radio" name="dia" value="' + nome + '"><span>' + nome + "</span>";
    document.getElementById("agenda-dias").append(opcao);
    n++;
  }

  agenda.addEventListener("change", (evento) => {
    escolha[evento.target.name] = evento.target.value;
    resumo.querySelectorAll("[data-campo]").forEach((campo) => {
      const valor = escolha[campo.dataset.campo];
      campo.textContent = valor || "falta escolher";
      campo.classList.toggle("escolhido", Boolean(valor));
    });
    resumo.classList.toggle("completo", Boolean(escolha.negocio && escolha.dia && escolha.periodo));
    botao.href = linkWhats("RAIOX-AGENDA", pedidoTexto(escolha));
  });
}

// 5. Visita interativa: o boneco anda pela rota até a parada escolhida
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
