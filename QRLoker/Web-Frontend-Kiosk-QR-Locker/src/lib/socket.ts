export let websocket = new WebSocket(import.meta.env.VITE_LOCAL_SOCKET_URL || 'ws://127.0.0.1:17000');

const reconnectWebSocket = () => {
    websocket = new WebSocket(import.meta.env.VITE_LOCAL_SOCKET_URL || 'ws://127.0.0.1:17000');

    websocket.onopen = () => {
        console.log("WebSocket Reconnected");
    };

    websocket.onerror = (err) => {
        console.log("WebSocket Error", err);
    };

    websocket.onclose = () => {
        console.log("WebSocket Disconnected, trying to reconnect...");
        setTimeout(reconnectWebSocket, 2000); // Reconnect after 2 seconds
    };
};

websocket.onclose = () => {
    console.log("WebSocket Disconnected, trying to reconnect...");
    setTimeout(reconnectWebSocket, 2000);
};