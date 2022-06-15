/**
 * Separeted trees are created for each language.
 * Same file contains all data. Columns with translated data are marked by the respective language _XX.
 * 
 * TODO:
 * 	- different files for each language
 *  - on new lang selction => rebuild tree
 */

import { 
    URL_FOODEX_ATTRIBUTES, 
    URL_FOODEX_TERMS, 
} from '/static/js/urls.js'
import { loadCSVFile2Json } from '/static/js/jsfiles.js';
import { Translator } from '/static/js/Translator.js';

const FSM_MODAL = $("#foodex-modal");
const FSM_TERM_CODE_SELECTION = $("#foodex-selection-term-code");
const FSM_TERM_EXTENDED_CODE_SELECTION = $("#foodex-selection-term-extended-code");
const FSM_TERM_NAME_SELECTION = $("#foodex-selection-term-name");
const FSM_TERM_EXTENDED_NAME_SELECTION = $("#foodex-selection-term-extended-name");
const FSM_INPUT_SEARCH_TERM = $("#foodex-term-search");
const FSM_SEARCH_BUTTON = $("#foodex-term-search-btn");
const FSM_SEARCH_INCLUDE_NOTES = $("#foodex-search-include-notes");
const FSM_SEARCH_RESULTS = $("#foodex-search-results");
const FSM_TREE = $("#foodex-matrix-tree");
const FSM_TREE_PT = $("#foodex-matrix-tree-pt");
const FSM_SELECTED_TERM_CODE = $("#term-code");
const FSM_SELECTED_TERM_CODE_EXTENDED = $("#term-extended-code");
const FSM_SELECTED_TERM_NAME = $("#term-name");
const FSM_SELECTED_TERM_NAME_EXTENDED = $("#term-extended-name");
const FSM_SELECTED_TERM_NOTES = $("#term-notes");
const FSM_LANGUAGE_SELECTION = $('#foodex-language-selection');

export const FOODEX_WHAT = {
    CODE: 'CODE',
    EXTENDED_CODE: 'EXTENDED_CODE',
    NAME: 'NAME',
    EXTENDED_NAME: 'EXTENDED_NAME'
}

