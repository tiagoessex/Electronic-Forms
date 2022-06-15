
/**
 * Retrieve the value of a given cookie.
 * @param {string} name Cookie name.
 * @returns The cookie value.
 */
/*
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
*/

/**
 * For the fetch.
 * @param {object} response Response object.
 * @returns Either a json response or throws an error
 */
/*
 export function handleErrors(response) {
    if (!response.ok) {
        console.error(response);
        throw Error(response.status + ' - ' + response.statusText);
    }
    return response.json();
}
*/

/**
 * 
 * ATTENTION: returns no promise.
 * 
 * @param {*} url 
 * @param {*} onResult 
 * @param {*} onError 
 */
/*
export function fetchGET(url, onResult = null, onError = null) {
    fetch(url, {
        method: 'GET',
        mode: 'same-origin',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
    })
    .then(handleErrors)
    .then(result => {
        if (onResult) onResult(result);
    })
    .catch((error) => {
        if (onError) onError(error);
    })
}
*/
/**
 * ATTENTION: returns no promise.
 * 
 * @param {*} url 
 * @param {*} data 
 * @param {*} onResult 
 * @param {*} onError 
 */
/*
export function fetchPOST(url, data={}, onResult = null, onError = null) {
    fetch(url, {
        method: 'POST',
        mode: 'same-origin',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(data)
    })
    .then(handleErrors)
    .then(result => {
        if (onResult) onResult(result);
    })
    .catch((error) => {
        if (onError) onError(error);
    })
}
*/



/**
 * Ajax call.
 * Note: Django template tags can only be evaluated when the templates are loaded.
 *      So a full url should be used.
 * 
 * Example:
 *  var serializedData = $(this).serialize();
    ajaxCall(
            'POST', 
            "{% url 'entities:post_search_ents' %}", 
            serializedData, 
            'json',
            (data, textStatus, xhr) => { alert(data['entities']); },
            (xhr, status, error) => { alert("ERROR" + xhr.responseText); }
    );
 * @param {string} type 'POST' or 'GET'
 * @param {url} url Ex: "{% url 'entities:post_search_ents' %}"
 * @param {object} data Json data object
 * @param {function} done_func Callback in case of success
 * @param {function} fail_func  Callback in case of failure
 * @param {function} allways_func  Callback the will always be executed no matter what
 */
    export const ajaxCall = (type, url, data = {}, datatype='json', done_func = ()=> {}, fail_func = ()=> {}, allways_func = ()=> {}) => {
        $.ajax({
          type: type,
          url: url,
          data: data,
          dataType: datatype
        }).
        done (function( data, textStatus, xhr ) 
        {
            done_func(data, textStatus, xhr);          
        }).
            fail (function(xhr, status, error)
        {
            fail_func(xhr, status, error);
        }).
            always (function()
        {
            allways_func();
        })
    }
    