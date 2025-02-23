const API_URL = "http://localhost/Lista de tareas - Javascript/api";
let tasks = []; // Se sigue usando para renderizar, pero se llena desde la BD.
let taskBeingEdited = null;

function login() {
  let usuario = document.getElementById("usuario").value;
  let contrasena = document.getElementById("contrasena").value;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", `${API_URL}/login.php`, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    let respuesta = JSON.parse(xhr.responseText);
    if (respuesta.token) {
      localStorage.setItem("token", respuesta.token);
      localStorage.setItem("expiracion", respuesta.expiracion);
      window.location.href = "tareas.html";
    } else {
      document.getElementById("error-msg").innerText = respuesta.error;
    }
  };

  xhr.send(JSON.stringify({ usuario, contrasena }));
}


function verificarLogin() {
  let token = localStorage.getItem("token");
  let expiracion = localStorage.getItem("expiracion");

  if (!token || new Date(expiracion) < new Date()) {
    localStorage.clear();
    window.location.href = "index.html";
  } else {
    obtenerTareas();
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function submitTask(event) {
  event.preventDefault();
  if (taskBeingEdited) {
    editarTarea(taskBeingEdited);
  } else {
    crearTarea(event);
  }
}

function init() {
  // Botón para abrir el modal al agregar tarea
  let btnAgregarTarea = document.getElementById("btnAgregarTarea");
  let closeModalButton = document.getElementById("closeModal");
  let taskForm = document.getElementById("taskForm");

  if (btnAgregarTarea) {
    btnAgregarTarea.addEventListener("click", () => {
      taskBeingEdited = null;
      document.getElementById("modalTitle").innerText = "Agregar Tarea";
      abrirModal();
    });
  }
  if (closeModalButton) {
    closeModalButton.addEventListener("click", cerrarModal);
  }
  if (taskForm) {
    taskForm.addEventListener("submit", submitTask);
  }
}

function abrirModal() {
  let modal = document.getElementById("taskModal");
  if (modal) {
    modal.style.display = "flex";
  } else {
    console.error("Error: taskModal no encontrado en el DOM");
  }
}

function cerrarModal() {
  let modal = document.getElementById("taskModal");
  if (modal) {
    modal.style.display = "none";
    document.getElementById("taskForm").reset();
    taskBeingEdited = null;
  } else {
    console.error("Error: taskModal no encontrado en el DOM");
  }
}

function crearTarea(event) {
  event.preventDefault();

  let titulo = document.getElementById("taskNameModal").value.trim();
  let descripcion = document.getElementById("taskDescriptionModal").value.trim();

  if (!titulo) {
    alert("El título es obligatorio");
    return;
  }

  let token = localStorage.getItem("token");
  let xhr = new XMLHttpRequest();
  xhr.open("POST", `${API_URL}/tareas.php`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", token);

  xhr.onload = function() {
    if (xhr.status === 200) {
      obtenerTareas();
      cerrarModal();
    } else {
      console.error("Error al crear tarea:", xhr.responseText);
    }
  };

  let data = JSON.stringify({ 
    titulo, 
    descripcion
  });
  xhr.send(data);
}



function obtenerTareas() {
  let token = localStorage.getItem("token");
  let xhr = new XMLHttpRequest();
  xhr.open("GET", `${API_URL}/tareas.php`, true);
  xhr.setRequestHeader("Authorization", token); 

  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        let response = JSON.parse(xhr.responseText);
        tasks = Array.isArray(response) ? response : [];
        console.log("Tasks cargadas:", tasks);
        render();
      } catch (error) {
        console.error("Error al parsear JSON:", error);
        tasks = [];
      }
    } else {
      console.error("Error al obtener tareas:", xhr.responseText);
      tasks = [];
    }
  };

  xhr.send();
}


