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

function atualizarListaTarefas() {
    // Limpar o conteúdo do tbody
    cabecarioLista.innerHTML = '';
  
    // Verificar se há tarefas para exibir
    if (lista.length === 0) {
      nullMessage.style.display = 'block';
      listaTarefas.style.display = 'none';
      return;
    }
  
    nullMessage.style.display = 'none';
    listaTarefas.style.display = 'table';
  
    const filterBy = document.getElementById('filter-by').value;
    let tarefasFiltradas = [];
  
    if (filterBy === 'todos') {
        tarefasFiltradas = lista;
    } else {
        tarefasFiltradas = lista.filter(tarefa => tarefa.categoria === filterBy);
    }
  
    // Criar as linhas da tabela com as tarefas filtradas
    tarefasFiltradas.forEach((tarefa) => {
        const row = document.createElement('tr');
        const tituloCell = document.createElement('td');
        const descricaoCell = document.createElement('td');
        const dataCell = document.createElement('td');
        const statusCell = document.createElement('td');
        const actionsCell = document.createElement('td');
    
        tituloCell.textContent = tarefa.titulo;
        descricaoCell.textContent = tarefa.descricao;
        dataCell.textContent = tarefa.data;
        statusCell.textContent = tarefa.status;
    
        const completeButton = document.createElement('button');
        completeButton.textContent = 'Concluir';
        completeButton.classList.add('complete-button');
        completeButton.addEventListener('click', () => concluirTarefa(tarefa));
    
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => excluirTarefa(tarefa));
    
        actionsCell.appendChild(completeButton);
        actionsCell.appendChild(deleteButton);
    
        row.appendChild(tituloCell);
        row.appendChild(descricaoCell);
        row.appendChild(dataCell);
        row.appendChild(statusCell);
        row.appendChild(actionsCell);
    
        cabecarioLista.appendChild(row);
      });
  
      if (tarefasFiltradas.length === 0) {
        nullMessage.style.display = 'block';
        listaTarefas.style.display = 'none';
      } else {
          nullMessage.style.display = 'none';
      }
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