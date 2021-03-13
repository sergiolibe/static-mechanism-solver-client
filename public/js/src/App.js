import BackendCommunicator from "./Communication/BackendCommunicator.js";
import BackgroundCanvas from "./Drawing/BackgroundCanvas.js";
import DynamicCanvas from "./Drawing/DynamicCanvas.js";
import FileManager from "./Communication/FileManager.js";
import StaticCanvas from "./Drawing/StaticCanvas.js";
import StaticSystem from "./Core/StaticSystem.js";

class App {
    _jsonEditor;
    _backgroundCanvas;
    _staticCanvas;
    _dynamicCanvas;
    _staticSystem;
    _backendCommunicator;
    _fileManager;
    _jsonData;

    constructor(config) {
        this._jsonData = config.base_json;

        this.initializeJsonEditor(config.json_editor_id);
        this._staticSystem = new StaticSystem(this._jsonData);

        this._backendCommunicator = new BackendCommunicator(config.backend_url);
        this.initializeFileManager(config.file_selector_id,config.info_container_id);

        this.initializeBackgroundCanvas(config.background_canvas_id);
        this.initializeStaticCanvas(config.static_canvas_id);
        this.initializeDynamicCanvas(config.dynamic_canvas_id)
        this.solveSystem();
    }

    initializeFileManager(fileSelectorId, infoContainerId) {
        this._fileManager = new FileManager(fileSelectorId, infoContainerId);
        this._fileManager.backendCommunicator = this._backendCommunicator;
        this._fileManager.fetchStaticSystems();
        this._fileManager.updateSystemJson = this._onChangeJSON;
    }

    initializeBackgroundCanvas(backgroundCanvasId) {
        this._backgroundCanvas = new BackgroundCanvas(backgroundCanvasId);
    }

    initializeStaticCanvas(staticCanvasId) {
        this._staticCanvas = new StaticCanvas(staticCanvasId);
        this._staticCanvas.staticSystem = this._staticSystem;
        this._staticCanvas.drawSystem();
    }

    initializeDynamicCanvas(dynamicCanvasId) {
        this._dynamicCanvas = new DynamicCanvas(dynamicCanvasId);
        this._dynamicCanvas.staticSystem = this._staticSystem;
        this._dynamicCanvas.backgroundCanvas = this._backgroundCanvas;
        this._dynamicCanvas.staticCanvas = this._staticCanvas;
        this._dynamicCanvas.fileManager = this._fileManager;
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
            this._onChangeJSON(jsonData, 'json-editor');
        } catch (e) {
            this.notifyError(e);
        }
    }

    _onChangeJSON = (json, origin = '') => {
        this._jsonData = json;
        if (origin !== 'json-editor')
            this._jsonEditor.set(this._jsonData);

        this._staticSystem.reBuild(this._jsonData);

        if (origin === 'json-editor' || origin === 'file-manager')
            this._staticCanvas.resetReactions();

        if (origin !== 'file-manager')
            this._fileManager.notifyJsonChanged();

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