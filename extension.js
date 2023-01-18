/* -*- mode: js2 - indent-tabs-mode: nil - js2-basic-offset: 4 -*- */
const {Clutter, Gio, GLib, Meta, Shell, St} = imports.gi;
const Lang = imports.lang;
const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();
// const Utils = Me.imports.utils;

let on_window_created, switch_button;


function getSettings(){
    let GioSSS = Gio.SettingsSchemaSource;
    let schemaSource = GioSSS.new_from_directory(
        Me.dir.get_child("schemas").get_path(),
        GioSSS.get_default(),
        false
    );
    let schemaObj = schemaSource.lookup(
        'org.gnome.shell.extensions.atmosphere', true);
    if (!schemaObj)
        throw new Error('cannot find schemas');
    return new Gio.Settings({ settings_schema : schemaObj});
}

const WindowShader = new Lang.Class({
    Name: 'WindowShader',

    _init: function(actor) {
        this._actor = actor
        this.brightness_effect = new Clutter.BrightnessContrastEffect();
        actor.add_effect(this.brightness_effect);
        this.desaturate_effect = new Clutter.DesaturateEffect();
        actor.add_effect(this.desaturate_effect);

        this.bg_blur_effect = new Shell.BlurEffect({
            brightness: 1, sigma: 3, mode: 1});
        let constraintPosX = new Clutter.BindConstraint({
            source: actor, coordinate: Clutter.BindCoordinate.X, offset: 0});
        let constraintPosY = new Clutter.BindConstraint({
            source: actor, coordinate: Clutter.BindCoordinate.Y, offset: 0});
        let constraintSizeX = new Clutter.BindConstraint({
            source: actor, coordinate: Clutter.BindCoordinate.WIDTH, offset: 0});
        let constraintSizeY = new Clutter.BindConstraint({
            source: actor, coordinate: Clutter.BindCoordinate.HEIGHT, offset: 0});
        this.bg_blur_actor = new Clutter.Actor();
        this.bg_blur_actor.add_constraint(constraintPosX);
        this.bg_blur_actor.add_constraint(constraintPosY);
        this.bg_blur_actor.add_constraint(constraintSizeX);
        this.bg_blur_actor.add_constraint(constraintSizeY);
        this.bg_blur_actor.add_effect_with_name('blur-effect', this.bg_blur_effect);
        actor.get_parent().insert_child_below(this.bg_blur_actor, actor);

        // let widget = new St.Widget({
        //     x: actor.x, y: actor.y, width: actor.width, height: actor.height});
        // this.bg_blur_effect = new Shell.BlurEffect({
        //     brightness: 1, sigma: 5, mode: 0});
        // widget.add_effect(this.bg_blur_effect);
        // actor.get_parent().add_child(widget);

        this.blur_effect = new Shell.BlurEffect({
            brightness: 1, sigma: 2, mode: 0});
        actor.add_effect(this.blur_effect);
        this.state = false;
    },

    set state(value) {
        this._state = value
        let s = getSettings();
        if (!value) {
            this._actor.set_opacity(255);
            this.brightness_effect.enabled = false;
            this.desaturate_effect.enabled = false;
            this.blur_effect.enabled = false;
            this.bg_blur_actor.hide();
            this.bg_blur_effect.enabled = false;
        }
        else {
            transparency = s.get_double('transparency');
            if (transparency > 0){
                this._actor.set_opacity(255 * (1.0 - transparency));
                this.bg_blur_actor.show();
                this.bg_blur_effect.enabled = true;
                this._actor.get_parent().set_child_below_sibling(
                    this.bg_blur_actor, this._actor);
            }
            brightness = s.get_double('brightness');
            contrast = s.get_double('contrast');
            if (brightness != 0.0 || contrast != 0.0){
                this.brightness_effect.set_contrast(contrast);
                this.brightness_effect.set_brightness(brightness);
                this.brightness_effect.enabled = true;
            }
            desaturate = s.get_double('desaturate')
            if (desaturate){
                this.desaturate_effect.set_factor(desaturate)
                this.desaturate_effect.enabled = true;
            }
            blur = s.get_int('blur')
            if (blur != 0){
                this.blur_effect.set_sigma(blur)
                this.blur_effect.enabled = true;
            }
        }
    },

    get state() {
        return this._state;
    }
});


function spawn(command) {
    let [status, pid] = GLib.spawn_async(
        null,
        ['/usr/bin/env', 'bash', '-c', command],
        null,
        GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
        null
    );

    // ensure we always close the pid to avoid zombie processes
    GLib.child_watch_add(
        GLib.PRIORITY_DEFAULT, pid,
        (_pid, _status) => {
            GLib.spawn_close_pid(_pid);
        });
}


function openSettings() {
    spawn(`gnome-extensions prefs atmosphere@craft.uas`)
}


function init(){
    switch_button = new St.Button({
        style_class: "panel-button",
    });
    let label = new St.Label({
        text: "shade",
        y_align: Clutter.ActorAlign.CENTER,
    });
    switch_button.set_child(label);
    switch_button.connect('button-release-event', openSettings);
}


function enable() {
    function use_shader(meta_window) {
        if (!meta_window)
            return false;
        var type = meta_window.get_window_type()
        return (type == Meta.WindowType.NORMAL ||
                type == Meta.WindowType.DIALOG ||
                type == Meta.WindowType.MODAL_DIALOG);
    }

    function verifyShader(window_actor) {
        if (window_actor.inactive_shader)
            return;
        var meta_window = window_actor.get_meta_window();
        if (!use_shader(meta_window)) {
            return;
        }
        window_actor.inactive_shader = new WindowShader(window_actor);
        if(!window_actor.inactive_shader)
            return;
        if (!meta_window.has_focus()) {
            window_actor.inactive_shader.state = true;
        }
    }

    function focus(meta_window) {
        global.get_window_actors().forEach(function(window_actor) {
            verifyShader(window_actor);
            if (!window_actor.inactive_shader)
                return;
            if (meta_window == window_actor.get_meta_window()) {
                window_actor.inactive_shader.state = false;
            } else if(window_actor.inactive_shader.state == false) {
                window_actor.inactive_shader.state = true;
            }
        });
    }

    function window_created(__unused_display, meta_window) {
        if (use_shader(meta_window))
            meta_window._shade_on_focus = meta_window.connect('focus', focus);
    }

    on_window_created = global.display.connect('window-created', window_created);
    global.get_window_actors().forEach(function(window_actor) {
        var meta_win = window_actor.get_meta_window();
        if (!meta_win)
            return;
        verifyShader(window_actor);
        window_created(null, meta_win);
    });

    Main.panel._centerBox.insert_child_at_index(switch_button, 0);
}


function disable() {
    if (on_window_created)
        global.display.disconnect(on_window_created);
    global.get_window_actors().forEach(function(wa) {
        var win = wa.get_meta_window();
        if (win && win._shade_on_focus) {
            win.disconnect(win._shade_on_focus);
            delete win._shade_on_focus;
        }
        if (wa.inactive_shader) {
            wa.inactive_shader.state = false;
            wa.remove_effect(wa.inactive_shader.brightness_effect);
            wa.remove_effect(wa.inactive_shader.blur_effect);
            wa.remove_effect(wa.inactive_shader.desaturate_effect);
            delete wa.inactive_shader;
        }
    });

    Main.panel._centerBox.remove_child(switch_button);
}
