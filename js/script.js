// Troque o número e o nome do método só aqui.
const WHATSAPP = "5541998824094";   // só números, com 55 na frente
const METODO_NOME = "LUCRO 360°";   // isolado para troca pós-INPI
const MERCADO_PAGO = "https://mpago.la/14SBgW3";

const MENSAGENS = {
  "RAIOX-TOPO": "Oi Anderson, vi a sua página e quero entender o Raio-X da Cozinha.",
  "RAIOX-TRIAGEM": "Oi Anderson, meu faturamento é menor, queria saber o que dá para fazer.",
  "RAIOX-FINAL": "Oi Anderson, quero conversar sobre o Raio-X.",
  "RAIOX-AGENDA": "Oi Anderson, quero marcar o Raio-X da Cozinha."
};

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

// 3. Agendamento: monta o pedido e abre o WhatsApp. Nada fica salvo.
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
    const partes = [escolha.negocio, escolha.dia, escolha.periodo].filter(Boolean);
    resumo.textContent = "Seu pedido: " + partes.join(" · ");
    let texto = MENSAGENS["RAIOX-AGENDA"];
    if (escolha.negocio) texto += " Negócio: " + escolha.negocio + ".";
    if (escolha.dia) texto += " Dia: " + escolha.dia + ".";
    if (escolha.periodo) texto += " Período: " + escolha.periodo + ".";
    botao.href = linkWhats("RAIOX-AGENDA", texto);
  });
}
