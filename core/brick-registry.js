import Brick from "./brick";

/**
 * @property {Object<string, typeof Brick>} registry
 * @property {MutationObserver} domObserver
 */
class BrickRegistry {

    constructor(){
        this.domObserver = new MutationObserver((mutationsList) => {
            mutationsList.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) this.initializeElements();
            });
        });
        this.registry = {};
    }

    /**
     * @param {typeof Brick} target
     */
    register(target) {        this.registry[target.tag] = target;}

    /**
     * @param {string} tag
     * @returns {Brick | undefined}
     */
    getBrick(tag){return this.registry[tag];}

    /**
     * @param {HTMLElement} root
     */
    initialize(root  = document.body) {
        this.domObserver.observe(root, {attributes: false, childList: true, subtree: true});
        this.initializeElements();
    }

    /**
     * @param {HTMLElement} scope
     */
    initializeElements(scope = document.body) {
        scope.querySelectorAll('[is]:not([brick-initialized])').forEach(element => {
            let tag = element.getAttribute('is');
            let brick = this.registry[tag];
            if (brick) new brick(element);
        });
    }

}

let registry = new BrickRegistry();
export default registry;