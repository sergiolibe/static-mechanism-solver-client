class BackendCommunicator {
    _url;

    constructor(url) {
        this._url = url;
        Object.freeze(this);
    }

    async submitSystem(systemData) {

        let request_body = {
            system_data: systemData,
            action: "solve_system"
        };

        const response = await fetch(this._url + '/static_system.php', {
            method: 'POST',
            mode: "cors",
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
}

export default BackendCommunicator;