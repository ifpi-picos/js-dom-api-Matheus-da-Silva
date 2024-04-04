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

// Parâmetros da API
const apiKey = 'a7c01d087b8508ae8cfb3b851fd8527107c8b878';
const url = 'https://api.todoist.com/rest/v2/tasks';

function cadastrarTarefa(event) {
    event.preventDefault();
  
    const titulo = tituloInput.value;
    const descricao = descricaoInput.value;
    const categoria = categoriaInput.value;
    const data = dataInput.value;
  
    const tarefa = { titulo, descricao, categoria, data, status: 'pendente'};
  
    lista.push(tarefa);

    // Enviar tarefa para a API
    const options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
          content: titulo,
          description: descricao,
          due_date: data,
          priority: 1,
          labels: [categoria]
      })
  };

  fetch(url, options)
      .then(response => {
          if (!response.ok) {
              throw new Error('Erro ao cadastrar tarefa.');
          }
          return response.json();
      })
      .then(data => {
          console.log('Tarefa cadastrada:', data);
          tarefa.id = data.id;
      })
      .catch(error => {
          console.error('Ocorreu um erro:', error);
      });
  
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

const filterBySelect = document.getElementById('filter-by');
filterBySelect.addEventListener('change', atualizarListaTarefas);

function concluirTarefa(tarefa) {
    tarefa.status = 'concluída';
    const tarefaId = tarefa.id;

    // Concluir tarefa na API
    const options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
          id: tarefaId
      })
  };

  const urlUpdate = `${url}/${tarefaId}/close`; // URL com o parametro close para concluir a tarefa

  fetch(urlUpdate, options)
      .then(response => {
          if (!response.ok) {
              throw new Error('Erro ao concluir tarefa.');
          }
          console.log('Tarefa concluída com sucesso no Todoist.');
      })
      .catch(error => {
          console.error('Ocorreu um erro:', error);
      });

    atualizarListaTarefas();
    saveLocalStorage();
}

function excluirTarefa(tarefa) {
  lista = lista.filter((item) => item !== tarefa);
  
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

// Evento de submit ao formulário
tarefaForm.addEventListener('submit', cadastrarTarefa);