import { fetchGET } from '/static/js/Fetch.js';
import { URL_LIST_FORM_ASSETS } from '/static/js/urls.js';
import { Translator } from '/static/js/Translator.js';
import { getFileFromUrl } from '/static/js/urls.js';

/**
 * DISPLAYS TABLE LISTING ALL ASSETS RELATED WITH A FORM.
 * 
 * @param {object} context Context object.
 * @param {number} id Form id.
 * @param {function} func 
 */
 export function DisplayAssets ( context, id, func ) {
    $("body").css("cursor","progress");
    fetchGET(
      URL_LIST_FORM_ASSETS + id, 
      (result) => {
        if (result.length > 0) {
          let str = '<table class="table table-bordered table-sm" style="width: 30%">';
          str += `<colgroup>
            <col span="1" style="width: 15%;">
            <col span="1" style="width: 85%;">
          </colgroup>`;
          for (let i=0; i < result.length; i++ ) {
            const file = getFileFromUrl(result[i].asset);
            str += '<tr>'+
                      '<td class="bg-warning">' + result[i].type_name + '</td>'+
                      '<td><a href="' + result[i].asset + 
                      '" target="_blank" rel="noreferrer noopener">' + file + '</a></td>'+
                    '</tr>';
          }
          str += '</table>';
          func(str);
        } else {
          func('<h3><span class="badge badge-info p-2">' + Translator.translate('NO ASSETS') + '</span></h3>');
        }
        //$('#manager-spinner').hide();
        $("body").css("cursor","auto");
      },
      (error) => context.signals.onError.dispatch(error,"[DisplayAssets::DisplayAssets]")
      ) 
}