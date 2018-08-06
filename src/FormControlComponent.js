goog.module('chaos.ui.FormControlComponent');

const {Component} = goog.require('chaos.ui.Component');
const {Validatable} = goog.require('chaos.core.Validatable');

/**
 * Describes the type for html form control elements
 * @typedef {(HTMLInputElement|HTMLSelectElement|HTMLTextareElement)}
 */
const HTMLFormControlElement;


/**
 * Basic component class to control form elements
 * @implements {Validatable}
 */
class FormControlComponent extends Component
{
    /**
     * Public accessor to get the form control element
     * @public
     * @return {HTMLFormControlElement}
     */
    get formControlElement ()
    {
        return this._formControlElement;
    }


    /**
     * Public accessor to get the form element of the form control element
     * @public
     * @return {HTMLFormElement}
     */
    get form ()
    {
        return this.formControlElement.form;
    }


    /**
     * Public accessor to get the name of the form. control element
     * @public
     * @return {string}
     */
    get name ()
    {
        return this.formControlElement.name;
    }


    /**
     * Public accessor to set the name of the form. control element
     * @public
     * @param {string} name
     */
    set name (name)
    {
        this.formControlElement.name = name;
    }


    /**
     * Public accessor to get the name of the form. control element
     * @public
     * @return {string}
     */
    get value ()
    {
        return this.formControlElement.value;
    }


    /**
     * Public accessor to set the name of the form. control element
     * @public
     * @param {string} value
     */
    set value (value)
    {
        this.formControlElement.value = value;
    }


    /**
     * Indicates, whether the component is a proxy or not
     */
    get isProxy ()
    {
        return false;
    }


    /** @override */
    constructor (element)
    {
        super(element);
        
        /**
         * Provides the form control element
         * @type {HTMLFormControlElement}
         */
        this._formControlElement = null;    
    }


    /** @override */
    async _init ()
    {
        this._formControlElement = this.getFormControlElement();

        if (!this._formControlElement)
            throw new TypeError(`Form control element not found.`);
    }


    /**
     * Returns the form control element, which shall be controlled by this 
     * component
     * @public
     * @return {HTMLFormControlElement}
     */
    getFormControlElement ()
    {
        throw new Error(`Subclass of FormControlComponent must implement` + 
            `getFormControlElement()`);
    }
}

exports = {FormControlComponent, HTMLFormControlElement};