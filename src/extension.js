
const St = imports.gi.St;
const Main = imports.ui.main;
const Keyboard = imports.ui.keyboard.Keyboard;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

// This the D-Bus interface as XML
const OnboardInterface = '<node> \
  <interface name="org.onboard.Onboard.Keyboard"> \
    <method name="ToggleVisible"> \
    </method> \
    <method name="Show"> \
    </method> \
    <method name="Hide"> \
    </method> \
  </interface> \
</node>';

// Declare the proxy class based on the interface
const OnboardProxy = Gio.DBusProxy.makeProxyWrapper(OnboardInterface);

// Get the /org/onboard/Onboard/Keyboard instance from the bus
let OnbProxy = new OnboardProxy(
    Gio.DBus.session,
    "org.onboard.Onboard",
    "/org/onboard/Onboard/Keyboard"
);


let showBackup
let hideBackup

function init() {
    
}

function enable() {
    showBackup = Keyboard.prototype['_show']
    Keyboard.prototype['_show'] = function(monitor) {
        if (!this._keyboardRequested)
            return;

        Main.layoutManager.keyboardIndex = monitor;
        if( Main.actionMode == 1) //1=Shell.ActionMode.NORMAL) // No activity overview etc.
            { // hide caribou, show onboard
                this._hideSubkeys();
                Main.layoutManager.hideKeyboard();

                OnbProxy.ShowSync();   
                this._keyboardVisible = true;
            }
        else
            { // hide onboard, show caribou
                OnbProxy.HideSync();

                this._redraw();
                Main.layoutManager.showKeyboard();
            }
        this._destroySource();
    }

    hideBackup = Keyboard.prototype['_hide']
    Keyboard.prototype['_hide'] = function() {
        OnbProxy.HideSync();
        if (this._keyboardRequested)
            return;

        this._hideSubkeys();
        Main.layoutManager.hideKeyboard();
        this._createSource();
    }

    GLib.spawn_command_line_async( "onboard", null ); // Start onboard
}

function disable() {
    Keyboard.prototype['_show'] = showBackup
    Keyboard.prototype['_hide'] = hideBackup
}
