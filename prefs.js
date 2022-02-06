const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();

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


function init(){
}

function buildPrefsWidget() {
    return new PrefsWidget();
}


function labeled_widget(label, widget) {
    let box = new Gtk.Box();
    box.set_orientation(Gtk.Orientation.HORIZONTAL);
    box.margin = 20;
    box.set_spacing(15);
    box.append(new Gtk.Label({label : label}));
    box.append(widget);

    return box
}


const PrefsWidget = new GObject.Class({
    Name : "Atmosphere.Prefs.Widget",
    GTypeName : "AtmospherePrefsWidget",
    Extends : Gtk.Box,

    _init : function (params){
        let settings = getSettings();
        const default_flags = Gio.SettingsBindFlags.DEFAULT;

        this.parent(params);
        this.margin = 20;
        this.set_spacing(15);
        this.set_orientation(Gtk.Orientation.VERTICAL);

        let widget = new Gtk.Switch();
        settings.bind('active', widget, 'active', default_flags);
        this.append(labeled_widget('active', widget));

        widget = new Gtk.Switch();
        settings.bind('panel-widget', widget, 'active', default_flags);
        this.append(labeled_widget('panel-widget', widget));

        widget = new Gtk.SpinButton();
        widget.set_digits(2)
        widget.set_range(-1.0, 1.0);
        widget.set_increments(0.05, 0.1);
        settings.bind('brightness', widget, 'value', default_flags);
        this.append(labeled_widget('brightness', widget));

        widget = new Gtk.SpinButton();
        widget.set_digits(2)
        widget.set_range(-1.0, 1.0);
        widget.set_increments(0.05, 0.1);
        settings.bind('contrast', widget, 'value', default_flags);
        this.append(labeled_widget('Contrast', widget));

        widget = new Gtk.SpinButton();
        widget.set_digits(2)
        widget.set_range(0.0, 1.0);
        widget.set_increments(0.05, 0.1);
        settings.bind('desaturate', widget, 'value', default_flags);
        this.append(labeled_widget('Desaturate', widget));

        widget = new Gtk.SpinButton();
        widget.set_digits(2)
        widget.set_range(0.0, 1.0);
        widget.set_increments(0.05, 0.1);
        settings.bind('transparency', widget, 'value', default_flags);
        this.append(labeled_widget('transparency', widget));

        widget = new Gtk.SpinButton();
        widget.set_range(0, 20);
        widget.set_increments(1, 2);
        settings.bind('blur', widget, 'value', default_flags);
        this.append(labeled_widget('Blur', widget));
    }
});
