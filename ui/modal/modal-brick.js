import Modal from "zengular-modal/src/modal";
import Brick from "zengular-brick";

export default class ModalBrick extends Brick{

	static createModal(parent = null){
		let modal = new Modal();
		if(parent !== null) modal.parent = parent;
		modal.body = this.create('div', true, modal);
		modal.body.controller.modal = modal;
		modal.body.controller.initializeModal(modal);
		modal.onShow = (args) => { modal.body.controller.onShowModal(args); };
		modal.onClose = () => { return modal.body.controller.onCloseModal(); };
		return modal;
	};

	onShowModal(args){ this.setup(args);}

	onCloseModal(){}

}