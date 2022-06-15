//  #####################################
//  #                                   #
//  #   DATE / TIME RELATED FUNCTIONS   #
//  #                                   #
//  #####################################

/**
 *  
 * @param {string} mysql_timestamp MySql timestamp.
 * @param {string} connector Connector between date and time.
 * @returns A date | time string from a mysql TimeStamp field value. 
 */
 export function mysqlTimeStamp2JS(mysql_timestamp, connector = ' ') {
    return mysql_timestamp.substr(0,10) + connector + mysql_timestamp.substr(11,8);
}


/**
 * Current date YYYY-MM-DD.
 * @returns The current date in YYYY-MM-DD format.
 */
 export function today() {
    var date = new Date();
    var day = ("0" + date.getDate()).slice(-2);
    var month = ("0" + (date.getMonth() + 1)).slice(-2);    
    return date.getFullYear() + "-" + (month) + "-" + (day);
}



/**
 * Delay with a promise.
 * 
 * @param {number} ms Time in ms.
 * @returns A promise.
 */
 export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
