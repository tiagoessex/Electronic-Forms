
export class TimeLoop {
  /**
   * Constructor.
   * @param {number} delta Time in milliseconds.
   * @param {function} onTimeout Called when timeout.
   */
  constructor (delta, onTimeout = null) {
    this.delta = delta;
    this.onTimeout = onTimeout;
    this.timer = null;
  }

  /**
   * Starts timer.
   */
  start() {
    if (this.timer) this.stop();
    this.timer = setInterval(this.onTimeout, this.delta);
  }

  /**
   * Stops timer.
   */
  stop() {
    clearInterval(this.timer);
  }

  /**
   * Sets a new time interval. 
   * @param {number} new_delta Time in milliseconds.
   */
  setDelta(new_delta) {
    this.delta = new_delta;    
  }
}