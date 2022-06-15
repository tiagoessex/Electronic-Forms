//  ################################
//  #                              #
//  #   RANDOM RELATED FUNCTIONS   #
//  #                              #
//  ################################


/**
 * Generates a random number between [min, max].
 * @param {number} min Minimum number.
 * @param {number} max Maximum number.
 * @returns a random number between [min, max]
 */
export function random(min,max) {
    const num = Math.floor(Math.random()*(max-min)) + min;
    return num;
}
  

