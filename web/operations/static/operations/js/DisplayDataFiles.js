import { fetchGET } from '/static/js/Fetch.js';
import { URL_LIST_OPERATION_ASSETS } from '/static/js/urls.js';
import { Translator } from '/static/js/Translator.js';
import { getFileFromUrl } from '/static/js/urls.js';

/**
 * DISPLAY TABLE LISTING ALL FILES (IMAGES) RELATED WITH AN OPERATION.
 * 
 * @param {object} context Context object.
 * @param {number} id operation id.
 * @param {function} func 
 */
 export function DisplayDataFiles ( context, id, func ) {
   $("body").css("cursor","progress");

    fetchGET(
      URL_LIST_OPERATION_ASSETS + id, 
      (result) => {
        console.log(result);
        if (result.length > 0) {
          let str = '<table class="table table-bordered table-sm" style="width: 40%">';
          str += `<colgroup>
            <col span="1" style="width: 15%;">
            <col span="1" style="width: 70%;">
            <col span="1" style="width: 15%;">
          </colgroup>`;          
          for (let i=0; i < result.length; i++ ) {
            const file = getFileFromUrl(result[i].asset);
            str += '<tr>'
                    +  '<td class="bg-warning align-middle">' + result[i].type_name + '</td>'
                    +  '<td align-middle"><a href="' + result[i].asset 
                    + '" target="_blank" rel="noreferrer noopener">' + file + '</a></td>'
                    +  (result[i].is_annex ? '<td class="bg-info annex-asset align-middle text-center"> ' + Translator.translate('ANNEX') + ' </td>' : '<td class="bg-secondary annex-asset align-middle text-center"> ' + Translator.translate('INPUT') + ' </td>')
                    + '</tr>';
          }
          str += '</table>';
          func(str);
        } else {
          func('<h3><span class="badge badge-info p-2">' + Translator.translate('NO ASSETS') + '</span></h3>');
        }
        $("body").css("cursor","auto");
      },
      (error) => context.signals.onError.dispatch(error,"[DisplayAssets::DisplayAssets]")
      ) 
}


