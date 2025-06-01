//  ----------------------------------------------------------------------------------------- METADATA ---
namespace cosmos_meta {
    export const version: string = "5.5.1"
}

//  ---------------------------------------------------------------------------------------- CONSTANTS ---
const WIDTH: number = scene.screenWidth()
const HEIGHT: number = scene.screenHeight()

//  -------------------------------------------------------------------------------------------- DEBUG ---
namespace debug {
    export let log_load: boolean = false;
    export let log_free: boolean = false;
    export let log_add_handler: boolean = false;
    export let log_set_handler: boolean = false;
    export let log_remove_handler: boolean = false;
    export let log_event: boolean = false;
    export function log(data: string) {
        console.log("DEBUG: " + data)
    }
}

//  ------------------------------------------------------------------------------------------ DUMMIES ---
function dummy(): void {}

//  ------------------------------------------------------------------------------------------- ERRORS ---
class Exception {
    name: string
    desc: string
    code: number
    constructor(name: string, desc: string, code: number) {
        this.name = name
        this.desc = desc
        this.code = code
    }

    public raise() {
        console.log("FATAL[" + this.code + "]: " + this.name + "Exception: " + this.desc)
        control.panic(this.code)
    }

}

class NotImplementedException extends Exception {
    constructor(procedure: string, class_: string) {
        super("NotImplemented", "Procedure \"" + procedure + "\" from class \"" + class_ + "\" has not been implemented yet", 100)
    }

}

class OutOfRangeException extends Exception {
    constructor(min_: number, max_: number, actual: number) {
        super("OutOfRange", "Value \"" + actual + "\" should be between \"" + min_ + "\" and \"" + max_ + "\"", 101)
    }

}

class AlreadyInUseException extends Exception {
    constructor(resource: string) {
        super("AlreadyInUse", "Resource \"" + resource + "\" is already being used.", 102)
    }
}

function raise(e: Exception) {
    e.raise()
}

//  ------------------------------------------------------------------------------------ EVENT HANDLER ---
class EventHandler {
    handler: () => void
    constructor(handler: () => void) {
        this.handler = handler
    }

    run() {
        this.handler()
    }
}

class ControllerEventHandler extends EventHandler {
    button: controller.Button
    eventType: ControllerButtonEvent
    constructor(button: controller.Button, eventType: ControllerButtonEvent, handler: () => void) {
        super(handler)
        this.button = button
        this.eventType = eventType
    }

    run() {
        if ((this.eventType == ControllerButtonEvent.Pressed && this.button.isPressed()) ||
            (this.eventType == ControllerButtonEvent.Released && !this.button.isPressed())) {
            if (debug.log_event) { debug.log("Executed ControllerEvent of type " + (this.eventType == ControllerButtonEvent.Pressed ? "Pressed" : "Released")) }
            super.run()
        }
    }
}

class EventListener {
    handlers: EventHandler[] = []
    constructor() {}

    add_handler(handler: EventHandler): number {
        this.handlers.push(handler)
        if (debug.log_add_handler) { debug.log("Added handler " + typeof handler) }
        return this.handlers.length - 1
    }

    set_handler_at(handler: EventHandler, id: number): number {
        this.handlers.set(id, handler)
        if (debug.log_set_handler) { debug.log("Set handler at #" + id + " to " + typeof handler) }
        return id
    }

    remove_handler(handler_id: number): EventHandler {
        if (debug.log_remove_handler) { debug.log("Removed handler #" + handler_id) }
        return this.handlers.removeAt(handler_id)
    }

    clear_handlers(): EventHandler[] {
        let old_handlers: EventHandler[] = this.handlers
        for (let handler_id: number = 0; handler_id < this.handlers.length; handler_id++) {
            this.remove_handler(handler_id)
        }
        return old_handlers
    }

    handle_events() {
        for (let handler_id: number = 0; handler_id < this.handlers.length; handler_id++) {
            this.handlers[handler_id].run();
        }
    }
}

//  -------------------------------------------------------------------------------------------- UTILS ---
function ord(char: string): number {
    return char.charCodeAt(0)
}

//  ---------------------------------------------------------------------------------- CLASS INJECTION ---
class CursorImage {
    image: Image
    org: [number, number]
    constructor(image: Image, org: [number, number]) {
        this.image = image
        this.org = org
    }
}

namespace imageX {
    export function drawCheckerLineH(img: Image, x: number, y: number, length: number, c: number) {
        for (let pos = (x + y) % 2; pos < length; pos += 2) {
            img.setPixel(x + pos, y, c)
        }
    }

