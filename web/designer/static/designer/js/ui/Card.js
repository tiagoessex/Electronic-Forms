
import { Div } from '/static/js/ui/BuildingBlocks.js';

/**
  *  Simple Bootstrap 4 Card.
  */
export class Card extends Div {
  /**
   * Constructor.
   * @param {string} id Card ID.
   * @param {string} header_title Card title.
   * @param {string} header_bg Bootstrap 4 background header color.
   * @param {string} text_color Bootstrap 4 header text color.
   */
  constructor(id, header_title, header_bg = 'bg-light', text_color = 'text-dark') {
        super();
        this.id = id;

        this.addClass('card shadow m-2 bg-white rounded');
        this.setId(id)

        this.header = new Div().attachTo(this);
        this.header.addClass('card-header font-weight-bold');
        this.header.addClass(header_bg);
        this.header.addClass(text_color);
        this.header.setTextContent(header_title);

        this.body = new Div().attachTo(this);
        this.body.addClass('card-body p-0');
  }
}