let categorias = null;
let category = null;
let difficulty = null;
let rtaCorrecta = null;
let rtaIncorrecta = null;
let puntaje = 0;
const menu = document.querySelector('.overlay')


const dropdowns = document.querySelectorAll('.dropdown');
dropdowns.forEach(dropdown => {
  const select = dropdown.querySelector('.select');

  const caret = dropdown.querySelector('.caret');
  const menu = dropdown.querySelector('.menu');
  const options = dropdown.querySelectorAll('.menu li');
  const selected = dropdown.querySelector('.selected');

  select.addEventListener('click', () => {
    select.classList.toggle('select-clicked');
    caret.classList.toggle('caret-rotate');
    menu.classList.toggle('menu-open');
  });
  options.forEach(option => {
    option.addEventListener('click', () => {
      selected.innerText = option.innerText;
      difficulty = option.id;
      select.classList.remove('selected-clicked');
      caret.classList.remove('caret-rotate');
      menu.classList.remove('menu-open');
      options.forEach(option => {
        option.classList.remove('active');
      });
      option.classList.add('active');
    });
  });
});




function translateText(text) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es&de=tapyzas@mailto.plus`;

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      return data.responseData.translatedText;
    })
    .catch(error => {
      console.error("Error al traducir el texto:", error);
      return text;
    });

}


function crearCategorias() {
  const APICAT = "https://opentdb.com/api_category.php";
  fetch(APICAT)
    .then((response) => response.json())
    .then((response) => {
      categorias = response.trivia_categories;
      const categories = document.getElementById("Categoria");
      traduciryCambiar(categorias, categories);
    })
    .catch((error) => console.log(error));
}


function selectCategory(categoria, elem) {
  const selected = document.querySelector('.selected');
  selected.innerText = elem.name;
  const select = document.querySelector(".select");
  const caret = document.querySelector(".caret");
  const menu = document.querySelector(".menu");

  select.classList.remove("select-clicked");
  caret.classList.remove("caret-rotate");
  menu.classList.remove("menu-open");

  const options = document.querySelectorAll(".menu li");
  options.forEach((option) => {
    option.classList.remove("active");
  });
  categoria.classList.add("active");
}

function traduciryCambiar(categorias, categories) {
  categorias.forEach((elem) => {
    translateText(elem.name).then((translatedText) => {
      elem.name = translatedText;
      const categoria = document.createElement("li");
      categoria.innerHTML = elem.name;
      categoria.className = "categoriah"
      categories.appendChild(categoria);

      // Agregar un controlador de eventos para hacer clic en cada categoría
      categoria.addEventListener("click", () => {
        selectCategory(categoria, elem);
        category = elem.id;
      });
    });
  });


  ;
}

crearCategorias();

const boton = document.querySelector('.boton');


boton.addEventListener("click", () => {
  if (!(category === null || difficulty === null)) {
    mostrarLoader();
    menu.remove();
    Mostrarpregunta();
  } else {
    const mensaje = document.getElementById("mensaje");
    const error = document.createElement("h4");
    error.id = "error";
    error.innerHTML = "Seleccione todas las opciones";
    mensaje.appendChild(error);
  }
});

function Mostrarpregunta() {
  const url = `https://opentdb.com/api.php?amount=1&category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(difficulty)}&type=multiple`;
  console.log(url);
  const pregunta = document.getElementById("pregunta");
  fetch(url)
    .then((response) => response.json())
    .then((response) => {
      return {
        question: response.results[0].question,
        correct_answer: response.results[0].correct_answer,
        incorrect_answers: response.results[0].incorrect_answers,
      };
    })
    .then((data) => {
      return Promise.all([
        translateText(data.question),
        translateText(data.correct_answer),
        Promise.all(data.incorrect_answers.map((incorrectAnswer) => translateText(incorrectAnswer))),
      ]).then(([translatedQuestion, translatedCorrectAnswer, translatedIncorrectAnswers]) => {
        pregunta.innerHTML = translatedQuestion;
        rtaCorrecta = translatedCorrectAnswer;
        rtaIncorrecta = translatedIncorrectAnswers;
        MostrarRespuestas(rtaCorrecta, rtaIncorrecta);
      });
    })
    .catch((error) => {
      console.error("Error al traducir el texto:", error);
    });
}


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getShuffledAnswers(correctAnswer, incorrectAnswers) {
  // Crea un array que contiene la respuesta correcta y las respuestas incorrectas
  const allAnswers = [correctAnswer, ...incorrectAnswers];

  // Mezcla el array de respuestas
  shuffleArray(allAnswers);

  return allAnswers;
}

