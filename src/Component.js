goog.module('chaos.ui.Component');

const EventTarget = goog.require('goog.events.EventTarget');

/**
 * Describes the type of the component constructor
 * @typedef {function(new:Component, Element)}
 */
let ComponentClass;

/**
 * Provides the uid, which will be used for the next genrated id. During 
 * component initialization, the corresponding element object is examined for
 * the id attribute. If it doesn't contain one, a id will be generated using
 * this value.
 * @type {number}
 */
let __nextGenUid = 1;

/**
 * Provides a map where key is the name with which to associate a component
 * and value is the component class.
 * @type {Map<string, ComponentClass>}
 */
let __invokationNameToConstructorMap = new Map;

/**
 * Provides a map, where key is the element id, which is decorated by the
 * component and value is the component itself.
 * @type {Map<string, Component>}
 */
let __uidToInstanceMap = new Map;


/**
 * Base class of the component system. This class is also used to manage the
 * components (registering, instanciating, etc.)
 */
class Component extends EventTarget
{
    /**
     * Provides the element, which this component decotrates
     * @public
     * @return {Element}
     */
    get element ()
    {
        return this._element;
    }


    /**
     * Public accessor to get all components within this component
     * @public
     * @return {Array<Component>}
     */
    get components ()
    {
        return this.querySelectorAll(`[${Component.ATTRIBUTE_NAME}]`);
    }


    /**
     * Public accessor to get the name, with which the component has been 
     * invoked.
     * @public
     * @return {string}
     */
    get invokationName ()
    {
        return this._element.getAttribute(Component.ATTRIBUTE_NAME);
    }

    /**
     * Public accessor to determine if the component has been initialized or
     * not. This is independent from success or failure.
     * @public 
     * @return {boolean}
     */
    get initialized ()
    {
        return this._initialized;
    }


    /**
     * Creates a new Component instance
     * @public
     * @param {Element} element The element by which the component has been 
     *  invoked
     */
    constructor (element)
    {
        /**
         * Provides the element, whic this component decorates
         * @private
         * @type {Element}
         */
        this._element = element;

        /**
         * Indicates, whether the init function has been called or not
         * @private
         * @type {boolean}
         */
        this._initialized = false;
    }


    /**
     * Initializes the component. This method has only once an effect
     * @public
     * @final
     * @return {Promise}
     */
    async ready ()
    {
        if (!this.initialized)
        {
            try 
            {
                this._initialized = true;
                await Promise.all(this.components
                    .map(component => component.ready()));
                await this._init();
            }
            catch (error)
            {
                throw new Error(`Failed to initialize component for ` + 
                    `<${this.element.tagName} id="${this.element.id}">`);
            }
        }

        return this;
    }


    /** 
     * Actual method to initialize this component
     * @protected
     * @return {*}
     */
    async _init () {}


    /**
     * Returns all components within the element of this component matching the 
     * given class name.
     * @public
     * @param {string} className
     * @return {Array<Component>}
     */
    getComponentsByClassName (className)
    {
        return Component.getComponentsByClassName(className, this.element);
    }


    /**
     * Returns all components within the element of this component matching the 
     * given name.
     * @public
     * @param {string} name
     * @return {Array<Component>}
     */
    getComponentsByName (name)
    {
        return Component.getComponentsByTagName(name, this.element);
    }


    /**
     * Returns all components within the element of this component matching the 
     * given tag name.
     * @public
     * @param {string} tagName
     * @return {Array<Component>}
     */
    getComponentsByTagName (tagName)
    {
        return Component.getComponentsByTagName(tagName, this.element);
    }


    /**
     * Returns the componentn matching the selector
     * @public
     * @param {string} selector
     * @return {?Component}
     */
    querySelector (selector)
    {
        return Component.querySelector(selector, this.element);
    }


    /**
     * Returns all components within the element of this component matching the 
     * given tag name.
     * @public
     * @param {string} selector
     * @return {Array<Component>}
     */
    querySelectorAll (selector)
    {
        return Component.querySelectorAll(selector, this.element);
    }


    /**
     * Symbol to represent the name of the data attribute in which the 
     * invokation name is specified
     * @public
     * @return {string}
     */
    static get ATTRIBUTE_NAME ()
    {
        return 'data-component';
    }


    /**
     * Returns all existing components in the document
     * @public
     * @return {Array<Component>}
     */
    static get all ()
    {
        return Component
            .querySelectorAll(`[${Component.ATTRIBUTE_NAME}]`);
    }


    /**
     * Registers a component class with the names to associate the class with
     * @public
     * @param {ComponentClass} ctor The constructor of the component
     * @param {...string} invokationNames A list of names, with which a component may be invokated
     */
    static add (ctor, ...invokationNames)
    {
        if (invokationNames.length == 0)
        {
            throw new Error(`Missing names to register component ` + 
                `${ctor.name}.`);
        }


        if (!(ctor.prototype instanceof Component))
        {
            throw new TypeError(`'${ctor.name}' must be a subclass of ` + 
                `Component`);
        }


        invokationName.forEach(invokationName => {

            let key = invokationName.trim().toLowerCase();

            if (__invokationNameToConstructorMap.has(key))
            {
                console.info(`Component with name ${invokationName} has ` + 
                    `already been registered. Will be overwritten.`);
            }

            __invokationNameToConstructorMap.set(key, ctor);
        });
    }


