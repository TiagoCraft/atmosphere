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


const PrefsWidget = new GObject.Class({
    Name : "Atmosphere.Prefs.Widget",
    GTypeName : "AtmospherePrefsWidget",
    Extends : Gtk.Box,

    _init : function (params){
        let settings = getSettings();

        this.parent(params);
        this.margin = 20;
        this.set_spacing(15);
        this.set_orientation(Gtk.Orientation.VERTICAL);

        let brightnessBox = new Gtk.Box();
        brightnessBox.set_orientation(Gtk.Orientation.HORIZONTAL);
        brightnessBox.margin = 20;
        brightnessBox.set_spacing(15);
        this.append(brightnessBox);
        brightnessBox.append(new Gtk.Label({label : "Brightness"}));
        let brightnessSpinButton = new Gtk.SpinButton();
        brightnessSpinButton.set_digits(2)
        brightnessSpinButton.set_range(-1.0, 1.0);
        brightnessSpinButton.set_increments(0.05, 0.1);
        settings.bind('brightness', brightnessSpinButton, 'value',
                      Gio.SettingsBindFlags.DEFAULT)
        brightnessBox.append(brightnessSpinButton);

        let contrastBox = new Gtk.Box();
        contrastBox.set_orientation(Gtk.Orientation.HORIZONTAL);
        contrastBox.margin = 20;
        contrastBox.set_spacing(15);
        this.append(contrastBox);
        contrastBox.append(new Gtk.Label({label : "Contrast"}));
        let contrastSpinButton = new Gtk.SpinButton();
        contrastSpinButton.set_digits(2)
        contrastSpinButton.set_range(-1.0, 1.0);
        contrastSpinButton.set_increments(0.05, 0.1);
        settings.bind('contrast', contrastSpinButton, 'value',
                      Gio.SettingsBindFlags.DEFAULT)
        contrastBox.append(contrastSpinButton);

        let desaturateBox = new Gtk.Box();
        desaturateBox.set_orientation(Gtk.Orientation.HORIZONTAL);
        desaturateBox.margin = 20;
        desaturateBox.set_spacing(15);
        this.append(desaturateBox);
        desaturateBox.append(new Gtk.Label({label : "Desaturate"}));
        let desaturateSpinButton = new Gtk.SpinButton();
        desaturateSpinButton.set_digits(2)
        desaturateSpinButton.set_range(0.0, 1.0);
        desaturateSpinButton.set_increments(0.05, 0.1);
        settings.bind('desaturate', desaturateSpinButton, 'value',
                      Gio.SettingsBindFlags.DEFAULT)
        desaturateBox.append(desaturateSpinButton);

        let transparencyBox = new Gtk.Box();
        transparencyBox.set_orientation(Gtk.Orientation.HORIZONTAL);
        transparencyBox.margin = 20;
        transparencyBox.set_spacing(15);
        this.append(transparencyBox);
        transparencyBox.append(new Gtk.Label({label : "Transparency"}));
        let transparencySpinButton = new Gtk.SpinButton();
        transparencySpinButton.set_digits(2)
        transparencySpinButton.set_range(0.0, 1.0);
        transparencySpinButton.set_increments(0.05, 0.1);
        settings.bind('transparency', transparencySpinButton, 'value',
                      Gio.SettingsBindFlags.DEFAULT)
        transparencyBox.append(transparencySpinButton);

        let blurBox = new Gtk.Box();
        blurBox.set_orientation(Gtk.Orientation.HORIZONTAL);
        blurBox.margin = 20;
        blurBox.set_spacing(15);
        this.append(blurBox);
        blurBox.append(new Gtk.Label({label : "Blur"}))
        let blurSpinButton = new Gtk.SpinButton();
        // blurSpinButton.set_digits(1)
        blurSpinButton.set_range(0, 20);
        blurSpinButton.set_increments(1, 2);
        settings.bind('blur', blurSpinButton, 'value',
                      Gio.SettingsBindFlags.DEFAULT);
        blurBox.append(blurSpinButton);
    }
});
