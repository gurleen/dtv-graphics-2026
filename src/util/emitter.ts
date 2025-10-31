import Emittery from 'emittery';

export const EventBus = new Emittery();
EventBus.onAny((name, data) => {
    console.log("EMIT", name, data);
})
let firstUpdateCalled = false;

window.play = () => EventBus.emit("play");
window.stop = () => EventBus.emit("stop");

function emitUpdate(data: string) {
    EventBus.emit("update", JSON.parse(data));
}

window.update = (data: string) => {
    if(firstUpdateCalled) {
        emitUpdate(data);
    }
    else {
        setTimeout(() => {
            emitUpdate(data);
            firstUpdateCalled = true;
        }, 250);
    }
}