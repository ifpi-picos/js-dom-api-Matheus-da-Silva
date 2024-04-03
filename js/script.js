const tarefaForm = document.getElementById('form-tarefa');
const tituloInput = document.getElementById('titulo');
const descricaoInput = document.getElementById('descricao');
const categoriaInput = document.getElementById('categoria');
const dataInput = document.getElementById('data');
const listaTarefas = document.getElementById('lista-tarefas');
const cabecarioLista = document.getElementById('lista-tarefas-body');
const nullMessage = document.getElementById('null');

// Array para armazenar as tarefas
let lista = [];

// Carregar os tarefas do Local Storage ao carregar a página
loadLocalStorage();

function cadastrarTarefa(event) {
    event.preventDefault();
  
    const titulo = tituloInput.value;
    const descricao = descricaoInput.value;
    const categoria = categoriaInput.value;
    const data = dataInput.value;
  
    const tarefa = { titulo, descricao, categoria, data, status: 'pendente'};
  
    lista.push(tarefa);
  
    // Limpar os campos de entrada
    tituloInput.value = '';
    descricaoInput.value = '';
    dataInput.value = '';
  
    atualizarListaTarefas();
    saveLocalStorage();
}

function saveLocalStorage() {
    localStorage.setItem('lista', JSON.stringify(lista));
  }
  
  function loadLocalStorage() {
    const savedlista = localStorage.getItem('lista');
    if (savedlista) {
      lista = JSON.parse(savedlista);
      atualizarListaTarefas();
    }
}