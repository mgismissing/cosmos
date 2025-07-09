// Wait for system to load completely
system.onLoad = () => {
    // Debug
    debug.log_load = true
    debug.log_free = true
    debug.log_add_handler = true
    debug.log_remove_handler = true
    debug.log_event = true

    // Initialize screen
    let label: WLabel = new WLabel(system.palette, 0, 0, "This is an example text.\nHello, World!", imageX.font.SYS_4x8)
    let button_eventListener = new EventListener()
    let button_eventHandler = new EventHandler(() => { console.log("The user pressed the button!") })
    let button_eventHandler_id = button_eventListener.add_handler(button_eventHandler)
    let button: WButton = new WButton(system.palette, 0, 99, 64, 10, "Example button", imageX.cursor.SYS_HAND, button_eventListener, imageX.font.SYS_4x8)
    let textbox: WTextBox = new WTextBox(system.palette, 0, 40, 4, WTextBoxInputType.Number, imageX.cursor.SYS_HAND, imageX.font.SYS_4x8)
    let window: Window = new Window(system.palette, 0, 0, 0, 0, "Example window", imageX.font.SYS_4x8)
    let label_id: number = window.add_widget(label)
    let button_id: number = window.add_widget(button)
    let textbox_id: number = window.add_widget(textbox)
    let window_id: number = system.screen.add_window(window)

    let msgbox: MessageBox = new MessageBox(system.palette, "Message box", "This is my custom message\nbox!", MessageBoxType.OkOnly, imageX.font.SYS_4x8)
    let msgbox_id: number = system.screen.add_window(msgbox)
}