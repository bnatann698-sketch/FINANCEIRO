const form = document.getElementById("form-movimentacao");
const resultado = document.getElementById("resultado");

const abrirMenu = document.getElementById("abrirMenu");
const fecharMenu = document.getElementById("fecharMenu");
const menuLateral = document.getElementById("menuLateral");
const overlayMenu = document.getElementById("overlayMenu");

abrirMenu.addEventListener("click", () => {
  menuLateral.classList.add("ativo");
  overlayMenu.classList.add("ativo");
});

fecharMenu.addEventListener("click", () => {
  menuLateral.classList.remove("ativo");
  overlayMenu.classList.remove("ativo");
});

overlayMenu.addEventListener("click", () => {
  menuLateral.classList.remove("ativo");
  overlayMenu.classList.remove("ativo");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  resultado.textContent = "Salvando movimentação...";

  const tipoMovimentacao = document.getElementById("tipoMovimentacao").value;
  const subcategoria = document.getElementById("subcategoria").value;
  const dataMovimentacao = document.getElementById("dataMovimentacao").value;
  const valorMovimentacao = document.getElementById("valorMovimentacao").value;
  const descricaoMovimentacao = document.getElementById("descricaoMovimentacao").value;

  let entradaSaida;

  if (tipoMovimentacao === "entrada") {
    entradaSaida = true;
  } else if (tipoMovimentacao === "saida") {
    entradaSaida = false;
  } else {
    resultado.textContent = "Selecione se a movimentação é entrada ou saída.";
    return;
  }

  const valorNumerico = parseFloat(valorMovimentacao);

  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    resultado.textContent = "Digite um valor válido maior que zero.";
    return;
  }

  const dadosParaSalvar = {
    "ENTRADA/SAIDA": entradaSaida,
    "TIPO": subcategoria,
    "DATA": dataMovimentacao,
    "VALOR": valorNumerico,
    "DESCRIÇÃO": descricaoMovimentacao
  };

  const { error } = await banco
    .from("transacoes")
    .insert([dadosParaSalvar]);

  if (error) {
    console.error("Erro ao salvar:", error);
    resultado.textContent = "Erro ao salvar: " + error.message;
    return;
  }

  resultado.textContent = "Movimentação salva com sucesso.";
  form.reset();
});