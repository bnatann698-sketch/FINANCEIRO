const abrirMenu = document.getElementById("abrirMenu");
const fecharMenu = document.getElementById("fecharMenu");
const menuLateral = document.getElementById("menuLateral");
const overlayMenu = document.getElementById("overlayMenu");

const dataInicioInput = document.getElementById("dataInicio");
const dataFimInput = document.getElementById("dataFim");
const btnFiltrar = document.getElementById("btnFiltrar");

const cardEntrada = document.getElementById("cardEntrada");
const cardSaida = document.getElementById("cardSaida");
const cardCartao = document.getElementById("cardCartao");
const cardGasolina = document.getElementById("cardGasolina");
const cardMercado = document.getElementById("cardMercado");
const cardInvestimento = document.getElementById("cardInvestimento");
const cardSaldo = document.getElementById("cardSaldo");

const relatorioMovimentacoes = document.getElementById("relatorioMovimentacoes");
const resumoPeriodo = document.getElementById("resumoPeriodo");

let graficoBarrasVerticais = null;
let graficoLinhaArea = null;
let graficoPizzaSaidas = null;
let graficoViloes = null;
let graficoCartaoLinha = null;

if (abrirMenu) {
  abrirMenu.addEventListener("click", () => {
    menuLateral.classList.add("ativo");
    overlayMenu.classList.add("ativo");
  });
}

if (fecharMenu) {
  fecharMenu.addEventListener("click", () => {
    menuLateral.classList.remove("ativo");
    overlayMenu.classList.remove("ativo");
  });
}

if (overlayMenu) {
  overlayMenu.addEventListener("click", () => {
    menuLateral.classList.remove("ativo");
    overlayMenu.classList.remove("ativo");
  });
}

if (btnFiltrar) {
  btnFiltrar.addEventListener("click", () => {
    carregarDashboard();
  });
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarData(data) {
  if (!data) return "-";
  const partes = String(data).split("-");
  if (partes.length !== 3) return String(data);
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function normalizarTexto(texto) {
  return String(texto || "").trim().toUpperCase();
}

function destruirGraficos() {
  const graficos = [
    graficoBarrasVerticais,
    graficoLinhaArea,
    graficoPizzaSaidas,
    graficoViloes,
    graficoCartaoLinha
  ];

  graficos.forEach((grafico) => {
    if (grafico) {
      grafico.destroy();
    }
  });

  graficoBarrasVerticais = null;
  graficoLinhaArea = null;
  graficoPizzaSaidas = null;
  graficoViloes = null;
  graficoCartaoLinha = null;
}

function obterPeriodoTexto() {
  const inicio = dataInicioInput.value;
  const fim = dataFimInput.value;

  if (inicio && fim) {
    return `Período analisado: ${formatarData(inicio)} até ${formatarData(fim)}.`;
  }

  if (inicio && !fim) {
    return `Período analisado: a partir de ${formatarData(inicio)}.`;
  }

  if (!inicio && fim) {
    return `Período analisado: até ${formatarData(fim)}.`;
  }

  return "Exibindo todas as movimentações cadastradas.";
}

function opcoesPadraoGraficos() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    resizeDelay: 200,
    plugins: {
      legend: {
        labels: {
          color: "#d8fff1"
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#53bfff",
          maxRotation: 0,
          autoSkip: true
        },
        grid: {
          color: "rgba(83, 191, 255, 0.08)"
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#53bfff"
        },
        grid: {
          color: "rgba(83, 191, 255, 0.08)"
        }
      }
    }
  };
}

function preencherCards(movimentacoes) {
  let totalEntrada = 0;
  let totalSaida = 0;
  let totalCartao = 0;
  let totalGasolina = 0;
  let totalMercado = 0;
  let totalInvestimento = 0;

  movimentacoes.forEach((item) => {
    const valor = Number(item["VALOR"] || 0);
    const ehEntrada = item["ENTRADA/SAIDA"] === true;
    const tipo = normalizarTexto(item["TIPO"]);

    if (ehEntrada) {
      totalEntrada += valor;
    } else {
      totalSaida += valor;
    }

    if (tipo === "CARTÃO DE CREDITO" || tipo === "CARTAO DE CREDITO") {
      totalCartao += valor;
    }

    if (tipo === "GASOLINA") {
      totalGasolina += valor;
    }

    if (tipo === "MERCADO") {
      totalMercado += valor;
    }

    if (tipo === "INVESTIMENTOS" || tipo === "INVESTIMENTO") {
      totalInvestimento += valor;
    }
  });

  const saldo = totalEntrada - totalSaida;

  cardEntrada.textContent = formatarMoeda(totalEntrada);
  cardSaida.textContent = formatarMoeda(totalSaida);
  cardCartao.textContent = formatarMoeda(totalCartao);
  cardGasolina.textContent = formatarMoeda(totalGasolina);
  cardMercado.textContent = formatarMoeda(totalMercado);
  cardInvestimento.textContent = formatarMoeda(totalInvestimento);
  cardSaldo.textContent = formatarMoeda(saldo);
}

