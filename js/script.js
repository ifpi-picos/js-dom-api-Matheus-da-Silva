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

// Verificar a autenticação ao carregar a página
verificarAutenticacao();

// Carregar os tarefas do Local Storage ao carregar a página
loadLocalStorage();

// Parâmetros da API
const url = 'https://api.todoist.com/rest/v2/tasks';

// Variáveis globais para armazenar o estado da autenticação
let accessToken = null;
let isAuthenticated = false;

function solicitarAutorizacaoOAuth() {
    const clientID = '7b81067ab59f4391a6113fb64c89ce28';
    const scope1 = 'task:add';
    const scope2 = 'data:delete';
    const scope3 = 'data:read';
    const scope4 = 'data:read_write';
    const scope = `${scope1},${scope2},${scope3},${scope4}`; 
    const state = '78678868685856';

    const urlAutorizacao = `https://todoist.com/oauth/authorize?client_id=${clientID}&scope=${scope}&state=${state}`;

    // Redirecionar o usuário para a URL de autorização
    window.location.href = urlAutorizacao;
}

async function trocarCodigoPorAccessToken(codigo) {
    const clientID = '7b81067ab59f4391a6113fb64c89ce28';
    const clientSecret = '9c034aadafb140bf955fdeff8522fe37';
    const redirectURI = 'https://matheusgodzilla.github.io/teste-to-do/';

    const urlTrocaToken = 'https://todoist.com/oauth/access_token';

    const parametros = {
        client_id: clientID,
        client_secret: clientSecret,
        code: codigo,
        redirect_uri: redirectURI
    };

    try {
        const resposta = await fetch(urlTrocaToken, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(parametros)
        });

        if (!resposta.ok) {
            throw new Error('Erro ao trocar código por token de acesso');
        }

        const dados = await resposta.json();
        accessToken = dados.access_token;
        isAuthenticated = true;

        localStorage.setItem('accessToken', accessToken);

        console.log('Token de acesso obtido:', accessToken);
    } catch (erro) {
        console.error('Ocorreu um erro ao trocar código por token de acesso:', erro);
    }
}

function verificarAutenticacao() {
    const urlAtual = new URL(window.location.href);
    const codigo = urlAtual.searchParams.get('code');

    if (codigo) {
        trocarCodigoPorAccessToken(codigo);
    } else {
        alert('Usuário não autenticado. Redirecionando para a página de autenticação para logar no Todoist.');
        solicitarAutorizacaoOAuth();
    }
}

async function fazerChamadaAPI(url, options) {
    if (!isAuthenticated) {
        console.error('Usuário não autenticado');
        return;
    }

    options.headers.Authorization = `Bearer ${accessToken}`;

    try {
        const resposta = await fetch(url, options);
        return resposta.json();
    } catch (erro) {
        console.error('Ocorreu um erro ao fazer chamada à API:', erro);
    }
}

function cadastrarTarefa(event) {
    event.preventDefault();
  
    const titulo = tituloInput.value;
    const descricao = descricaoInput.value;
    const categoria = categoriaInput.value;
    const data = dataInput.value;
  
    const tarefa = {titulo, descricao, categoria, data, status: 'pendente'};

    // Enviar tarefa para a API
    const options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
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
          lista.push(tarefa);
          atualizarListaTarefas();
          saveLocalStorage();
      })
      .catch(error => {
          console.error('Ocorreu um erro:', error);
      });
  
    // Limpar os campos de entrada
    tituloInput.value = '';
    descricaoInput.value = '';
    dataInput.value = '';   
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
          'Authorization': `Bearer ${accessToken}`
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
    const tarefaId = tarefa.id;
  
    // Enviar requisição DELETE para a API
    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };
  
    const urlDelete = `${url}/${tarefaId}`;
  
    fetch(urlDelete, options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao excluir tarefa.');
            }
            console.log('Tarefa excluída com sucesso do Todoist.');
        })
        .catch(error => {
            console.error('Ocorreu um erro:', error);
        });
  
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