declare class Brick {
    static register(tag, twig);
    static addClass(classes);
    static renderOnConstruct(render);
    static cleanOnConstruct(clean);
    static registerSubBricksOnRender(register);
    static observeAttributes(attributes);
    static listen(eventNames);
}
