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
    let window: Window = new Window(system.palette, 0, 0, 0, 0, "Example window", imageX.font.SYS_4x8)
    let label_id: number = window.add_widget(label)
    let window_id: number = system.screen.add_window(window)
}