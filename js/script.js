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
