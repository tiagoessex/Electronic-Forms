/**
 * Retrieve the value of a given cookie.
 * @param {string} name Cookie name.
 * @returns The cookie value.
 */
 export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


/**
 * For the fetch.
 * @param {object} response Response object.
 * @returns Either a json response or throws an error
 */
 export function handleErrors(response) {
    if (!response.ok) {
        console.error(response);
        throw Error(response.status + ' - ' + response.statusText);
    }
    return response.json();
}

/**
 * 
 * @param {*} url 
 * @param {*} onResult 
 * @param {*} onError 
 * @param {*} extra_options 
 * @returns A promisse.
 */
export function fetchGET(url, onResult = null, onError = null, extra_options=null) {
    let options = {
        method: 'GET',
        mode: 'same-origin',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
    }
    if (extra_options) options = {...options, ...extra_options};
    return fetch(url, options)
    .then(handleErrors)
    .then(result => {
        //if (onResult) onResult(result);
        return Promise.resolve(onResult?onResult(result):result);
    })
    .catch((error) => {
        if (onError) onError(error);
    })
}

/**
 * 
 *
 * @param {*} url 
 * @param {*} data 
 * @param {*} onResult 
 * @param {*} onError 
 * @param {*} stringify 
 * @param {*} type 
 * @param {*} extra_options 
 * @returns A promisse.
 */
export function fetchPOST(url, data={}, onResult = null, onError = null, stringify=true, type='application/json;charset=utf-8', extra_options=null) {
    let options = {
        method: 'POST',
        mode: 'same-origin',
        headers: {
            //'Content-Type': type,
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: stringify?JSON.stringify(data):data
    }
    if (type && type !== '' && typeof type !== 'undefined') {
        options.headers = {...options.headers, ...{'Content-Type': type}};
    }
    if (extra_options) options = {...options, ...extra_options};
    return fetch(url, options)
    .then(handleErrors)
    .then(result => {
        //if (onResult) onResult(result);
        return Promise.resolve(onResult?onResult(result):result);
    })
    .catch((error) => {
        if (onError) onError(error);
    })
}

/**
 * 
 * @param {*} url 
 * @param {*} data 
 * @param {*} onResult 
 * @param {*} onError 
 * @returns A promisse.
 */
export function fetchPUT(url, data=null, onResult = null, onError = null) {
    return fetch(url, {
        method: 'PUT',
        mode: 'same-origin',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: data
    })
    .then(handleErrors)
    .then(result => {
        //if (onResult) onResult(result);
        return Promise.resolve(onResult?onResult(result):result);
    })
    .catch((error) => {
        if (onError) onError(error);
    })
}


export function fetchBlob(url, onResult = null, onError = null) {
    return fetch(url)
    .then(response => {
        return response.blob();
    })
    .then(myBlob => {
        return Promise.resolve(onResult?onResult(myBlob):myBlob);        
    })
    .catch((error) => {
        if (onError) onError(error);
    })
}