    export function drawCheckerLineV(img: Image, x: number, y: number, length: number, c: number) {
        for (let pos = (x + y) % 2; pos < length; pos += 2) {
            img.setPixel(x, y + pos, c)
        }
    }

    export function drawCheckerRect(img: Image, x: number, y: number, w: number, h: number, c: number) {
        imageX.drawCheckerLineH(img, x, y, w, c)
        imageX.drawCheckerLineV(img, x, y, h, c)
        imageX.drawCheckerLineV(img, x + w - 1, y, h, c)
        imageX.drawCheckerLineH(img, x, y + h - 1, w, c)
    }

    export function fillCheckerRect(img: Image, x: number, y: number, w: number, h: number, c: number) {
        let length: number

        if (w >= h) length = h
        else length = w

        for (let pos = 0; pos < length; pos++) {
            if (w >= h) {
                drawCheckerLineH(img, x, y + pos, w, c)
            } else {
                drawCheckerLineV(img, x + pos, y, h, c)
            }
        }
    }

    export class Font implements image.Font {
        charWidth: number;
        charHeight: number;
        data: Buffer;
        constructor(charWidth: number, charHeight: number, data: Buffer) {
            this.charWidth = charWidth
            this.charHeight = charHeight
            this.data = data
        }

        add_glyph(char: string, glyph: number[]) {
            this.data.concat(Buffer.fromArray([ord(char) & 0xFF, Math.floor(ord(char) & 0xFF00 >> 8)].concat(glyph)))
        }
    }

    export namespace cursor {
        export const SYS_ARROW: CursorImage = new CursorImage(img`
            3 3 . . . . .
            3 1 3 . . . .
            3 1 1 3 . . .
            3 1 1 1 3 . .
            3 1 1 1 1 3 .
            3 1 1 1 1 1 3
            3 1 1 1 3 3 3
            3 1 3 1 1 3 .
            3 3 3 1 1 3 .
            . . . 3 3 . .
        `, [0, 0])
        export const SYS_HAND: CursorImage = new CursorImage(img`
            . . . 3 . . . . .
            . . 3 1 3 . . . .
            . . 3 1 3 3 3 . .
            . . 3 1 3 1 3 3 .
            . 3 3 1 3 1 1 1 3
            3 1 3 1 1 1 1 1 3
            3 1 1 1 1 1 1 1 3
            3 1 1 1 1 1 1 1 3
            . 3 1 1 1 1 1 1 3
            . . 3 1 1 1 1 3 .
            . . . 3 3 3 3 . .
        `, [3, 0])
    }