function agruparPorData(movimentacoes) {
  const mapa = {};

  movimentacoes.forEach((item) => {
    const data = item["DATA"];
    const valor = Number(item["VALOR"] || 0);
    const ehEntrada = item["ENTRADA/SAIDA"] === true;
    const tipo = normalizarTexto(item["TIPO"]);

    if (!data) return;

    if (!mapa[data]) {
      mapa[data] = {
        entradas: 0,
        saidas: 0,
        cartao: 0
      };
    }

    if (ehEntrada) {
      mapa[data].entradas += valor;
    } else {
      mapa[data].saidas += valor;
    }

    if (tipo === "CARTÃO DE CREDITO" || tipo === "CARTAO DE CREDITO") {
      mapa[data].cartao += valor;
    }
  });

  return mapa;
}

function criarGraficoBarrasVerticais(movimentacoes) {
  const canvas = document.getElementById("graficoBarrasVerticais");
  if (!canvas) return;

  let entradas = 0;
  let saidas = 0;

  movimentacoes.forEach((item) => {
    const valor = Number(item["VALOR"] || 0);
    if (item["ENTRADA/SAIDA"] === true) {
      entradas += valor;
    } else {
      saidas += valor;
    }
  });

  graficoBarrasVerticais = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Entradas", "Saídas"],
      datasets: [
        {
          label: "Valor",
          data: [entradas, saidas],
          backgroundColor: [
            "rgba(0, 255, 170, 0.65)",
            "rgba(0, 140, 255, 0.65)"
          ],
          borderColor: [
            "rgba(0, 255, 170, 1)",
            "rgba(0, 140, 255, 1)"
          ],
          borderWidth: 1.5,
          borderRadius: 8
        }
      ]
    },
    options: opcoesPadraoGraficos()
  });
}

function criarGraficoLinhaArea(movimentacoes) {
  const canvas = document.getElementById("graficoLinhaArea");
  if (!canvas) return;

  const agrupado = agruparPorData(movimentacoes);
  const datas = Object.keys(agrupado).sort();
  const entradas = datas.map((data) => agrupado[data].entradas);
  const saidas = datas.map((data) => agrupado[data].saidas);

  graficoLinhaArea = new Chart(canvas, {
    type: "line",
    data: {
      labels: datas.map(formatarData),
      datasets: [
        {
          label: "Entradas",
          data: entradas,
          borderColor: "rgba(0, 255, 170, 1)",
          backgroundColor: "rgba(0, 255, 170, 0.16)",
          fill: true,
          tension: 0.35
        },
        {
          label: "Saídas",
          data: saidas,
          borderColor: "rgba(0, 140, 255, 1)",
          backgroundColor: "rgba(0, 140, 255, 0.14)",
          fill: true,
          tension: 0.35
        }
      ]
    },
    options: opcoesPadraoGraficos()
  });
}

function criarGraficoPizzaSaidas(movimentacoes) {
  const canvas = document.getElementById("graficoPizzaSaidas");
  if (!canvas) return;

  const categorias = {
    "SAIDA FIXA": 0,
    "SAIDA VARIAVEL": 0,
    "GASOLINA": 0,
    "MERCADO": 0,
    "CARTÃO DE CREDITO": 0
  };

  movimentacoes.forEach((item) => {
    const ehEntrada = item["ENTRADA/SAIDA"] === true;
    const tipo = normalizarTexto(item["TIPO"]);
    const valor = Number(item["VALOR"] || 0);

    if (ehEntrada) return;

    if (tipo === "SAIDA FIXA") categorias["SAIDA FIXA"] += valor;
    if (tipo === "SAIDA VARIAVEL") categorias["SAIDA VARIAVEL"] += valor;
    if (tipo === "GASOLINA") categorias["GASOLINA"] += valor;
    if (tipo === "MERCADO") categorias["MERCADO"] += valor;
    if (tipo === "CARTÃO DE CREDITO" || tipo === "CARTAO DE CREDITO") {
      categorias["CARTÃO DE CREDITO"] += valor;
    }
  });

  graficoPizzaSaidas = new Chart(canvas, {
    type: "pie",
    data: {
      labels: Object.keys(categorias),
      datasets: [
        {
          data: Object.values(categorias),
          backgroundColor: [
            "rgba(0, 255, 170, 0.75)",
            "rgba(0, 140, 255, 0.75)",
            "rgba(40, 180, 255, 0.70)",
            "rgba(0, 220, 190, 0.70)",
            "rgba(90, 120, 255, 0.70)"
          ],
          borderColor: "#061018",
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      resizeDelay: 200,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#d8fff1",
            padding: 16,
            boxWidth: 14
          }
        }
      }
    }
  });
}

