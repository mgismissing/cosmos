//  ---------------------------------------------------------------------------------------- CONSTANTS ---
const WIDTH: number = 160
const HEIGHT: number = 120

//  -------------------------------------------------------------------------------------------- DEBUG ---

class debug {
    static log_load: boolean = false;
    static log_free: boolean = false;
    static log(data: string) {
        console.log("[DEBUG] " + data)
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
    constructor(procedure: string, interface_: string) {
        super("NotImplemented", "Procedure \"" + procedure + "\" from interface \"" + interface_ + "\" should be implemented by a subclass", 100)
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

function throw_(e: Exception) {
    e.raise()
}

//  -------------------------------------------------------------------------------------------- UTILS ---

function ord(char: String): number {
    return char.charCodeAt(0)
}

//  ---------------------------------------------------------------------------------- CLASS INJECTION ---
namespace imageX {
    export function fillCheckerRect(img: Image, x: number, y: number, w: number, h: number, c: number) {
        for (let posy = 0; posy < h; posy++) {
            for (let posx = 0; posx < w; posx++) {
                if ((posx + x + posy + y) % 2 == 0) { img.setPixel(posx + x, posy + y, c) }
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
    }

    console.log(image.font8.data.toBase64())
    
    export namespace font {
        // Font structure:
        // 2 Bytes (HEADER): character code in Little Endian format
        // charWidth*charHeight Bits (BODY): character data (bottom to top, left to right)
        export const IBM_BIOS_4x8: image.Font = new imageX.Font(4, 8, Buffer.fromArray([
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
            ord("Z"), 0x00, 0b00110010, 0b00101010, 0b00100110, 0b00000000
        ]));
    }
}

//  ------------------------------------------------------------------------------------ ASSET MANAGER ---
class Palette {
    static buf: [number, number, number][] = [null, null, null, null, null]

    buf_id: number
    colors: [number, number, number]
    loaded: boolean

    constructor(colors: [number, number, number]) {
        this.buf_id = 0
        this.colors = colors
        this.loaded = false
    }

    public load(buf_id: number) {
        if (this.loaded) return;
        if (!(0 <= buf_id && buf_id <= 4)) {
            throw_(new OutOfRangeException(0, 4, buf_id))
        }

        if (Palette.buf[buf_id] !== null) {
            throw_(new AlreadyInUseException("Palette.buf[" + buf_id + "]"))
        }

        this.buf_id = buf_id
        this.loaded = true
        Palette.buf[this.buf_id] = this.colors
        for (let color_id = 0; color_id < 3; color_id++) {
            color.setColor(this.abs_id(color_id), (this.colors as any[])[color_id])
        }
        if (debug.log_load) {debug.log("Loaded palette " + this.buf_id)}
    }

    public free() {
        if (!this.loaded) return;
        this.loaded = false;
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
interface Widget {
    palette: Palette
    x: number
    y: number
    render(img: Image, wx: number, wy: number): void;
}

class WLabel implements Widget {
    palette: Palette
    x: number
    y: number
    text: string
    constructor(palette: Palette, x: number, y: number, text: string, font?: image.Font) {
        this.palette = palette
        this.x = x
        this.y = y
        this.text = text
    }

    public render(img: Image, wx: number, wy: number): void {
        img.print(this.text, wx + this.x, wy + this.y, this.palette.abs_id(2), imageX.font.IBM_BIOS_4x8)
    }
}

class Window {
    palette: Palette
    widgets: Widget[]
    x: number
    y: number
    w: number
    h: number
    constructor(palette: Palette, x: number, y: number, w: number, h: number) {
        this.palette = palette
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
        let titlesize: number = 8
        img.fillRect(this.x, this.y, this.w, titlesize, c1)
        img.drawLine(this.x, this.y + titlesize, this.x, this.y + this.h - 1, c1)
        img.drawLine(this.x + this.w - 1, this.y + titlesize, this.x + this.w - 1, this.y + this.h - 1, c1)
        img.drawLine(this.x + 1, this.y + this.h - 1, this.x + this.w - 2, this.y + this.h - 1, c1)
        //let shadow: number = 2;
        //imageX.fillCheckerRect(img, this.x + this.w, this.y + shadow, shadow, this.h - shadow, c1)
        //imageX.fillCheckerRect(img, this.x + shadow, this.y + this.h, this.w, shadow, c1)
        // Render widgets
        for (let widget_id = 0; widget_id < this.widgets.length; widget_id++) {
            this.widgets[widget_id].render(img, this.x + 2, this.y + titlesize + 1)
        }
    }

    public add_widget(widget: Widget): number {
        this.widgets.push(widget)
        return this.widgets.length - 1
    }

    public remove_widget(widget_id: number): Widget {
        return this.widgets.removeAt(widget_id)
    }
}

class Screen {
    img: Image
    windows: Window[]
    palette: Palette
    constructor(palette: Palette) {
        this.img = image.create(160, 120)
        this.windows = []
        this.palette = palette
    }

    public render() {
        // Clear screen
        this.img.fill(this.palette.abs_id(0))
        // Render windows
        for (let window_id = 0; window_id < this.windows.length; window_id++) {
            this.windows[window_id].render(this.img)
        }
        // Update screen
        scene.setBackgroundImage(this.img)
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
class system {
    static theme: [number, number, number] = [0x210613, 0xf63090, 0xfffff5]
    static palette: Palette = new Palette(system.theme)
    static screen: Screen = new Screen(system.palette)
}

// Debug
debug.log_load = true
debug.log_free = true

// Load system resources
system.palette.load(0)

// Disable uninitialized key bindings
controller.up.onEvent(ControllerButtonEvent.Pressed, dummy)
controller.down.onEvent(ControllerButtonEvent.Pressed, dummy)
controller.left.onEvent(ControllerButtonEvent.Pressed, dummy)
controller.right.onEvent(ControllerButtonEvent.Pressed, dummy)
controller.A.onEvent(ControllerButtonEvent.Pressed, dummy)
controller.B.onEvent(ControllerButtonEvent.Pressed, dummy)
controller.menu.onEvent(ControllerButtonEvent.Pressed, dummy)

// Initialize scene
scene.setBackgroundColor(0)

// Initialize screen
let label: WLabel = new WLabel(system.palette, 0, 0, " !\"#$%&'()*+,-./0123456789")
let window: Window = new Window(system.palette, 0, 0, 0, 0)
let label_id = window.add_widget(label)
let window_id: number = system.screen.add_window(window)

// Render windows
forever(() => {system.screen.render()})

