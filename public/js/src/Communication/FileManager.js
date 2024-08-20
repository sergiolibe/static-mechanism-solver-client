import BackendCommunicator from "./BackendCommunicator.js";

class FileManager {
    _backendCommunicator;
    _fileSelector;
    _infoContainer;
    _currentFile;

    constructor(fileSelectorId, infoContainerId) {
        this._fileSelector = document.getElementById(fileSelectorId);
        this._fileSelector.onchange = this.onChangeSelector;

        this._infoContainer = document.getElementById(infoContainerId);
    }

    set backendCommunicator(backendCommunicator) {
        if (backendCommunicator instanceof BackendCommunicator)
            this._backendCommunicator = backendCommunicator;
        else
            throw new Error('Expected instance of BackendCommunicator, get: ' + backendCommunicator)
    }

    async fetchStaticSystems() {
        this.showInfo('Fetching Systems');
        await this._backendCommunicator.fetchStaticSystems().then(response => {
            this._fileSelector.innerHTML = '';

            if (response.success === false)
                throw new Error('Failed fetching static systems');

            this.showInfo('Systems successfully fetched');
            response.list_of_static_systems.forEach((staticSystemName) => {
                let optionNode = document.createElement('option');

                optionNode.value = staticSystemName;
                optionNode.textContent = staticSystemName;

                this._fileSelector.appendChild(optionNode);
            });

            if (this._fileSelector.value !== '' && this._currentFile === undefined) {
                this._currentFile = this._fileSelector.value;
            }
            this.fetchStaticSystem(this._currentFile);
            // console.log('received systems');
        });
    }

    fetchStaticSystem(staticSystemName) {
        this._backendCommunicator.fetchStaticSystem(staticSystemName).then(response => {
            if (response.success === false) {
                this.showInfo('Failed Fetching ' + staticSystemName)
                throw new Error('Failed uploading static system');
            }

            this.showInfo('Loaded ' + staticSystemName)

            this._currentFile = this._fileSelector.value;

            // console.log(response.system_data);
            this.updateSystemJson(response.system_data, 'file-manager');

        });
    }

    async uploadStaticSystem(systemData, nameOfStaticSystem) {
        this.showInfo('Uploading static system [ ' + nameOfStaticSystem + ' ]');
        await this._backendCommunicator.uploadStaticSystem(systemData, nameOfStaticSystem).then(response => {
            this._fileSelector.innerHTML = '';

            if (response.success === false)
                throw new Error('Failed uploading static system');

            this.showInfo('Uploaded [ ' + nameOfStaticSystem + ' ]');
            // console.log('uploaded system');

            return this.fetchStaticSystems();

        }).then(response => {
            // console.log('after fetch');

            this.markFileAsSelected(nameOfStaticSystem);

        });
    }

    updateCurrentStaticSystem(systemData) {
        let nameOfStaticSystem = this._currentFile;
        // console.log(nameOfStaticSystem);
        this.uploadStaticSystem(systemData, nameOfStaticSystem).then(response => {
            // console.log('Saved');
            this.showInfo('Saved');
        });
    }

    markFileAsSelected(fileName) {
        this._fileSelector.value = fileName;
    }

    showInfo(someText) {
        this._infoContainer.innerHTML = someText;
    }

    notifyJsonChanged() {
        this.showInfo('Changes not saved *')
    }

    onChangeSelector = (e) => {
        let staticSystemName = e.target.value;
        this.showInfo('Fetching ' + staticSystemName)
        this.fetchStaticSystem(staticSystemName);
    }

    updateSystemJson(json, origin) {
    }
}

export default FileManager;