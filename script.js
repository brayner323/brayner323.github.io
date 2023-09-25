// manejar la búsqueda
const searchInput = document.querySelector(".search-input");

// Función para filtrar las notas basadas en la búsqueda
function filterNotes(searchTerm) {
  const noteElements = document.querySelectorAll(".note");

  noteElements.forEach((noteElement) => {
    const noteTitle = noteElement.querySelector(".details p").textContent.toLowerCase();
    if (noteTitle.includes(searchTerm.toLowerCase())) {
      noteElement.style.display = "flex"; // Mostrar notas coincidentes
    } else {
      noteElement.style.display = "none"; // Ocultar notas que no coincidan
    }
  });
}

// Escuchar eventos de entrada en el campo de búsqueda
searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.trim();
  filterNotes(searchTerm);
});

const addBox = document.querySelector(".add-box"),
popupBox = document.querySelector(".popup-box"),
popupTitle = popupBox.querySelector("header p"),
closeIcon = popupBox.querySelector("header i"),
titleTag = popupBox.querySelector("input"),
descTag = popupBox.querySelector("textarea"),
addBtn = popupBox.querySelector("button");

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
              "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const notes = JSON.parse(localStorage.getItem("notas") || "[]");
let isUpdate = false, updateId;

addBox.addEventListener("click", () => {
    popupTitle.innerText = "Añadir una nueva nota";
    addBtn.innerText = "Añadir nota";
    popupBox.classList.add("show");
    document.querySelector("body").style.overflow = "hidden";
    if(window.innerWidth > 660) titleTag.focus();
});

closeIcon.addEventListener("click", () => {
    isUpdate = false;
    titleTag.value = descTag.value = "";
    popupBox.classList.remove("show");
    document.querySelector("body").style.overflow = "auto";
});

function showNotes() {
    if(!notes) return;
    document.querySelectorAll(".note").forEach(li => li.remove());
    notes.forEach((note, id) => {
        let filterDesc = note.description.replaceAll("\n", '<br/>');
        let liTag = `<li class="note">
                        <div class="details">
                            <p>${note.title}</p>
                            <span>${filterDesc}</span>
                        </div>
                        <div class="bottom-content">
                            <span>${note.date}</span>
                            <div class="settings">
                                <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                                <ul class="menu">
                                    <li onclick="updateNote(${id}, '${note.title}', '${filterDesc}')"><i class="uil uil-pen"></i>Editar</li>
                                    <li onclick="deleteNote(${id})"><i class="uil uil-trash"></i>Eliminar</li>
                                    <li onclick="shareNote(${id})"><i class="uil uil-share-alt"></i>Compartir</li>
                                    <button onclick="exportNote('Título de la nota', 'Contenido de la nota')">Exportar</button>
                                    <input type="file" id="import-note" accept=".txt">
                                    <input type="datetime-local" id="reminderDateTime-1">
                                </ul>
                            </div>
                        </div>
                    </li>`;
        addBox.insertAdjacentHTML("afterend", liTag);
    });
}
showNotes();

// Obtén el campo de entrada de fecha y hora por su identificador
const reminderInput = document.getElementById("reminderDateTime-1");

// Escucha el evento "input" para detectar cuando el usuario cambia la fecha y hora
reminderInput.addEventListener("input", function () {
    // Obtén la fecha y hora seleccionada por el usuario
    const reminderDateTime = new Date(this.value).getTime();

    // Obtiene la hora actual
    const now = new Date().getTime();

    // Calcula la diferencia de tiempo entre la fecha y hora seleccionada y la hora actual
    const timeDifference = reminderDateTime - now;

    // Verifica si la fecha y hora seleccionada es en el futuro
    if (timeDifference > 0) {
        // Programa un mensaje de recordatorio para que aparezca en la fecha y hora seleccionada
        setTimeout(function () {
            alert("¡Es hora de tu recordatorio!");
        }, timeDifference);
    } else {
        alert("Por favor, seleccione una fecha y hora futura.");
    }
});


function showMenu(elem) {
    elem.parentElement.classList.add("show");
    document.addEventListener("click", e => {
        if(e.target.tagName != "I" || e.target != elem) {
            elem.parentElement.classList.remove("show");
        }
    });
}

function deleteNote(noteId) {
    let confirmDel = confirm("¿Seguro que quieres borrar esta nota?");
    if(!confirmDel) return;
    notes.splice(noteId, 1);
    localStorage.setItem("notas", JSON.stringify(notes));
    showNotes();
}

function updateNote(noteId, title, filterDesc) {
    let description = filterDesc.replaceAll('<br/>', '\r\n');
    updateId = noteId;
    isUpdate = true;
    addBox.click();
    titleTag.value = title;
    descTag.value = description;
    popupTitle.innerText = "Actualizar una nota";
    addBtn.innerText = "Actualizar nota";
}

function exportNote(title, content) {
  const noteText = `Título: ${title}\n\nContenido:\n${content}`;
  const blob = new Blob([noteText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Crea un enlace para la descarga y simula un clic en él
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.txt`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  // Liberar recursos del objeto URL
  URL.revokeObjectURL(url);
}

addBtn.addEventListener("click", e => {
    e.preventDefault();
    let title = titleTag.value.trim(),
    description = descTag.value.trim();

    if(title || description) {
        let currentDate = new Date(),
        month = months[currentDate.getMonth()],
        day = currentDate.getDate(),
        year = currentDate.getFullYear();

        let noteInfo = {title, description, date: `${month} ${day}, ${year}`}
        if(!isUpdate) {
            notes.push(noteInfo);
        } else {
            isUpdate = false;
            notes[updateId] = noteInfo;
        }
        localStorage.setItem("notas", JSON.stringify(notes));
        showNotes();
        closeIcon.click();
    }
});



// Agregar carpetas
const folderList = document.getElementById("folder-list");
const addFolderBtn = document.getElementById("add-folder");

addFolderBtn.addEventListener("click", () => {
  const folderName = prompt("Ingrese el nombre de la carpeta:");
  if (folderName) {
    const folderId = Date.now(); // Un identificador único para la carpeta
    const folderHTML = `
      <li class="folder" data-folder-id="${folderId}">
        <span class="folder-name">${folderName}</span>
        <span class="delete-folder">Eliminar</span>
      </li>
    `;
    folderList.insertAdjacentHTML("beforeend", folderHTML);
  }
});

// Eliminar carpetas
folderList.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-folder")) {
    const folder = e.target.closest(".folder");
    const folderId = folder.getAttribute("data-folder-id");
    if (confirm(`¿Eliminar la carpeta "${folder.querySelector(".folder-name").textContent}"?`)) {
      folder.remove();
      
    }
  }
});

function shareNote(noteId) {
  const noteToShare = notes[noteId]; // Obtener la nota a compartir

  const shareLink = `https://notas.com/ver-nota/${noteId}`;
  alert(`Comparte este enlace: ${shareLink}`);
}


// Evento para importar nota al seleccionar un archivo
importInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    importNoteFromTXT(file);
  }
});
 
