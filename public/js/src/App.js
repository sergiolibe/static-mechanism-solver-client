import BackendCommunicator from "./Communication/BackendCommunicator.js";
import DynamicCanvas from "./Drawing/DynamicCanvas.js";
import StaticCanvas from "./Drawing/StaticCanvas.js";
import StaticSystem from "./Core/StaticSystem.js";

class App {
    _jsonEditor;
    _staticCanvas;
    _dynamicCanvas;
    _staticSystem;
    _backendCommunicator;
    _jsonData;

    constructor(config) {
        this._jsonData = config.base_json;

        this.initializeJsonEditor(config.json_editor_id);
        this._staticSystem = new StaticSystem(this._jsonData);

        this._backendCommunicator = new BackendCommunicator(config.backend_url);
        this.initializeStaticCanvas(config.static_canvas_id);
        this.initializeDynamicCanvas(config.dynamic_canvas_id)
        this.solveSystem();
    }

    initializeStaticCanvas(staticCanvasId) {
        this._staticCanvas = new StaticCanvas(staticCanvasId);
        this._staticCanvas.staticSystem = this._staticSystem;
        this._staticCanvas.drawSystem();
    }

    initializeDynamicCanvas(dynamicCanvasId) {
        this._dynamicCanvas = new DynamicCanvas(dynamicCanvasId);
        this._dynamicCanvas.staticSystem = this._staticSystem;
        this._dynamicCanvas.staticCanvas = this._staticCanvas;
        this._dynamicCanvas.updateSystemJson = this._onChangeJSON;
    }

    initializeJsonEditor(jsonEditorContainerId) {
        let jsonContainer = document.getElementById(jsonEditorContainerId);
        this._jsonEditor = new JSONEditor(jsonContainer, this.jsonEditorOptions());
        this._jsonEditor.set(this._jsonData);
    }

    jsonEditorOptions() {
        let self = this;
        return {
            mode: 'code',
            onChangeText: this._onChangeText
        };
    }

    _onChangeText = (jsonString) => {
        try {
            let jsonData = JSON.parse(jsonString);
            this._onChangeJSON(jsonData);
        } catch (e) {
            this.notifyError(e);
        }
    }

    _onChangeJSON = (json) => {
        this._jsonData = json;
        this._jsonEditor.set(this._jsonData);
        this._staticSystem.reBuild(this._jsonData);
        // this._staticCanvas.resetReactions();
        this._staticCanvas.drawSystem();
        this.solveSystem();
    }

    notifyError(e) {
        console.error(e.message);
    }

    solveSystem() {
        this._backendCommunicator.submitSystem(this._jsonData).then(response => {
            this._staticCanvas.drawReactions(response.list_of_reactions);
        });
    }
}

export default App;