    export namespace font {
        // Font structure:
        // 2 Bytes (HEADER): character code in Little Endian format
        // charWidth*charHeight Bits (BODY): character data (bottom to top, left to right)
        export const SYS_4x8: image.Font = new imageX.Font(4, 8, Buffer.fromArray([
            // UNICODE 0x0000
            // ...
            // UNICODE 0x001F
            ord(" "), 0x00, 0b00000000, 0b00000000, 0b00000000, 0b00000000,
            ord("!"), 0x00, 0b00000000, 0b00101110, 0b00000000, 0b00000000,
            ord('"'), 0x00, 0b00000110, 0b00000000, 0b00000110, 0b00000000,
            ord("#"), 0x00, 0b00010100, 0b00111110, 0b00111110, 0b00010100,
            ord("$"), 0x00, 0b00101100, 0b01111110, 0b00110100, 0b00000000,
            ord("%"), 0x00, 0b00110010, 0b00001000, 0b00100110, 0b00000000,
            ord("&"), 0x00, 0b00010100, 0b00101010, 0b00110100, 0b00000000,
            ord("'"), 0x00, 0b00000000, 0b00000110, 0b00000000, 0b00000000,
            ord("("), 0x00, 0b00000000, 0b00111110, 0b01000001, 0b00000000,
            ord(")"), 0x00, 0b00000000, 0b01000001, 0b00111110, 0b00000000,
            ord("*"), 0x00, 0b00101010, 0b00011100, 0b00101010, 0b00000000,
            ord("+"), 0x00, 0b00001000, 0b00011100, 0b00001000, 0b00000000,
            ord(","), 0x00, 0b01000000, 0b00100000, 0b00000000, 0b00000000,
            ord("-"), 0x00, 0b00001000, 0b00001000, 0b00001000, 0b00000000,
            ord("."), 0x00, 0b00000000, 0b00100000, 0b00000000, 0b00000000,
            ord("/"), 0x00, 0b01100000, 0b00011100, 0b00000011, 0b00000000,
            ord("0"), 0x00, 0b00111110, 0b00110110, 0b00111110, 0b00000000,
            ord("1"), 0x00, 0b00100100, 0b00111110, 0b00100000, 0b00000000,
            ord("2"), 0x00, 0b00111010, 0b00101010, 0b00101110, 0b00000000,
            ord("3"), 0x00, 0b00101010, 0b00101010, 0b00111110, 0b00000000,
            ord("4"), 0x00, 0b00001110, 0b00001000, 0b00111110, 0b00000000,
            ord("5"), 0x00, 0b00101110, 0b00101010, 0b00111010, 0b00000000,
            ord("6"), 0x00, 0b00111110, 0b00101010, 0b00111010, 0b00000000,
            ord("7"), 0x00, 0b00000010, 0b00000010, 0b00111110, 0b00000000,
            ord("8"), 0x00, 0b00111110, 0b00101010, 0b00111110, 0b00000000,
            ord("9"), 0x00, 0b00101110, 0b00101010, 0b00111110, 0b00000000,
            ord(":"), 0x00, 0b00000000, 0b00100100, 0b00000000, 0b00000000,
            ord(";"), 0x00, 0b01000000, 0b00100100, 0b00000000, 0b00000000,
            ord("<"), 0x00, 0b00001000, 0b00010100, 0b00100010, 0b00000000,
            ord("="), 0x00, 0b00010100, 0b00010100, 0b00010100, 0b00000000,
            ord(">"), 0x00, 0b00100010, 0b00010100, 0b00001000, 0b00000000,
            ord("?"), 0x00, 0b00000010, 0b00101010, 0b00000110, 0b00000000,
            ord("@"), 0x00, 0b00011010, 0b00100010, 0b00011100, 0b00000000,
            ord("A"), 0x00, 0b00111110, 0b00010010, 0b00111110, 0b00000000,
            ord("B"), 0x00, 0b00111110, 0b00101010, 0b00010100, 0b00000000,
            ord("C"), 0x00, 0b00111110, 0b00100010, 0b00100010, 0b00000000,
            ord("D"), 0x00, 0b00111110, 0b00100010, 0b00011100, 0b00000000,
            ord("E"), 0x00, 0b00111110, 0b00101010, 0b00101010, 0b00000000,
            ord("F"), 0x00, 0b00111110, 0b00001010, 0b00001010, 0b00000000,
            ord("G"), 0x00, 0b00111110, 0b00100010, 0b00110010, 0b00000000,
            ord("H"), 0x00, 0b00111110, 0b00001000, 0b00111110, 0b00000000,
            ord("I"), 0x00, 0b00100010, 0b00111110, 0b00100010, 0b00000000,
            ord("J"), 0x00, 0b00110000, 0b00100000, 0b00111110, 0b00000000,
            ord("K"), 0x00, 0b00111110, 0b00001000, 0b00110110, 0b00000000,
            ord("L"), 0x00, 0b00111110, 0b00100000, 0b00100000, 0b00000000,
            ord("M"), 0x00, 0b00111110, 0b00001110, 0b00111110, 0b00000000,
            ord("N"), 0x00, 0b00111110, 0b00011110, 0b00111110, 0b00000000,
            ord("O"), 0x00, 0b00111110, 0b00100010, 0b00111110, 0b00000000,
            ord("P"), 0x00, 0b00111110, 0b00001010, 0b00001110, 0b00000000,
            ord("Q"), 0x00, 0b00111110, 0b00110010, 0b01111110, 0b00000000,
            ord("R"), 0x00, 0b00111110, 0b00001010, 0b00110110, 0b00000000,
            ord("S"), 0x00, 0b00100110, 0b00101010, 0b00110010, 0b00000000,
            ord("T"), 0x00, 0b00000010, 0b00111110, 0b00000010, 0b00000000,
            ord("U"), 0x00, 0b00111110, 0b00100000, 0b00111110, 0b00000000,
            ord("V"), 0x00, 0b00011110, 0b00100000, 0b00011110, 0b00000000,
            ord("W"), 0x00, 0b00111110, 0b00111000, 0b00111110, 0b00000000,
            ord("X"), 0x00, 0b00110110, 0b00001000, 0b00110110, 0b00000000,
            ord("Y"), 0x00, 0b00000110, 0b00111000, 0b00000110, 0b00000000,
            ord("Z"), 0x00, 0b00110010, 0b00101010, 0b00100110, 0b00000000,
            ord("["), 0x00, 0b00000000, 0b01111111, 0b01000001, 0b00000000,
            ord(`\\`), 0x00, 0b00000011, 0b00011100, 0b01100000, 0b00000000,
            ord("]"), 0x00, 0b00000000, 0b01000001, 0b01111111, 0b00000000,
            ord("^"), 0x00, 0b00000010, 0b00000001, 0b00000010, 0b00000000,
            ord("_"), 0x00, 0b10000000, 0b10000000, 0b10000000, 0b10000000,
            ord("`"), 0x00, 0b00000001, 0b00000010, 0b00000100, 0b00000000,
            ord("a"), 0x00, 0b00110100, 0b00110100, 0b00111100, 0b00000000,
            ord("b"), 0x00, 0b00111111, 0b00100100, 0b00111100, 0b00000000,
            ord("c"), 0x00, 0b00111100, 0b00100100, 0b00100100, 0b00000000,
            ord("d"), 0x00, 0b00111100, 0b00100100, 0b00111111, 0b00000000,
            ord("e"), 0x00, 0b00111100, 0b00101100, 0b00101100, 0b00000000,
            ord("f"), 0x00, 0b00000100, 0b00111111, 0b00000101, 0b00000000,
            ord("g"), 0x00, 0b10111100, 0b10100100, 0b11111100, 0b00000000,
            ord("h"), 0x00, 0b00111111, 0b00000100, 0b00111100, 0b00000000,
            ord("i"), 0x00, 0b00000000, 0b00111101, 0b00000000, 0b00000000,
            ord("j"), 0x00, 0b10000000, 0b11111101, 0b00000000, 0b00000000,
            ord("k"), 0x00, 0b00111111, 0b00011000, 0b00100100, 0b00000000,
            ord("l"), 0x00, 0b00000000, 0b00111111, 0b00100000, 0b00000000,
            ord("m"), 0x00, 0b00111100, 0b00011100, 0b00111100, 0b00000000,
            ord("n"), 0x00, 0b00111100, 0b00000100, 0b00111100, 0b00000000,
            ord("o"), 0x00, 0b00111100, 0b00100100, 0b00111100, 0b00000000,
            ord("p"), 0x00, 0b11111100, 0b00100100, 0b00111100, 0b00000000,
            ord("q"), 0x00, 0b00111100, 0b00100100, 0b11111100, 0b00000000,
            ord("r"), 0x00, 0b00111100, 0b00000100, 0b00000100, 0b00000000,
            ord("s"), 0x00, 0b00101100, 0b00100100, 0b00110100, 0b00000000,
            ord("t"), 0x00, 0b00000100, 0b00111110, 0b00100100, 0b00000000,
            ord("u"), 0x00, 0b00111100, 0b00100000, 0b00111100, 0b00000000,
            ord("v"), 0x00, 0b00011100, 0b00100000, 0b00011100, 0b00000000,
            ord("w"), 0x00, 0b00111100, 0b00111000, 0b00111100, 0b00000000,
            ord("x"), 0x00, 0b00100100, 0b00011000, 0b00100100, 0b00000000,
            ord("y"), 0x00, 0b10111100, 0b10100000, 0b11111100, 0b00000000,
            ord("z"), 0x00, 0b00110100, 0b00100100, 0b00101100, 0b00000000,
            ord("{"), 0x00, 0b00001000, 0b01110111, 0b01000001, 0b00000000,
            ord("|"), 0x00, 0b00000000, 0b01111111, 0b00000000, 0b00000000,
            ord("}"), 0x00, 0b01000001, 0b01110111, 0b00001000, 0b00000000,
            ord("~"), 0x00, 0b00001000, 0b00011000, 0b00010000, 0b00000000,
            // UNICODE 0x007F
        ]));
    }
}