export function FoodexModal(context) {
	this.context = context;
	this.jstree = null;
	this.jstree_pt = null;
	this.tree_data = null;
	this.attributes = null;
    this.onSelection = null;
	this.last_selected = null;
	this.lang = 'en';
	const self = this;   


	// DATA SELECTED AND CLOSE
	FSM_TERM_CODE_SELECTION.on('click',function() {
        FSM_MODAL.modal('hide');
        if (self.onSelection) self.onSelection(FSM_SELECTED_TERM_CODE.val(), FOODEX_WHAT.CODE)
	});
	FSM_TERM_EXTENDED_CODE_SELECTION.on('click',function() {
        FSM_MODAL.modal('hide');
        if (self.onSelection) self.onSelection(FSM_SELECTED_TERM_CODE_EXTENDED.val(), FOODEX_WHAT.EXTENDED_CODE)
	});
	FSM_TERM_NAME_SELECTION.on('click',function() {
        FSM_MODAL.modal('hide');
        if (self.onSelection) self.onSelection(FSM_SELECTED_TERM_NAME.val(), FOODEX_WHAT.NAME)
	});
	FSM_TERM_EXTENDED_NAME_SELECTION.on('click',function() {
        FSM_MODAL.modal('hide');
        if (self.onSelection) self.onSelection(FSM_SELECTED_TERM_NAME_EXTENDED.val(), FOODEX_WHAT.EXTENDED_NAME)
	});


	FSM_INPUT_SEARCH_TERM.on('keyup', function(e) {
		if(e.keyCode == 13) {
			FSM_SEARCH_BUTTON.trigger("click");
		}
	});

	FSM_SEARCH_BUTTON.on('click', function() {
		const term = FSM_INPUT_SEARCH_TERM.val().toLowerCase();
		//console.log(term);
		const search_notes = FSM_SEARCH_INCLUDE_NOTES.prop('checked');
		if (term === '') return;
		$("body").css("cursor","progress");
		FSM_SEARCH_RESULTS.empty();
		// ITERATE			
		var jsonNodes = (self.lang === 'en' ? self.jstree.get_json('#', { flat: true }) : self.jstree_pt.get_json('#', { flat: true }));
		$.each(jsonNodes, function (i, val) {
			const text = $(val).attr('text');
			const id = $(val).attr('id');
			if (text.toLowerCase().includes(term) || (search_notes && $(val).attr('data').note && $(val).attr('data').note.toLowerCase().includes(term))) {		
				const option = $('<a>');
				option.text(text);
				option.addClass('mx-1 foodex-search-result');
				option.attr('data-id',id);
				FSM_SEARCH_RESULTS.append(option);
				const new_line = $('<br>');
				FSM_SEARCH_RESULTS.append(new_line);
			}			
		})
		$("body").css("cursor","auto");
			
		$('.foodex-search-result').on('click',function(e) {
			$('.foodex-search-result').removeClass('foodex-search-result-selected');
			$(this).addClass('foodex-search-result-selected');
				
			if (self.lang === 'en' && self.jstree) {
				self.jstree.deselect_all ();
				self.jstree.select_node($(this).attr('data-id'));
				// scroll to the leaf
				document.getElementById($(this).attr('data-id')).scrollIntoView()					
			} else if (self.lang === 'pt' && self.jstree_pt) {	
				self.jstree_pt.deselect_all ();
				self.jstree_pt.select_node($(this).attr('data-id'));
				// scroll to the leaf
				document.getElementById($(this).attr('data-id')).scrollIntoView()					
			}
		});
			
	});

	FSM_LANGUAGE_SELECTION.on('change', function() {
		const lang = $(this).val();
		if (lang === self.lang) return;
		self.lang = lang;
		FSM_INPUT_SEARCH_TERM.val("");		
		FSM_SELECTED_TERM_CODE.val("");
		FSM_SELECTED_TERM_CODE_EXTENDED.val("");
		FSM_SELECTED_TERM_NAME.val("");
		FSM_SELECTED_TERM_NAME_EXTENDED.val("");
		FSM_SELECTED_TERM_NOTES.val("");
		FSM_SEARCH_RESULTS.empty();	

        if (self.lang === 'en' && self.jstree) {
			self.jstree.deselect_all();
			self.jstree.close_all();
			self.jstree.open_node('ul > li:first'); 
			FSM_TREE_PT.toggleClass('d-none');
			FSM_TREE.toggleClass('d-none');
		} else if (self.lang === 'pt' && self.jstree_pt) {			
			self.jstree_pt.deselect_all();
			self.jstree_pt.close_all();
			self.jstree_pt.open_node('ul > li:first'); 
			FSM_TREE.toggleClass('d-none');
			FSM_TREE_PT.toggleClass('d-none');			
		}
	});	
	
}