    /**
     * Initializes all components in the document
     * @return {Promise}
     */
    static async init ()
    {
        return Promise.all(Component.all.map(component => component.ready()))
            .catch(reason => {
                console.warn(reason);
            });
    }


    /**
     * Returns the component for the given element
     * @public
     * @param {Element} element
     * @return {?Component}
     */
    static getComponentByElement (element)
    {
        let instance = null;

        try 
        {
            /* Components are created by one of the names, which have previously
            been registered with Component.register(). If the same element has 
            been passed to this method prior, the same component instance will
            be returned. */

            
            /* Verify, that the element is requesting a component at all, by
            testing the existence of the data attribute in which the component
            name is specified. */

            /** @type {string} */
            let invokationName = element.getAttribute(Component.ATTRIBUTE_NAME);

            if (!invokationName)
            {
                throw new Error(`Element has no attribute ` + 
                    `${Component.ATTRIBUTE_NAME} or name is empty to invoke ` 
                    + `a component instance`);
            }


            /* We want to ensure that the element has an id. Either it has one 
            already or we generate one. The id will work as a key for the map,
            that stores the instance of an element. */

            /** @type {string} */
            let elementId = element.id || `__${Component.ATTRIBUTE_NAME}` +
                `_${__nextGenUid}`;


            /* With thte id, we check if there is an instance already. If not,
            we create a new one. */

            if (!__uidToInstanceMap.has(elementId))
            {
                /* We fetch the constructor by the component name specified in 
                the component data attribute from the map, that has been used in
                Component.register(), to associate key names for an component
                class. */

                /** @type {ComponentClass} */
                let ctor = __invokationNameToConstructorMap.get(invokationName);

                if (!ctor)
                {
                    throw new Error(`No component class found for invokation ` + 
                        `name ${invokationName}.`)
                }


                /* Create the instance and register it to the map. */

                instance = new ctor(element);
                instance.ready();
                __invokationNameToConstructorMap.set(invokationName, instance);

                
                /* Only increase the generator, if it has been used prior. */
                
                if (!element.id) __nextGenUid++;

                
                /* Ensure to have an element id. Next time we call this method
                with the same element, we simply return the instance from the 
                map using the element id. */

                element.setAttribute('id', elementId);
            }
            else
            {
                instance = __uidToInstanceMap.get(elementId);
            }
        }
        catch (error)
        {
            console.error(error);
        }

        return instance;
    }


    /**
     * Returns a list of components for a given list of elements. The method 
     * filters null before returning the list.
     * @public
     * @param {NodeList|Array<Element>} elements
     * @return {Array<Component>}
     */
    static getComponentsByElements (elements)
    {
        return Array.from(elements)
            .map(element => Component.getComponentByElement(element))
            .filter(component => component != null);
    }


    /**
     * Returns the component by the id of its element
     * @public
     * @param {string} id The id of the element
     * @return {?Component}
     */
    static getComponentById (id)
    {
        let element = /** @type {Element} */ (document.getElementById(id));
        return element ? Component.getComponentByElement(element) : null;
    }


    /**
     * Returns all components within the given parent dom matching the given 
     * name.
     * @public
     * @param {string} name The name to match with the name-attribute
     * @param {(Element|Document)=} parentDom The root of the hierarchy in which to search
     * @return {Array<Component>}
     */
    static getComponentsByClassName (className, parentDom = document)
    {
        let elements = parentDom.getElementsByName(className);
        return Componentn.getComponentsByElements(elements);
    }


    /**
     * Returns all components within the given parent dom matching the given 
     * tag name.
     * @public
     * @param {string} tagName The tag name to match
     * @param {(Element|Document)=} parentDom The root of the hierarchy in which to search
     * @return {Array<Component>}
     */
    static getComponentsByTagName (tagName, parentDom = document)
    {
        let elements = parentDom.getElementsByName(className);
        return Componentn.getComponentsByElements(elements);
    }


    /**
     * Returns the component within the given parent dom matching the given 
     * selector.
     * @public
     * @param {string} selector The selector to use
     * @param {(Element|Document)=} parentDom The root of the hierarchy in which to search
     * @return {?Component}
     */
    static querySelector (selector, parentDom = document)
    {
        let element = parentDom.querySelector(selector);
        return element ? Componentn.getComponentByElement(element) : null;
    }


    /**
     * Returns all components within the given parent dom matching the given 
     * selector.
     * @public
     * @param {string} selector The selector to match
     * @param {(Element|Document)=} parentDom The root of the hierarchy in which to search
     * @return {Array<Component>}
     */
    static querySelectorAll (selector, parentDom = document)
    {
        let elements = parentDom.querySelectorAll(selector);
        return Componentn.getComponentsByElements(elements);
    }
}

exports = {Component, ComponentClass};