function criarGraficoViloes(movimentacoes) {
  const canvas = document.getElementById("graficoViloes");
  if (!canvas) return;

  const totais = {
    "CARTÃO DE CRÉDITO": 0,
    "MERCADO": 0,
    "GASOLINA": 0
  };

  movimentacoes.forEach((item) => {
    const tipo = normalizarTexto(item["TIPO"]);
    const valor = Number(item["VALOR"] || 0);

    if (tipo === "CARTÃO DE CREDITO" || tipo === "CARTAO DE CREDITO") {
      totais["CARTÃO DE CRÉDITO"] += valor;
    }

    if (tipo === "MERCADO") {
      totais["MERCADO"] += valor;
    }

    if (tipo === "GASOLINA") {
      totais["GASOLINA"] += valor;
    }
  });

  graficoViloes = new Chart(canvas, {
    type: "bar",
    data: {
      labels: Object.keys(totais),
      datasets: [
        {
          label: "Valor",
          data: Object.values(totais),
          backgroundColor: [
            "rgba(90, 120, 255, 0.75)",
            "rgba(0, 220, 190, 0.75)",
            "rgba(0, 140, 255, 0.75)"
          ],
          borderColor: [
            "rgba(90, 120, 255, 1)",
            "rgba(0, 220, 190, 1)",
            "rgba(0, 140, 255, 1)"
          ],
          borderWidth: 1.5,
          borderRadius: 8
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      resizeDelay: 200,
      plugins: {
        legend: {
          labels: {
            color: "#d8fff1"
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: "#53bfff"
          },
          grid: {
            color: "rgba(83, 191, 255, 0.08)"
          }
        },
        y: {
          ticks: {
            color: "#53bfff"
          },
          grid: {
            color: "rgba(83, 191, 255, 0.08)"
          }
        }
      }
    }
  });
}

function criarGraficoCartaoLinha(movimentacoes) {
  const canvas = document.getElementById("graficoCartaoLinha");
  if (!canvas) return;

  const agrupado = agruparPorData(movimentacoes);
  const datas = Object.keys(agrupado).sort();
  const cartao = datas.map((data) => agrupado[data].cartao);

  graficoCartaoLinha = new Chart(canvas, {
    type: "line",
    data: {
      labels: datas.map(formatarData),
      datasets: [
        {
          label: "Uso do cartão",
          data: cartao,
          borderColor: "rgba(90, 120, 255, 1)",
          backgroundColor: "rgba(90, 120, 255, 0.16)",
          fill: true,
          tension: 0.35
        }
      ]
    },
    options: opcoesPadraoGraficos()
  });
}

function montarRelatorio(movimentacoes) {
  if (!movimentacoes.length) {
    relatorioMovimentacoes.innerHTML = `<p class="carregando">Nenhuma movimentação encontrada para este período.</p>`;
    return;
  }

  const html = movimentacoes
    .slice()
    .sort((a, b) => new Date(b["DATA"]) - new Date(a["DATA"]))
    .map((item) => {
      const ehEntrada = item["ENTRADA/SAIDA"] === true;
      const badgeClass = ehEntrada ? "badge-entrada" : "badge-saida";
      const badgeTexto = ehEntrada ? "ENTRADA" : "SAÍDA";

      return `
        <div class="item-relatorio">
          <div>${formatarData(item["DATA"])}</div>
          <div><span class="tipo-badge ${badgeClass}">${badgeTexto}</span></div>
          <div>${item["DESCRIÇÃO"] || "Sem descrição"}</div>
          <div>${item["TIPO"] || "-"}</div>
          <div class="valor">${formatarMoeda(item["VALOR"])}</div>
        </div>
      `;
    })
    .join("");

  relatorioMovimentacoes.innerHTML = html;
}

async function buscarMovimentacoes() {
  try {
    let query = banco
      .from("transacoes")
      .select("*")
      .order("DATA", { ascending: true });

    const dataInicio = dataInicioInput.value;
    const dataFim = dataFimInput.value;

    if (dataInicio) {
      query = query.gte("DATA", dataInicio);
    }

    if (dataFim) {
      query = query.lte("DATA", dataFim);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar movimentações:", error);
      return [];
    }

    return data || [];
  } catch (erro) {
    console.error("Erro inesperado ao buscar movimentações:", erro);
    return [];
  }
}

async function carregarDashboard() {
  try {
    resumoPeriodo.textContent = "Carregando dados do período...";
    relatorioMovimentacoes.innerHTML = `<p class="carregando">Carregando movimentações...</p>`;

    const movimentacoes = await buscarMovimentacoes();

    resumoPeriodo.textContent = obterPeriodoTexto();

    preencherCards(movimentacoes);
    montarRelatorio(movimentacoes);

    destruirGraficos();

    criarGraficoBarrasVerticais(movimentacoes);
    criarGraficoLinhaArea(movimentacoes);
    criarGraficoPizzaSaidas(movimentacoes);
    criarGraficoViloes(movimentacoes);
    criarGraficoCartaoLinha(movimentacoes);
  } catch (erro) {
    console.error("Erro ao carregar dashboard:", erro);
    resumoPeriodo.textContent = "Erro ao carregar o dashboard.";
    relatorioMovimentacoes.innerHTML = `<p class="carregando">Ocorreu um erro ao carregar os dados.</p>`;
  }
}

function definirPeriodoInicial() {
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  dataInicioInput.value = primeiroDia.toISOString().split("T")[0];
  dataFimInput.value = hoje.toISOString().split("T")[0];
}

definirPeriodoInicial();
carregarDashboard();