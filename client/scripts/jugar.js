function guardarNombre() {
    const nombreUsuario = prompt('Por favor, ingresa tu nombre:');
    if (nombreUsuario) {
        let nombresUsuarios = /*JSON.parse(sessionStorage.getItem('nombresUsuarios')) ||*/ [];
        nombresUsuarios.push(nombreUsuario);
        sessionStorage.setItem('nombresUsuarios', JSON.stringify(nombresUsuarios)); 
        alert(`Hola, ${nombreUsuario}! Bienvenido a la Batalla Naval.`);
        window.location.href = 'jugar.html'; 
    } else {
        alert('No ingresaste ningún nombre.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const nombresJugadores = JSON.parse(sessionStorage.getItem('nombresUsuarios'));
    console.log("nombres jugadores: ", nombresJugadores);
    if (nombresJugadores && nombresJugadores.length > 0) {
        console.log("se crearon bien los tableros");
        nombresJugadores.forEach(nombreJugador => crearTableros(nombreJugador));
    } else {
        console.log("No se encontraron nombres de jugadores.");
    }
});

const columnas = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const filas = ['', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

let barcosColocados = {
    portaaviones: { horizontal: false, vertical: false },
    acorazado: { horizontal: false, vertical: false },
    crucero: { horizontal: false, vertical: false },
    submarino: { horizontal: false, vertical: false },
    destructor: { horizontal: false, vertical: false }
};

let barcosJugador = [
    { nombre: 'portaaviones', size: 5, orientado: false },
    { nombre: 'acorazado', size: 4, orientado: false },
    { nombre: 'crucero', size: 3, orientado: false },
    { nombre: 'submarino', size: 3, orientado: false },
    { nombre: 'destructor', size: 2, orientado: false }
];

let barcosComputadora = [
    { nombre: 'portaaviones', size: 5, orientado: false, posicion: [] },
    { nombre: 'acorazado', size: 4, orientado: false, posicion: [] },
    { nombre: 'crucero', size: 3, orientado: false, posicion: [] },
    { nombre: 'submarino', size: 3, orientado: false, posicion: [] },
    { nombre: 'destructor', size: 2, orientado: false, posicion: [] }
];

function crearTableros(nombreJugador) {
    // Crear y colocar el tablero del jugador
    const tableroJugador = crearTableroJugador();
    document.querySelector('.jugador').appendChild(tableroJugador);

    // Crear y colocar el tablero de la computadora
    const tableroComputadora = crearTableroComputadora();
    document.querySelector('.computadora').appendChild(tableroComputadora);

    // Crear y colocar la sección de barcos
    const barcosContainer = crearBarcosContainer();
    document.querySelector('.barcos-container').appendChild(barcosContainer);

    // Crear el botón para iniciar el juego (por defecto desactivado)
    const botonIniciar = document.createElement('button');
    botonIniciar.textContent = 'Iniciar Juego';
    botonIniciar.disabled = true;
    botonIniciar.addEventListener('click', iniciarJuego);
    document.body.appendChild(botonIniciar); 
}

function crearTableroJugador() {
    const tablero = document.createElement('div');
    tablero.classList.add('jugador');
    tablero.style.position = 'relative';

    for (let i = 0; i < filas.length; i++) {
        for (let j = 0; j < columnas.length; j++) {
            const div = document.createElement('div');
            div.classList.add('position');
            div.dataset.row = filas[i];
            div.dataset.col = columnas[j];

            if (i === 0 || j === 0) {
                div.classList.add('header');
                div.textContent = i === 0 ? columnas[j] : filas[i];
            }

            div.addEventListener('dragover', dragOver);
            div.addEventListener('drop', drop);
            tablero.appendChild(div);
        }
    }

    return tablero;
}

function crearTableroComputadora() {
    const tablero = document.createElement('div');
    tablero.classList.add('computadora');
    tablero.style.position = 'relative';

    for (let i = 0; i < filas.length; i++) {
        for (let j = 0; j < columnas.length; j++) {
            const div = document.createElement('div');
            div.classList.add('position');
            div.dataset.row = filas[i];
            div.dataset.col = columnas[j];

            if (i === 0 || j === 0) {
                div.classList.add('header');
                div.textContent = i === 0 ? columnas[j] : filas[i];
            }

            tablero.appendChild(div);
        }
    }

    document.querySelector('.computadora').appendChild(tablero);
    // Colocar los barcos aleatorios en el tablero de la computadora
    colocarBarcosRandom();

    return tablero;
}

function colocarBarcosRandom() {
    barcosComputadora.forEach(barco => {
        let colocado = false;

        while (!colocado) {
            const orientacion = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            const filaInicio = Math.floor(Math.random() * 10) + 1;
            const colInicio = Math.floor(Math.random() * 10) + 1;

            if (validarPosicionBarcoComputadora(filaInicio, colInicio, barco.size, orientacion)) {
                colocarBarcoComputadora(filaInicio, colInicio, barco.size, orientacion, barco);
                colocado = true;
            }
        }
    });
}

function validarPosicionBarcoComputadora(filaInicio, colInicio, size, orientacion) {
    const totalRows = filas.length - 1;
    const totalCols = columnas.length - 1;

    for (let i = 0; i < size; i++) {
        let fila = filaInicio;
        let col = colInicio;

        if (orientacion === 'horizontal') {
            col += i;
            if (col > totalCols) return false;
        } else if (orientacion === 'vertical') {
            fila += i;
            if (fila > totalRows) return false;
        }

        const cell = document.querySelector(`.computadora [data-row="${fila}"][data-col="${columnas[col]}"]`);
        if (cell && cell.dataset.occupied) {
            return false; // Si la celda ya está ocupada
        }
    }
    return true;
}

function colocarBarcoComputadora(filaInicio, colInicio, size, orientacion, barco) {
    let celdasOcupadas = [];
    for (let i = 0; i < size; i++) {
        let fila = filaInicio;
        let col = colInicio;

        if (orientacion === 'horizontal') {
            col += i;
        } else if (orientacion === 'vertical') {
            fila += i;
        }

        console.log(`colocar barcos en tablero computadora, Fila: ${fila}, Columna: ${col}`);

        const cell = document.querySelector(`.computadora [data-row="${fila}"][data-col="${columnas[col]}"]`);
        console.log(cell);

        if (cell) {
            cell.dataset.occupied = barco.nombre; // Marca la celda como ocupada por este barco
            celdasOcupadas.push(cell); // Guarda las celdas ocupadas para verificar si el barco es hundido
        } else {
            console.log(`No se encontró la celda para fila: ${fila}, columna: ${columnas[col]}`);
        }
    }
    
    barco.posicion = celdasOcupadas.map(cell => `[data-row="${cell.dataset.row}"][data-col="${cell.dataset.col}"]`);
}

function crearBarcosContainer() {
    const barcosContainer = document.createElement('div');
    barcosContainer.classList.add('barcos-container');

    const barcos = [
        { nombre: 'portaaviones', src: 'client/images/1portaaviones.png', size: 5 },
        { nombre: 'acorazado', src: 'client/images/2acorazado.png', size: 4 },
        { nombre: 'crucero', src: 'client/images/3crucero.png', size: 3 },
        { nombre: 'submarino', src: 'client/images/4submarino.png', size: 3 },
        { nombre: 'destructor', src: 'client/images/5destructor.png', size: 2 }
    ];

    barcos.forEach((barco, index) => {
        // Crear las versiones horizontal y vertical de cada barco
        const barcoHorizontal = document.createElement('img');
        barcoHorizontal.src = barco.src;
        barcoHorizontal.classList.add('barco');
        barcoHorizontal.draggable = true;
        barcoHorizontal.id = `barco-${index}-h`;
        barcoHorizontal.dataset.size = barco.size;
        barcoHorizontal.dataset.nombre = barco.nombre;
        barcoHorizontal.dataset.orientation = 'horizontal';
        barcoHorizontal.style.height = `${40 * barco.size}px`;
        barcoHorizontal.style.width = '40px';
        barcoHorizontal.style.transform = 'rotate(90deg)';

        const barcoVertical = document.createElement('img');
        barcoVertical.src = barco.src;
        barcoVertical.classList.add('barco');
        barcoVertical.draggable = true;
        barcoVertical.id = `barco-${index}-v`;
        barcoVertical.dataset.size = barco.size;
        barcoVertical.dataset.nombre = barco.nombre;
        barcoVertical.dataset.orientation = 'vertical';
        barcoVertical.style.height = `${40 * barco.size}px`;
        barcoVertical.style.width = '40px';
        barcoVertical.style.transform = 'rotate(0deg)';

        // Agregar los barcos a la sección de los barcos
        barcosContainer.appendChild(barcoHorizontal);
        barcosContainer.appendChild(barcoVertical);

        // Permitir arrastrar
        barcoHorizontal.addEventListener('dragstart', dragStart);
        barcoVertical.addEventListener('dragstart', dragStart);
    });

    return barcosContainer;
}

// Función para manejar el inicio del drag
function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
}

function dragOver(event) {
    event.preventDefault();
}

// Función para manejar el drop de los barcos
function drop(event) {
    event.preventDefault();

    const barcoId = event.dataTransfer.getData('text/plain');
    const barco = document.getElementById(barcoId);
    const size = parseInt(barco.dataset.size);
    const orientation = barco.dataset.orientation;
    const position = event.target.closest('.position');

    // Asegurarse de que el drop ocurra solo en el tablero del jugador
    if (!position.closest('.jugador')) return;

    if (!position || position.classList.contains('header') || parseInt(position.dataset.row) -1 === 0 || parseInt(position.dataset.row) -1 === "" || columnas.indexOf(position.dataset.col) -1 === 0 || columnas.indexOf(position.dataset.col) -1 === "") {
        alert("cabecera");
        return;
    }

    const nombreBarco = barco.dataset.nombre;
    if (barcosColocados[nombreBarco].horizontal || barcosColocados[nombreBarco].vertical) {
        alert(`El ${nombreBarco} ya está colocado.`);
        return;
    }

    if (validarDrop(position, size, orientation)) {
        const previousCells = barco.dataset.occupiedCells ? JSON.parse(barco.dataset.occupiedCells) : [];
        previousCells.forEach(cellId => {
            const cell = document.querySelector(cellId);
            if (cell) {
                delete cell.dataset.occupied;
            }
        });

        position.style.position = 'relative';
        position.appendChild(barco);

        const occupiedCells = actualizarCeldasOcupadas(position, size, orientation, barco.id);
        barco.dataset.occupiedCells = JSON.stringify(occupiedCells.map(cell => `[data-row="${cell.dataset.row}"][data-col="${cell.dataset.col}"]`));

        if (orientation === 'horizontal') {
            barcosColocados[nombreBarco].horizontal = true;
        } else if (orientation === 'vertical') {
            barcosColocados[nombreBarco].vertical = true;
        }

        // Actualizar la propiedad "orientado" del barco
        const barcoIndex = barcosJugador.find(b => b.nombre === nombreBarco);
        if (barcoIndex) {
            barcoIndex.orientado = true; // Marcar el barco como orientado
        }

        activarBotonIniciar();
    }
}

function validarDrop(position, size, orientation) {
    const row = parseInt(position.dataset.row);
    const col = columnas.indexOf(position.dataset.col);

    for (let i = 0; i < size; i++) {
        let cell;
        if (orientation === 'horizontal') {
            if (col + i > columnas.length - 1) return false;
            cell = document.querySelector(`[data-row="${filas[row]}"][data-col="${columnas[col + i]}"]`);
        } else if (orientation === 'vertical') {
            if (row + i > filas.length - 1) return false;
            cell = document.querySelector(`[data-row="${filas[row + i]}"][data-col="${columnas[col]}"]`);
        }

        if (!cell || cell.dataset.occupied) {
            return false;
        }
    }
    return true;
}

function actualizarCeldasOcupadas(position, size, orientation, barcoId) {
    const row = parseInt(position.dataset.row);
    const col = columnas.indexOf(position.dataset.col);
    const cells = [];

    for (let i = 0; i < size; i++) {
        let cell;
        if (orientation === 'horizontal') {
            cell = document.querySelector(`[data-row="${filas[row]}"][data-col="${columnas[col + i - 1]}"]`);
        } else if (orientation === 'vertical') {
            cell = document.querySelector(`[data-row="${filas[row + i - 1]}"][data-col="${columnas[col]}"]`);
        }

        if (cell) {
            cell.dataset.occupied = barcoId;
            cells.push(cell);
        }
    }
    console.log(cells);
    return cells;
}

// Función para actualizar si el barco está colocado y activar el botón si todos los barcos están en su lugar
function activarBotonIniciar() {
    // Verifica si todos los barcos están colocados (si tanto en horizontal como en vertical)
    const todosLosBarcosColocados = barcosJugador.every(barco => 
        barcosColocados[barco.nombre].horizontal || barcosColocados[barco.nombre].vertical
    );

    const botonIniciar = document.querySelector('button');
    if (todosLosBarcosColocados) {
        botonIniciar.disabled = false;
    }
}

function dispararJugador(event) {
    if (!juegoIniciado) return;

    const cell = event.target.closest('.position');
    const row = parseInt(cell.dataset.row);
    const col = columnas.indexOf(cell.dataset.col);
    const barcoOcupado = cell.dataset.occupied;

    if (!cell.closest('.computadora') || !cell || cell.classList.contains('header') || row === 0 || col === 0) return;

    console.log("row jug " + row);
    console.log("col jug " + col);

    if (barcoOcupado) {
        cell.classList.add('hit');
        console.log('El jugador hizo un hit en la computadora');
        verificarHundimiento(barcoOcupado);
    } else {
        cell.classList.add('miss');
        console.log('El jugador hizo un miss en la computadora');
    }

    // Después de disparar, evitar más interacciones en el tablero de la computadora
    cell.removeEventListener('click', dispararJugador);

    // Después del disparo del jugador, la computadora realiza un disparo
    //dispararComputadora();
    setTimeout(dispararComputadora, 1000);
}

function dispararComputadora() {
    // Solo dispara si el juego ha comenzado
    if (!juegoIniciado) return;

    const celdasJugador = document.querySelectorAll('.jugador .position');
    
    // Elegir una celda aleatoria del tablero del jugador
    let celdaAleatoria = celdasJugador[Math.floor(Math.random() * celdasJugador.length)];

    // Simular el disparo de la computadora
    const row = parseInt(celdaAleatoria.dataset.row);
    const col = columnas.indexOf(celdaAleatoria.dataset.col);
    const barcoOcupado = celdaAleatoria.dataset.occupied;

    // Mientras que la celda ya haya sido atacada, elige otra
    while (celdaAleatoria.classList.contains('hit') || celdaAleatoria.classList.contains('miss') || row === 0 || col === 0) {
        celdaAleatoria = celdasJugador[Math.floor(Math.random() * celdasJugador.length)];
    }    

    console.log("row compu " + row);
    console.log("col compu " + col);

    if (barcoOcupado) {
        celdaAleatoria.classList.add('hit');
        console.log('La computadora hizo un hit en el jugador');
    } else {
        celdaAleatoria.classList.add('miss');
        console.log('La computadora hizo un miss en el jugador');
    }

    // Pausar antes de permitir el siguiente disparo del jugador
    setTimeout(() => {
        document.querySelectorAll('.computadora .position').forEach(cell => {
            cell.addEventListener('click', dispararJugador);
        });
    }, 1000);
}

function verificarHundimiento(nombreBarco) {
    const barco = barcosComputadora.find(b => b.nombre === nombreBarco);
    // Verificar si el barco ha sido hundido (todas sus celdas han sido disparadas)
    if (barco.posicion.every(cell => document.querySelector(cell).classList.contains('hit'))) {
        alert(`¡Has hundido el ${nombreBarco}!`);
    }
}

function iniciarJuego() {
    juegoIniciado = true;
    alert('El juego ha comenzado!');

    const celdasComputadora = document.querySelectorAll('.computadora .position');
    celdasComputadora.forEach(celda => {
        celda.addEventListener('click', dispararJugador); // El jugador puede disparar
    });

    dispararComputadora();
}