FoodexModal.prototype = {

	show: function(onSelection = null) {
		//FSM_SELECTED_TERM_CODE.val("");
		//FSM_SELECTED_TERM_CODE_EXTENDED.val("");
		//FSM_SELECTED_TERM_NAME.val("");
		//FSM_SELECTED_TERM_NAME_EXTENDED.val("");
		//FSM_SELECTED_TERM_NOTES.val("");	

        this.onSelection = onSelection;
		FSM_INPUT_SEARCH_TERM.val("");
		FSM_SEARCH_INCLUDE_NOTES.prop('checked', false);
		FSM_SEARCH_RESULTS.empty();
		FSM_LANGUAGE_SELECTION.val('en');
		FSM_LANGUAGE_SELECTION.trigger('change');
		FSM_MODAL.modal('show');

		/*
        if (this.jstree) {		
			this.jstree.deselect_all();
			this.jstree('close_all');
			this.jstree.select_node('A0C5X');			
			this.jstree.select_node(this.last_selected);			
		}
		*/
	},

    close: function() {
		FSM_MODAL.modal('hide');
	},
	
	getExtentendedName: function(name, facets) {
		let ext_name = name + ", ";
		const _sub = facets.substring(facets.indexOf('#') + 1, facets.length);
		if (!_sub || _sub === '') return '';
		const parts = _sub.split('$');
		if (parts.length == 0) return '';
		parts.forEach((part, index) => {
		  const [attribute, term] = part.split('.');
		  if (!attribute || !term) return '';
		  for (let i=0; i<this.attributes.length; i++) {
			  if (this.attributes[i].code === attribute) {
				  ext_name += this.attributes[i].label.toUpperCase() + " = ";
				  break;
			  }			  
		  }
		  const node = this.lang === 'en'?this.jstree.get_node(term):this.jstree_pt.get_node(term);
		  ext_name += node.data.term_name;
		  if (index < parts.length - 1) ext_name += ", ";
		})
		return ext_name;
	},
	
	init: async function() {
		const self = this;
		// READ DATA
		const data = await loadCSVFile2Json(URL_FOODEX_TERMS, true).catch(err => {
			this.context.signals.onError.dispatch(Translator.translate('Error opening file ') + URL_FOODEX_TERMS,"[FoodexModal::init]");
			return [];
		});
		this.attributes = await loadCSVFile2Json(URL_FOODEX_ATTRIBUTES, true).catch(err => {
			this.context.signals.onError.dispatch(Translator.translate('Error opening file ') + URL_FOODEX_ATTRIBUTES,"[FoodexModal::init]");
			return [];
		});

		// SETUP TREE
		this.tree_data = [];
		this.tree_data_pt = [];
		for (let i =0; i<data.length; i++) {
			const row = data[i];	
			if (row.deprecated == 1 || row.termCode === '') continue;
			const leaf = {
				"id": row.termCode,
				"parent": row.masterParentCode === 'root'? "#" : row.masterParentCode,
				"text": row.termExtendedName + "[" + row.termCode + "]",
				"data": {"note": row.termScopeNote, "term_name": row.termExtendedName, "all_facets": row.allFacets, "extended_name":""},
				"state": {opened: row.masterParentCode === 'root'}, 
			}
			const leaf_pt = {
				"id": row.termCode,
				"parent": row.masterParentCode === 'root'? "#" : row.masterParentCode,
				"text": row.termExtendedName_pt + "[" + row.termCode + "]",
				"data": {"note": row.termScopeNote_pt, "term_name": row.termExtendedName_pt, "all_facets": row.allFacets, "extended_name":""},
				"state": {opened: row.masterParentCode === 'root'}, 
			}			
			if (typeof leaf.parent === "undefined" || leaf.parent === '' || leaf.parent.length > 6 ) {
				continue;
			}

			this.tree_data.push(leaf);
			this.tree_data_pt.push(leaf_pt);
		}
					
		

		// CREATE TREE
		FSM_TREE.jstree({ 'core' : {
				'data' : this.tree_data,
				"multiple" : false,		
			}
		});
		FSM_TREE_PT.jstree({ 'core' : {
				'data' : this.tree_data_pt,
				"multiple" : false,		
			}
		});		

		// NODE SELECTION
		FSM_TREE.on('select_node.jstree', function (e, data) {
			const note = data.node.data.note;
			
			FSM_SELECTED_TERM_CODE.val(data.node.id);
			FSM_SELECTED_TERM_CODE_EXTENDED.val(data.node.data.all_facets);
			FSM_SELECTED_TERM_NAME.val(data.node.data.term_name);
			FSM_SELECTED_TERM_NAME_EXTENDED.val(self.getExtentendedName(data.node.data.term_name, data.node.data.all_facets));
			// remove links
			const index = note.indexOf('�');
			FSM_SELECTED_TERM_NOTES.val(note.substring(0, index>0?index:note.length));	
			self.last_selected = data.node.id;						
		});
		FSM_TREE_PT.on('select_node.jstree', function (e, data) {
			const note = data.node.data.note;
			
			FSM_SELECTED_TERM_CODE.val(data.node.id);
			FSM_SELECTED_TERM_CODE_EXTENDED.val(data.node.data.all_facets);
			FSM_SELECTED_TERM_NAME.val(data.node.data.term_name);
			FSM_SELECTED_TERM_NAME_EXTENDED.val(self.getExtentendedName(data.node.data.term_name, data.node.data.all_facets));
			// remove links
			const index = note.indexOf('�');
			FSM_SELECTED_TERM_NOTES.val(note.substring(0, index>0?index:note.length));	
			self.last_selected = data.node.id;						
		});		


		FSM_TREE.on('ready.jstree', function() {
			self.jstree = FSM_TREE.jstree(true);
			FSM_SEARCH_BUTTON.attr('disabled',false);
			FSM_INPUT_SEARCH_TERM.attr('disabled',false);
		});
		FSM_TREE_PT.on('ready.jstree', function() {
			self.jstree_pt = FSM_TREE_PT.jstree(true);
			FSM_SEARCH_BUTTON.attr('disabled',false);
			FSM_INPUT_SEARCH_TERM.attr('disabled',false);
		});			
				
	},
}