//  ------------------------------------------------------------------------------------ ASSET MANAGER ---
class Palette {
    static buf: [number, number, number][] = [null, null, null, null, null]
    static disabled: boolean = false

    public static disable() {
        Palette.disabled = true
    }

    public static enable() {
        Palette.disabled = false
    }

    buf_id: number
    colors: [number, number, number]
    loaded: boolean

    constructor(colors: [number, number, number]) {
        this.buf_id = 0
        this.colors = colors
        this.loaded = false
    }

    public load(buf_id: number) {
        if (Palette.disabled) return;
        if (this.loaded) this.free();
        if (!(0 <= buf_id && buf_id <= 4)) {
            raise(new OutOfRangeException(0, 4, buf_id))
        }

        if (Palette.buf[buf_id] !== null) {
            raise(new AlreadyInUseException("Palette.buf[" + buf_id + "]"))
        }

        this.buf_id = buf_id
        this.loaded = true
        Palette.buf[this.buf_id] = this.colors
        if (debug.log_load) {debug.log("Loaded palette " + this.buf_id)}
        this.apply()
    }

    public apply() {
        if (Palette.disabled) return;
        if (!this.loaded) return;
        for (let color_id = 0; color_id < 3; color_id++) {
            color.setColor(this.abs_id(color_id), (this.colors as any[])[color_id])
        }
    }

