// Wait for system to load completely
system.onLoad = () => {
    // Debug
    debug.log_load = true
    debug.log_free = true
    debug.log_add_handler = true
    debug.log_remove_handler = true
    debug.log_event = true

    // Initialize screen
    let custompalette: Palette = new Palette([0x14185C, 0x0091D9, 0xF2EAE6])
    custompalette.load(1)

    let label: WLabel = new WLabel(system.palette, 0, 0, "This is an example text.\nHello, World!", imageX.font.SYS_4x8)
    
    let number_textbox: WTextBox = new WTextBox(system.palette, 0, 0, 4, WTextBoxInputType.Number, imageX.cursor.SYS_TEXT, imageX.font.SYS_4x8)
    let text_textbox: WTextBox = new WTextBox(system.palette, 21, 0, 4, WTextBoxInputType.Text, imageX.cursor.SYS_TEXT, imageX.font.SYS_4x8)
    let password_textbox: WTextBox = new WTextBox(system.palette, 42, 0, 4, WTextBoxInputType.Password, imageX.cursor.SYS_TEXT, imageX.font.SYS_4x8)

    let textbox_groupbox: WGroupBox = new WGroupBox(system.palette, 1, 22, 80, 20, "Example groupbox", imageX.font.SYS_4x8)
    textbox_groupbox.add_widget(number_textbox)
    textbox_groupbox.add_widget(text_textbox)
    textbox_groupbox.add_widget(password_textbox)

    let progressbar: WProgressBar = new WProgressBar(system.palette, 0, 45, 54, 10, 10, 100)
    
    let checkbox: WCheckBox = new WCheckBox(system.palette, 0, 60, "Example checkbox", imageX.cursor.SYS_HAND, imageX.font.SYS_4x8)

    let button_eventListener = new EventListener()
    button_eventListener.add_handler(new EventHandler(() => {
        progressbar.progress += 2
        if (progressbar.progress == progressbar.max_progress) {
            system.screen.add_window(new MessageBox(system.palette, "Full", "Be cautious!", MessageBoxType.OkOnly, imageX.font.SYS_4x8))
        }
    }))
    let button: WButton = new WButton(system.palette, 0, 99, 64, 10, "Example button", imageX.cursor.SYS_HAND, button_eventListener, imageX.font.SYS_4x8)
    
    let window: Window = new Window(system.palette, 0, 0, 0, 0, "Example window", false, imageX.cursor.SYS_ARROW, imageX.font.SYS_4x8)
    window.add_widget(label)
    window.add_widget(button)
    window.add_widget(textbox_groupbox)
    window.add_widget(checkbox)
    window.add_widget(progressbar)
    system.screen.add_window(window)

    let movablewindow: Window = new Window(custompalette, 98, 9, 60, 40, "Another Window", true, imageX.cursor.SYS_MOVE, imageX.font.SYS_4x8)
    movablewindow.add_widget(new WLabel(custompalette, 0, 0, "Grab my title\nbar and move\nme!", imageX.font.SYS_4x8))
    let movablebutton_eventListener = new EventListener()
    movablebutton_eventListener.add_handler(new EventHandler(() => { movablewindow.destroy() }))
    movablewindow.add_widget(new WButton(custompalette, 29, 20, 27, 9, "Close", imageX.cursor.SYS_HAND, movablebutton_eventListener, imageX.font.SYS_4x8))
    system.screen.add_window(movablewindow)
}