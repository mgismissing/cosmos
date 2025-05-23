//  -------------------------------------------------------------------------------------------- DEBUG ---

class debug {
    static log_load: boolean = false;
    static log_free: boolean = false;
    static log(data: string) {
        console.log("[DEBUG] " + data)
    }
}

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

//  ------------------------------------------------------------------------------------ ASSET-MANAGER ---
class Palette {
    static buf: number[][] = [null, null, null, null, null]

    buf_id: number
    colors: number[]
    loaded: boolean

    constructor(colors: number[]) {
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
            color.setColor(this.buf_id * 3 + color_id, this.colors[color_id])
        }
        if (debug.log_load) {debug.log("Loaded palette " + this.buf_id)}
    }

    public free() {
        if (!this.loaded) return;
        this.loaded = false;
        for (let color_id = 0; color_id < 3; color_id++) {
            color.setColor(this.buf_id * 3 + color_id, 0x000000)
        }
        if (debug.log_free) {debug.log("Freed palette " + this.buf_id)}
    }
}

//  ------------------------------------------------------------------------------------------- SCREEN ---
class Widget {
    constructor() {
        throw_(new NotImplementedException("__init__", "Widget"))
    }

}

class Window {
    palette: Palette
    constructor(palette: Palette) {
        this.palette = palette
    }

}

//  --------------------------------------------------------------------------------------------- MAIN ---
class system {
    static palette: Palette = new Palette([0x210613, 0xf63090, 0xfffff5])
}

debug.log_load = true
debug.log_free = true

system.palette.load(0)