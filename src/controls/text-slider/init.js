import * as UI from "../lib/ui.js";

function PluginInstance() {
    var pluginRootFolder = '/plugins/text-slider/'
    var plug = this;

    this.render = () => {
        console.log('PLUGIN loading: text-slider...');
        let options = {
            description: 'Control text sliders on basketball scorebug.',
            overToolTip: 'Control text sliders on basketball scorebug.',
            caption: 'TEXT SLIDERS',
            color: 'blue'
        }
        this.btn = UI.button(options);    
        var app = document.getElementById("controllerPluginButtons"); 
        app.appendChild(this.btn);  
        this.btn.querySelector('#btn').addEventListener ("click", function() {
            plug.gotoSelectedUrl();
        });
    }

    this.gotoSelectedUrl = () => {
        window.open("https://gfx.dragonstv.io/plugins/text-slider", '_blank', 'popup');
    }
}

var plugin = plugin || new PluginInstance;
plugin.render();