    public free() {
        if (Palette.disabled) return;
        if (!this.loaded) return;
        this.loaded = false;
        Palette.buf[this.buf_id] = null
        for (let color_id = 0; color_id < 3; color_id++) {
            color.setColor(this.abs_id(color_id), 0x000000)
        }
        if (debug.log_free) {debug.log("Freed palette " + this.buf_id)}
    }

    public abs_id(color_id: number): number {
        return this.buf_id * 3 + color_id + 1
    }
}

//  ------------------------------------------------------------------------------------------- SCREEN ---
class Cursor {
    x = Math.round(WIDTH / 2)
    y = Math.round(HEIGHT / 2)
    defaultImg: CursorImage
    img: CursorImage
    defaultSpeed: number = 1
    speed: number = 1
    ignoreSpeed: boolean = false
    controllerEventHandler_ids: number[] = []
    clicking: boolean = false
    onClickStarted: EventListener = new EventListener()
    onClickEnded: EventListener = new EventListener()
    constructor(img: CursorImage) {
        this.defaultImg = img
    }

    render(img: Image): void {
        img.drawTransparentImage(this.img.image, this.x - (this.img.org as any[])[0], this.y - (this.img.org as any[])[1])
    }

    update(): void {
        this.img = this.defaultImg
    }

    set_speed(speed: number): void {
        this.speed = speed
    }

    set_default_speed(speed: number): void {
        this.defaultSpeed = speed
    }

    set_ignore_speed(ignoreSpeed: boolean): void {
        this.ignoreSpeed = ignoreSpeed
    }

    set_pos(x: number, y: number): void {
        this.x = (x + WIDTH) % WIDTH
        this.y = (y + HEIGHT) % HEIGHT
        //if (this.x < 0) { this.x = 0 }
        //if (this.x > WIDTH - 1) { this.x = WIDTH - 1 }
        //if (this.y < 0) { this.y = 0 }
        //if (this.y > HEIGHT - 1) { this.y = HEIGHT - 1 }
    }

    get_pos(): [number, number] {
        return [this.x, this.y]
    }

    move(x: number, y: number): void {
        this.set_pos(this.x + (x * (this.ignoreSpeed ? this.defaultSpeed : this.speed)), this.y + (y * (this.ignoreSpeed ? this.defaultSpeed : this.speed)))
    }

    set_clicking(clicking: boolean): void {
        this.clicking = clicking
        if (clicking && (!this.clicking)) {
            this.onClickStarted.handle_events()
        } else if ((!clicking) && this.clicking) {
            this.onClickEnded.handle_events()
        }
    }

    start_clicking(): void {
        this.set_clicking(true)
    }

    stop_clicking(): void {
        this.set_clicking(false)
    }

    move_h(x: number): void { this.move(x, 0) }
    move_v(y: number): void { this.move(0, y) }

    add_handlers(eventListener: EventListener) {
        this.controllerEventHandler_ids.push(eventListener.add_handler(new ControllerEventHandler(controller.up, ControllerButtonEvent.Pressed, () => { this.move_v(-1) })))
        this.controllerEventHandler_ids.push(eventListener.add_handler(new ControllerEventHandler(controller.down, ControllerButtonEvent.Pressed, () => { this.move_v(1) })))
        this.controllerEventHandler_ids.push(eventListener.add_handler(new ControllerEventHandler(controller.left, ControllerButtonEvent.Pressed, () => { this.move_h(-1) })))
        this.controllerEventHandler_ids.push(eventListener.add_handler(new ControllerEventHandler(controller.right, ControllerButtonEvent.Pressed, () => { this.move_h(1) })))
        this.controllerEventHandler_ids.push(eventListener.add_handler(new ControllerEventHandler(controller.A, ControllerButtonEvent.Pressed, () => { this.set_clicking(true) })))
        this.controllerEventHandler_ids.push(eventListener.add_handler(new ControllerEventHandler(controller.A, ControllerButtonEvent.Released, () => { this.set_clicking(false) })))
        this.controllerEventHandler_ids.push(eventListener.add_handler(new ControllerEventHandler(controller.B, ControllerButtonEvent.Pressed, () => { this.set_ignore_speed(true) })))
        this.controllerEventHandler_ids.push(eventListener.add_handler(new ControllerEventHandler(controller.B, ControllerButtonEvent.Released, () => { this.set_ignore_speed(false) })))
    }

    remove_handlers(eventListener: EventListener) {
        for (let handler_id = 0; handler_id < this.controllerEventHandler_ids.length; handler_id++) {
            eventListener.remove_handler(handler_id)
        }
    }
}

