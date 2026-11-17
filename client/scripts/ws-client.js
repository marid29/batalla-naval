const WEBSOCKET_SCHEME = 'ws';
const WEBSOCKET_SERVER = 'batalla-naval.deno.dev';
const WEBSOCKET_PORT = 80;
const WEBSOCKET_URL = `${WEBSOCKET_SCHEME}://${WEBSOCKET_SERVER}:${WEBSOCKET_PORT}`;

const socket = new WebSocket(WEBSOCKET_URL);

socket.addEventListener('open', () => {
    console.log(`%cConectado al servidor en ${WEBSOCKET_URL}`,  'color: #99ff00');
});

socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    console.log('%c<- %cMensaje recibido desde el servidor:', 'color: #99ff00', 'color: inherit', message);

    if (message.type === 'gameCreated') { 
        alert(`Juego creado exitosamente. ID del juego: ${message.gameId}`);
    }
    if (message.type === 'playerJoined') { 
        alert(`Te has unido al juego exitosamente`);
        sessionStorage.setItem('nombresJugadores', JSON.stringify(message.nombresJugadores)); 
    }
    if (message.type === 'gameStarted') {
        alert(`El juego va a comenzar`);
        console.log("nombres de los jugadores: ", message.nombresJugadores);
        sessionStorage.setItem('nombresJugadores', JSON.stringify(message.nombresJugadores)); //guardar los nombres de los jugadores
        window.location.href = 'jugar.html'; //redirigir a la pantalla del juego
    }
    if (message.type === 'error') {
        alert(`Error: No se especificó ningún ID de juego`);
    }
    if (message.type === 'error' && !message.gameId) {
        alert(`No se encontró ningún juego bajo ese ID`);
    }
});

socket.addEventListener('close', () => {
    console.log('%cSe ha cerrado la conexión con el servidor WebSocket', 'color: #ee0000');
    const buttons = document.getElementsByClassName('server-operation');
    [...buttons].forEach((button) => {
        button.disabled = true;
    });
    const closeButton = document.getElementById('close-connection');
    closeButton.parentNode.removeChild(closeButton);
});

document.getElementById('create-game').addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'create' }));
});

document.getElementById('join-game').addEventListener('click', () => {
    const gameId = document.getElementById('game-id').value;
    const nombreUsuario = sessionStorage.getItem('nombreUsuario');
    socket.send(JSON.stringify({ type: 'join', gameId, nombreUsuario }));
    
});

document.getElementById('start-game').addEventListener('click', () => {
    const gameId = document.getElementById('game-id').value;
    const nombreUsuario = sessionStorage.getItem('nombreUsuario');
    socket.send(JSON.stringify({ type: 'start', gameId, nombreUsuario }));
});

document.getElementById('send-move').addEventListener('click', () => {
    const gameId = document.getElementById('game-id').value;
    const move = document.getElementById('move').value;
    socket.send(JSON.stringify({ type: 'move', gameId, move }));
});

document.getElementById('leave-game').addEventListener('click', () => {
    const gameId = document.getElementById('game-id').value;
    socket.send(JSON.stringify({ type: 'leave', gameId }));
});

document.getElementById('close-connection').addEventListener('click', () => {
    const response = confirm('¿Estás seguro de que deseas cerrar la conexión con el servidor de WebSocket?\n\nSi la cierras, no podrás enviar ni recibir más mensajes y, de acuerdo a esta implementación, tendrás que recargar la página.');
    if (response) {
        socket.close();
    }
});