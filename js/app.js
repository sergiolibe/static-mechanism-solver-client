"use strict";

class BackendCommunicator {
    constructor(prod_url) {
        this.prod_url = prod_url;
    }

    async submitSystem(systemData) {

        let request_body = {
            system_data: systemData,
            action: "solve_system"
        };

        const response = await fetch(this.prod_url + '/static_system.php', {
            method: 'POST',
            mode: "cors",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request_body)
        });

        return await response.json();
    }
}