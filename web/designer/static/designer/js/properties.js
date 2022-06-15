/**
 * Properties of the current form:
 *      - id
 *      - name, description
 *      - author, creation date, updated date
 *      - stats (number of elements, type, number of pages, ...)
 */
export function Properties() {
    this.id = null;   
    this.name = '';
    this.description = '';
    this.created_by = null;
    this.date_created = null;
    this.updated_by = null;
    this.date_updated = null;
    this.n_pages = 0;
    this.n_sections = 0;
    this.n_groups = 0;
    this.n_eas = 0;
    this.n_elements = 0;
    this.is_temp = false;
}