interface Widget {
    palette: Palette
    x: number
    y: number
    render(img: Image, wx: number, wy: number): void;
    update(cursor: Cursor, wx: number, wy: number): void;
}

class WLabel implements Widget {
    palette: Palette
    x: number
    y: number
    text: string
    font: image.Font
    constructor(palette: Palette, x: number, y: number, text: string, font: image.Font) {
        this.palette = palette
        this.x = x
        this.y = y
        this.text = text
        this.font = font
    }

    public render(img: Image, wx: number, wy: number): void {
        img.print(this.text, wx + this.x, wy + this.y, this.palette.abs_id(2), this.font)
    }

    public update(cursor: Cursor, wx: number, wy: number): void {}
}

enum WButtonState {
    Normal = 0,
    Hover = 1,
    Pressed = 2
}

class WButton extends WLabel {
    w: number
    h: number
    state: WButtonState = WButtonState.Normal
    onClick: EventListener
    onClickHandled: boolean = false
    cursorImg: CursorImage
    constructor(palette: Palette, x: number, y: number, w: number, h: number, text: string, cursorImg: CursorImage, onClick: EventListener, font: image.Font) {
        super(palette, x, y, text, font)
        if (w < 1) raise(new OutOfRangeException(1, Infinity, w))
        if (h < 1) raise(new OutOfRangeException(1, Infinity, h))
        this.w = w
        this.h = h
        this.onClick = onClick
        this.cursorImg = cursorImg
    }

    public render(img: Image, wx: number, wy: number): void {
        switch (this.state) {
            case WButtonState.Normal:
                img.drawRect(wx + this.x, wy + this.y, this.w, this.h, this.palette.abs_id(1))
                break
            case WButtonState.Hover:
                img.drawRect(wx + this.x, wy + this.y, this.w, this.h, this.palette.abs_id(2))
                imageX.drawCheckerRect(img, wx + this.x, wy + this.y, this.w, this.h, this.palette.abs_id(1))
                break
            case WButtonState.Pressed:
                imageX.fillCheckerRect(img, wx + this.x, wy + this.y, this.w, this.h, this.palette.abs_id(1))
                img.drawRect(wx + this.x, wy + this.y, this.w, this.h, this.palette.abs_id(2))
                break
        }
        super.render(img, wx + 2, wy + 1)
    }

    public update(cursor: Cursor, wx: number, wy: number) {
        // Draw according to cursor position
        if ((wx + this.x <= cursor.x) && (cursor.x <= wx + this.x + this.w) && (wy + this.y <= cursor.y) && (cursor.y <= wy + this.y + this.h)) {
            // Change cursor image
            cursor.img = this.cursorImg
            // Differentiate between pressed or just hovered
            if (cursor.clicking) {
                this.state = WButtonState.Pressed
                if (!this.onClickHandled) {
                    this.onClick.handle_events()
                    this.onClickHandled = true
                }
            } else {
                this.state = WButtonState.Hover
                this.onClickHandled = false
            }
        } else {
            this.state = WButtonState.Normal
        }
    }
}

enum WTextBoxInputType {
    Text = 0,
    Number = 1
}

class WTextBox extends WLabel {
    length: number
    inputType: WTextBoxInputType
    cursorImg: CursorImage
    promptShowed: boolean = false
    constructor(palette: Palette, x: number, y: number, length: number, inputType: WTextBoxInputType, cursorImg: CursorImage, font: image.Font) {
        super(palette, x, y, "", font)
        this.length = length
        this.inputType = inputType
        this.cursorImg = cursorImg
    }

    public render(img: Image, wx: number, wy: number) {
        img.drawRect(wx + this.x, wy + this.y, this.length * this.font.charWidth + 2, this.font.charHeight + 2, this.palette.abs_id(1))
        super.render(img, wx + 1, wy + 1)
    }

    public update(cursor: Cursor, wx: number, wy: number) {
        // Draw according to cursor position
        if ((wx + this.x <= cursor.x) && (cursor.x <= wx + this.x + (this.length * this.font.charWidth + 2) - 1) && (wy + this.y <= cursor.y) && (cursor.y <= wy + this.y + this.font.charHeight + 2)) {
            // Change cursor image
            cursor.img = this.cursorImg
            // Differentiate between pressed or just hovered
            if (cursor.clicking) {
                if (!this.promptShowed) {
                    let palette = color.currentPalette()
                    color.setColor(1, palette.color(3))
                    color.setColor(3, palette.color(1))
                    color.setColor(5, palette.color(3))
                    color.setColor(7, palette.color(2))
                    switch (this.inputType) {
                        case WTextBoxInputType.Text:
                            this.text = game.askForString("", this.length, true)
                            break
                        case WTextBoxInputType.Number:
                            this.text = game.askForNumber("", this.length, true).toString()
                    }
                    color.setPalette(palette)
                    this.promptShowed = true
                }
            } else {
                this.promptShowed = false
            }
        }
    }
}