function editarTarea(id) {
  const titulo = document.getElementById("taskNameModal").value.trim();
  const descripcion = document.getElementById("taskDescriptionModal").value.trim();
  const estado = "pendiente"; 

  const token = localStorage.getItem("token");
  const xhr = new XMLHttpRequest();
  xhr.open("PUT", `${API_URL}/tareas.php`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", token);

  xhr.onload = function() {
    if (xhr.status === 200) {
      const respuesta = JSON.parse(xhr.responseText);
      if (respuesta.mensaje) {
        console.log(respuesta.mensaje);
        obtenerTareas();
        cerrarModal();
      } else {
        console.error("Error al actualizar:", respuesta.error);
      }
    } else {
      console.error("Error al actualizar tarea:", xhr.responseText);
    }
  };

  // El backend espera { id, titulo, descripcion, estado }
  const data = JSON.stringify({ 
    id, 
    titulo, 
    descripcion, 
    estado 
  });
  xhr.send(data);
}




function eliminarTarea(id) {
  const token = localStorage.getItem("token");
  const xhr = new XMLHttpRequest();
  xhr.open("DELETE", `${API_URL}/tareas.php`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", token);

  xhr.onload = function() {
    if (xhr.status === 200) {
      const respuesta = JSON.parse(xhr.responseText);
      if (respuesta.mensaje) {
        console.log(respuesta.mensaje);
       
        obtenerTareas();
      } else {
        console.error("Error al eliminar:", respuesta.error);
      }
    } else {
      console.error("Error al eliminar tarea:", xhr.responseText);
    }
  };

  const data = JSON.stringify({ id });
  xhr.send(data);
}




function cambiarEstadoTarea(id) {
  let task = tasks.find(t => t.id === id);
  if (task) {
    let nuevoEstado;
    if (task.estado === "pendiente") {
      nuevoEstado = "enProgreso";
    } else if (task.estado === "enProgreso") {
      nuevoEstado = "completada";
    } else {
      nuevoEstado = "pendiente";
    }

    const token = localStorage.getItem("token");
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `${API_URL}/tareas.php`, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", token);

    xhr.onload = function() {
      if (xhr.status === 200) {
        const respuesta = JSON.parse(xhr.responseText);
        if (respuesta.mensaje) {
          console.log(respuesta.mensaje);
          obtenerTareas();
        } else {
          console.error("Error al actualizar estado:", respuesta.error);
        }
      } else {
        console.error("Error en la petición para actualizar estado:", xhr.responseText);
      }
    };

    const data = JSON.stringify({ id, estado: nuevoEstado });
    xhr.send(data);
  }
}

function render() {
  let columns = {
    pending: document.querySelector("#pending .task-list"),
    inProgress: document.querySelector("#inProgress .task-list"),
    completed: document.querySelector("#completed .task-list"),
  };

  Object.values(columns).forEach(column => column.innerHTML = "");

  tasks.forEach(task => {
    let taskElement = document.createElement("div");
    taskElement.className = "task";
    taskElement.innerHTML = `
      <h4>${task.titulo}</h4>
      <p>${task.descripcion || ""}</p>
      <small>Vence: ${formatDate(task.fecha_creacion)}</small>
      <div>
          ${task.estado !== "completada" ? `<button class="mark-complete" onclick="cambiarEstadoTarea(${task.id})">${task.estado === "pendiente" ? "Empezar" : "Finalizar"}</button>` : ""}
          ${task.estado !== "pendiente" ? `<button class="mark-pending" onclick="cambiarEstadoTarea(${task.id})">Reiniciar</button>` : ""}
          <button class="edit-task">Editar</button>
          <button class="delete-task">Eliminar</button>
      </div>
    `;

    taskElement.querySelector(".edit-task")?.addEventListener("click", () => {
      document.getElementById("taskNameModal").value = task.titulo;
      document.getElementById("taskDescriptionModal").value = task.descripcion;
      taskBeingEdited = task.id;
      abrirModal();
    });

    taskElement.querySelector(".delete-task")?.addEventListener("click", () => {
      eliminarTarea(task.id);
    });

    if (task.estado === "pendiente") {
      columns.pending.appendChild(taskElement);
    } else if (task.estado === "enProgreso") {
      columns.inProgress.appendChild(taskElement);
    } else if (task.estado === "completada") {
      columns.completed.appendChild(taskElement);
    }
  });
}



function formatDate(date) {
  if (!date) return "Sin fecha";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("es-ES", options);
}

document.addEventListener("DOMContentLoaded", init);
