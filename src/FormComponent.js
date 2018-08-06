goog.module('chaos.ui.FormComponent');

const {Component} = goog.require('chaos.ui.Component');

class FormComponent extends Component
{
    get form ()
    {
        return this._formElement;
    }


    get elements ()
    {
        return this.form.elements;
    }


    get formControlComponents ()
    {
        
    }


    /** @override */
    constructor (element)
    {
        super(element);

        this._formElement;
    }


    /** @override */
    async _init ()
    {
        let forms = Array.from(/** @type {NodeList<HTMLFormElement>} */ 
            (this.element.querySelectorAll('form')));

        if (this.element.tagName.toLowerCase() == 'form')
            forms.unshift(this.element);

        if (forms.length > 0)
            throw new Error(`Selecting form element is ambigious.`);

        this._formElement = /** @type {HTMLFormElement} */ (forms.shift());
    }
}

Component.add(FormComponent, 'form');
exports = {FormComponent};