class WCheckBox extends WLabel {
    checked: boolean = false
    checkedHandled: boolean = false
    cursorImg: CursorImage
    constructor(palette: Palette, x: number, y: number, text: string, cursorImg: CursorImage, font: image.Font) {
        super(palette, x, y, text, font)
        this.cursorImg = cursorImg
    }

    public render(img: Image, wx: number, wy: number): void {
        img.drawRect(wx + this.x, wy + this.y, 8, 8, this.palette.abs_id(2))
        if (this.checked) {
            img.fillRect(wx + this.x + 2, wy + this.y + 2, 4, 4, this.palette.abs_id(1))
        }
        super.render(img, wx + 9, wy)
    }

    public update(cursor: Cursor, wx: number, wy: number) {
        // Draw according to cursor position
        if ((wx + this.x <= cursor.x) && (cursor.x <= wx + this.x + 8) && (wy + this.y <= cursor.y) && (cursor.y <= wy + this.y + 8)) {
            // Change cursor image
            cursor.img = this.cursorImg
            // Differentiate between pressed or just hovered
            if (cursor.clicking) {
                if (!this.checkedHandled) {
                    this.checked = !this.checked
                    this.checkedHandled = true
                }
            } else {
                this.checkedHandled = false
            }
        }
    }
}

class Window {
    palette: Palette
    title: string
    font: image.Font
    widgets: Widget[]
    x: number
    y: number
    w: number
    h: number
    toDestroy: boolean = false
    constructor(palette: Palette, x: number, y: number, w: number, h: number, title: string, font: image.Font) {
        this.palette = palette
        this.title = title
        this.font = font
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        if (this.w == 0) {
            this.x = 0
            this.w = WIDTH
        };
        if (this.h == 0) {
            this.y = 0
            this.h = HEIGHT
        };
        this.widgets = []
    }

    public render(img: Image) {
        // Render window
        let c0 = this.palette.abs_id(0)
        let c1 = this.palette.abs_id(1)
        let c2 = this.palette.abs_id(2)
        let titlesize: number = this.font.charHeight
        img.fillRect(this.x, this.y, this.w, this.h, c0)
        img.fillRect(this.x, this.y, this.w, titlesize, c1)
        img.drawLine(this.x, this.y + titlesize, this.x, this.y + this.h - 1, c1)
        img.drawLine(this.x + this.w - 1, this.y + titlesize, this.x + this.w - 1, this.y + this.h - 1, c1)
        img.drawLine(this.x + 1, this.y + this.h - 1, this.x + this.w - 2, this.y + this.h - 1, c1)
        img.print(this.title, this.x + 1, this.y, c0, this.font)
        //let shadow: number = 2;
        //imageX.fillCheckerRect(img, this.x + this.w, this.y + shadow, shadow, this.h - shadow, c1)
        //imageX.fillCheckerRect(img, this.x + shadow, this.y + this.h, this.w, shadow, c1)
        // Render widgets
        for (let widget_id = 0; widget_id < this.widgets.length; widget_id++) {
            let widget = this.widgets[widget_id]
            if (widget) widget.render(img, this.x + 2, this.y + titlesize + 1)
        }
    }

    public update(cursor: Cursor) {
        let titlesize: number = this.font.charHeight
        // Update widgets
        for (let widget_id = 0; widget_id < this.widgets.length; widget_id++) {
            let widget = this.widgets[widget_id]
            if (widget) widget.update(cursor, this.x + 2, this.y + titlesize + 1)
        }
    }

    public destroy() {
        this.toDestroy = true
    }

    public add_widget(widget: Widget): number {
        this.widgets.push(widget)
        return this.widgets.length - 1
    }

    public remove_widget(widget_id: number): Widget {
        return this.widgets.removeAt(widget_id)
    }
}

enum MessageBoxType {
    OkOnly = 0,
    YesNo = 1
}

