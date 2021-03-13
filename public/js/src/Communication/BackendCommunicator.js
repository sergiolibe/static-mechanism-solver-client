class BackendCommunicator {
    _url;

    constructor(url) {
        this._url = url;
        Object.freeze(this);
    }

    async submitSystem(systemData) {

        let request_body = {
            system_data: systemData,
            action: 'solve_system'
        };

        const response = await fetch(this._url + '/static_system.php', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request_body)
        });

        return await response.json();
    }

    async fetchStaticSystem(nameOfStaticSystem) {

        let query_params = {
            name: nameOfStaticSystem,
            action: 'fetch_static_system'
        };

        let query_string = this.objToQueryString(query_params);

        const response = await fetch(this._url + '/static_system_files.php?' + query_string, {
            method: 'GET',
            mode: 'cors',
        });

        return await response.json();
    }

    async fetchStaticSystems() {

        let query_params = {
            action: 'fetch_static_systems'
        };

        let query_string = this.objToQueryString(query_params);

        const response = await fetch(this._url + '/static_system_files.php?' + query_string, {
            method: 'GET',
            mode: 'cors',
        });

        return await response.json();
    }

    async uploadStaticSystem(systemData, nameOfStaticSystem) {

        let request_body = {
            system_data: systemData,
            name: nameOfStaticSystem,
            action: 'upload_static_system'
        };

        const response = await fetch(this._url + '/static_system_files.php', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request_body)
        });

        return await response.json();
    }


    get url() {
        return this._url;
    }

    set url(value) {
    }

    objToQueryString(obj) {
        return new URLSearchParams(obj).toString();
    }
}

export default BackendCommunicator;