function MostrarRespuestas(rtaCorrecta, rtaIncorrecta) {
  let respuestas = getShuffledAnswers(rtaCorrecta, rtaIncorrecta);
  const respuesta = document.getElementById("respuesta");
  respuesta.innerHTML = ""; // Limpiar el contenedor de respuestas antes de agregar nuevas respuestas
  let respuestaSeleccionada = false; // Variable para controlar si ya se ha seleccionado una respuesta
  const notification = document.createElement("div");
notification.id = "notification";
notification.className = "notification";
respuesta.appendChild(notification);
  respuestas.forEach((element) => {
    // Crear un elemento 'span' para cada respuesta y agregarlo al contenedor de respuestas
    const span = document.createElement("span");
    span.className = "respuestas";
    span.innerHTML = element;
    respuesta.appendChild(span);
    // Agregar un controlador de eventos para hacer clic en cada respuesta
    span.addEventListener("click", () => {
      if (!respuestaSeleccionada) {
        respuestaSeleccionada = true;
        if (element === rtaCorrecta) {
          puntaje++;
          span.style.backgroundColor = "00994C";
          mostrarPuntajes()
          mostrarNotificacion("✅ ¡Respuesta correcta!");
        } else {
          puntaje = 0;
          span.style.backgroundColor = "BA1C1C";
          mostrarPuntajes()
          mostrarNotificacion("❌ Respuesta incorrecta.");
          const respuestas = document.querySelectorAll(".respuestas");
          respuestas.forEach((respuesta) => {
            if (respuesta.innerHTML === rtaCorrecta) {
              respuesta.style.backgroundColor = "00994C";
            }
          });
        }
        document.getElementById("siguientePregunta").style.display = "block";
      }
    });
  });
  ocultarLoader();
}

document.getElementById("siguientePregunta").addEventListener("click", () => {
  // Cargar la siguiente pregunta
  mostrarLoader();
  Mostrarpregunta();

  // Ocultar el botón de siguiente pregunta
  document.getElementById("siguientePregunta").style.display = "none";
});


function guardarPuntajes(puntajeActual, puntajeMaximo) {
  localStorage.setItem('puntajeActual', puntajeActual);
  localStorage.setItem('puntajeMaximo', puntajeMaximo);
}

function mostrarPuntajes() {
  // Obtener los puntajes del almacenamiento local
  const { puntajeActual, puntajeMaximo } = obtenerPuntajes();

  // Guardar y actualizar los puntajes
  const nuevoPuntajeActual = puntaje;
  const nuevoPuntajeMaximo = Math.max(puntajeMaximo, nuevoPuntajeActual);
  guardarPuntajes(nuevoPuntajeActual, nuevoPuntajeMaximo);

  // Mostrar los puntajes actualizados en la pantalla
  document.getElementById("valor").textContent = nuevoPuntajeActual;
  document.getElementById("maximo").textContent = nuevoPuntajeMaximo;
}


// Función para obtener los puntajes del almacenamiento local
function obtenerPuntajes() {
  const puntajeActualGuardado = localStorage.getItem('puntajeActual');
  const puntajeMaximoGuardado = localStorage.getItem('puntajeMaximo');

  const puntajeActual = puntajeActualGuardado !== null ? parseInt(puntajeActualGuardado) : 0;
  const puntajeMaximo = puntajeMaximoGuardado !== null ? parseInt(puntajeMaximoGuardado) : 0;

  return { puntajeActual, puntajeMaximo };
}

function reiniciarPuntajeActual() {
  const { puntajeMaximo } = obtenerPuntajes();
  guardarPuntajes(0, puntajeMaximo);
}

document.addEventListener("DOMContentLoaded", () => {
  const { puntajeActual, puntajeMaximo } = obtenerPuntajes();

  document.getElementById("valor").textContent = puntajeActual;
  document.getElementById("maximo").textContent = puntajeMaximo;
});

function mostrarLoader() {
  const loader = document.getElementById("custom-loader");
  const contenedor = document.getElementById("contenedordejuego")
  contenedor.style.display = "none"
  loader.style.display = "block";
}

function ocultarLoader() {
  const loader = document.getElementById("custom-loader");
  loader.style.display = "none";
  const contenedor = document.getElementById("contenedordejuego")
  contenedor.style.display = "block"
}

function mostrarNotificacion(mensaje) {
  const notification = document.getElementById("notification");
  notification.textContent = mensaje;
  notification.style.opacity = "1";
  setTimeout(() => {
    notification.style.opacity = "0";
  }, 1500);
}