class MessageBox extends Window {
    type_: MessageBoxType
    message: string
    button1Listener: EventListener = new EventListener()
    button2Listener: EventListener = new EventListener()
    button1Handler_id: number
    button2Handler_id: number
    label_id: number
    button1_id: number
    button2_id: number
    constructor(palette: Palette, title: string, message: string, type_: MessageBoxType, font: image.Font, button1Handler?: EventHandler, button2Handler?: EventHandler, cursorButton?: CursorImage) {
        super(palette, 20, 40, WIDTH - 40, HEIGHT - 80, title, font)
        if (!cursorButton) cursorButton = imageX.cursor.SYS_HAND
        // Create message label
        this.label_id = this.add_widget(new WLabel(this.palette, 0, 0, message, this.font))
        // Create buttons
        if (button1Handler) this.button1Listener.add_handler(button1Handler)
        this.button1Handler_id = this.button1Listener.add_handler(new EventHandler(() => { this.destroy() }))
        switch (type_) {
            case MessageBoxType.OkOnly:
                this.button1_id = this.add_widget(new WButton(this.palette, this.w - 44, this.h - 21, 40, 10, "Ok", cursorButton, this.button1Listener, this.font))
                break
            case MessageBoxType.YesNo:
                if (button2Handler) this.button2Listener.add_handler(button2Handler)
                this.button2Handler_id = this.button2Listener.add_handler(new EventHandler(() => { this.destroy() }))
                this.button1_id = this.add_widget(new WButton(this.palette, this.w - 85, this.h - 21, 40, 10, "Yes", cursorButton, this.button1Listener, this.font))
                this.button2_id = this.add_widget(new WButton(this.palette, this.w - 44, this.h - 21, 40, 10, "No", cursorButton, this.button2Listener, this.font))
                break
            default:
                break
        }
    }
}

class Screen {
    windows: Window[]
    palette: Palette
    constructor(palette: Palette) {
        this.windows = []
        this.palette = palette
    }

    public render(img: Image) {
        // Clear screen
        img.fill(this.palette.abs_id(0))
        // Render windows
        let last_window = 0
        for (let window_id = this.windows.length - 1; window_id >= 0; window_id--) {
            if (this.windows[window_id]) {
                last_window = window_id
                break
            }
        }
        for (let window_id = 0; window_id < this.windows.length; window_id++) {
            let window = this.windows[window_id]
            if (window) {
                if (window_id == last_window) imageX.fillCheckerRect(img, 0, 0, WIDTH, HEIGHT, this.palette.abs_id(0))
                window.render(img)
            }
        }
        // Update screen
        scene.setBackgroundImage(img)
    }

    public update(cursor: Cursor) {
        // Update cursor
        cursor.update()
        // Update last window
        for (let window_id = this.windows.length - 1; window_id >= 0; window_id--) {
            let window = this.windows[window_id]
            if (window) {
                if (window.toDestroy) this.remove_window(window_id)
                else {
                    window.update(cursor)
                    break
                }
            }
        }
    }

    public add_window(window: Window): number {
        this.windows.push(window)
        return this.windows.length - 1
    }

    public remove_window(window_id: number): Window {
        return this.windows.removeAt(window_id)
    }
}

//  --------------------------------------------------------------------------------------------- MAIN ---
// Load black palette
color.setPalette(color.Black)

// Define system namespace
namespace system {
    export let onLoad: () => void
    export let theme: [number, number, number] = [0x210613, 0xf63090, 0xfffff5]
    export let palette: Palette = new Palette(system.theme)
    export let img: Image = image.create(160, 120)
    export let screen: Screen = new Screen(system.palette)
    export let controllerEventListener: EventListener = new EventListener()
    export let foreverEventListener: EventListener = new EventListener()
    export let cursor: Cursor = new Cursor(imageX.cursor.SYS_ARROW)
    export let screenUpdater_id: number = system.foreverEventListener.add_handler(new EventHandler(() => { system.screen.update(system.cursor) }))
    export let screenRenderer_id: number = system.foreverEventListener.add_handler(new EventHandler(() => { system.screen.render(system.img) }))
    export let cursorRenderer_id: number = system.foreverEventListener.add_handler(new EventHandler(() => { system.cursor.render(system.img) }))
}

// Load system resources
system.palette.load(0)

// Disable default menu
controller.menu.onEvent(ControllerButtonEvent.Pressed, () => { dummy() })

// Assign ControllerEventListeners
controller.anyButton.onEvent(ControllerButtonEvent.Pressed, () => { system.controllerEventListener.handle_events() })
controller.anyButton.onEvent(ControllerButtonEvent.Released, () => { system.controllerEventListener.handle_events() })
game.onUpdate(() => { system.foreverEventListener.handle_events() })

// Initialize scene
scene.setBackgroundColor(0)

// Initialize cursor
system.cursor.set_default_speed(4)
system.cursor.set_speed(16)
system.cursor.add_handlers(system.controllerEventListener)

// Run onLoad
if (system.onLoad) system.onLoad()