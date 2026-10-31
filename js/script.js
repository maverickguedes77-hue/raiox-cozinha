// Troque o número e o nome do método só aqui.
const WHATSAPP = "5541998824094";   // só números, com 55 na frente
const METODO_NOME = "LUCRO 360°";   // isolado para troca pós-INPI
const MERCADO_PAGO = "https://mpago.la/14SBgW3";

const MENSAGENS = {
  "RAIOX-TOPO": "Oi Anderson, vi a sua página e quero entender o Raio-X da Cozinha.",
  "RAIOX-PRECO": "Oi Anderson, quero marcar o Raio-X da Cozinha.",
  "RAIOX-TRIAGEM": "Oi Anderson, meu faturamento é menor, queria saber o que dá para fazer.",
  "RAIOX-FINAL": "Oi Anderson, quero a conversa de dez minutos sobre o Raio-X.",
  "RAIOX-FIXO": "Oi Anderson, vim pela página do Raio-X da Cozinha.",
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

// 2. Botão fixo no celular, só depois da primeira tela
const zapFixo = document.querySelector(".zap-fixo");
const topo = document.getElementById("topo");
if (zapFixo && topo && "IntersectionObserver" in window) {
  new IntersectionObserver(([item]) => {
    zapFixo.classList.toggle("visivel", !item.isIntersecting);
  }).observe(topo);
}

// 3. Agendamento: monta o pedido e abre o WhatsApp. Nada fica salvo.
const agenda = document.getElementById("agenda");
if (agenda) {
  const escolha = { faixa: "", dia: "", periodo: "" };
  const FAIXAS = { acima: "acima de R$ 40 mil" };
  const parte = (id) => document.getElementById(id);
  const mostrar = (id, sim) => { parte(id).hidden = !sim; };

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
    parte("agenda-dias").append(opcao);
    n++;
  }

  function atualizar() {
    const serve = escolha.faixa === "acima";
    const pronto = serve && escolha.dia && escolha.periodo;
    mostrar("resposta-baixo", escolha.faixa === "baixo");
    mostrar("resposta-medio", escolha.faixa === "medio");
    mostrar("etapa-dia", serve);
    mostrar("etapa-periodo", serve);
    mostrar("agenda-envio", pronto);
    mostrar("agenda-pagamento", !escolha.faixa || serve);
    if (pronto) {
      const texto = MENSAGENS["RAIOX-AGENDA"] + " Faturamento: " + FAIXAS.acima + ". Dia: " + escolha.dia + ". Período: " + escolha.periodo + ".";
      parte("botao-envio").href = linkWhats("RAIOX-AGENDA", texto);
    }
  }

  agenda.addEventListener("change", (evento) => {
    escolha[evento.target.name] = evento.target.value;
    atualizar();
  });
  atualizar();
}
