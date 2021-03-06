import _ from './config.js';
import App from "./src/App.js";


let config = {
    'json_editor_id': 'jsoneditor',
    'background_canvas_id': 'background-canvas',
    'static_canvas_id': 'static-canvas',
    'dynamic_canvas_id': 'dynamic-canvas',
    'file_selector_id': 'file-selector',
    'info_container_id': 'info-container',
    'backend_url': _.BACKEND_URL,
    'base_json': _.BASE_JSON
}

let app = new App(config);