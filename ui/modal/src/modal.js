import './modal.less';

export default class Modal{

	constructor(){
		this.parent = document.body;
		this.element = document.createElement('div');
		this.element.classList.add('modal-wrapper');
		this.element.innerHTML = '<div><header class="modal-head"><span>Alert</span><i class="close fa fa-times"></i></header><section class="modal-body"></section><footer class="modal-footer"></footer></div>';
		this.element.querySelector('header.modal-head i.close').addEventListener('click', event => { this.close();});
		this.element.addEventListener('click', event => { event.stopPropagation(); });
	}

	set width(width){
		if(width === null){
			this.element.firstChild.style.removeProperty('width');
			this.element.firstChild.style.removeProperty('max-width');
		}else{
			this.element.firstChild.style.setProperty('width', width);
			this.element.firstChild.style.setProperty('max-width', 'none');
		}
	}
	set height(height){
		if(height === null) this.element.firstChild.style.removeProperty('height');
		else this.element.firstChild.style.setProperty('height', height);
	}
	set title(title){
		this.modalHead.style.display = title === false ? 'none' : 'block';
		this.modalHead.querySelector('span').innerHTML = title;
	}
	set closeButton(show){ this.modalHead.querySelector('i.close').style.display = show ? 'block' : 'none'; }

	get classList(){ return this.modalBody.classList; }
	get modalBody(){ return this.element.querySelector('section.modal-body'); }
	get modalFooter(){ return this.element.querySelector('footer.modal-footer'); }
	get modalHead(){ return this.element.querySelector('header.modal-head'); }

	shake(timeout = 800){
		this.element.firstChild.classList.add('shake');
		setTimeout(() => {this.element.firstChild.classList.remove('shake');}, timeout);
	}

	addButton(label, callback = null, style = null){
		let button = document.createElement('button');
		button.innerHTML = label;

		if(callback === 'close' || callback === false){
			button.addEventListener('click', event => { this.close();});
		}else if(typeof callback === 'function'){
			button.addEventListener('click', event => { callback(event, this);});
		}
		if(style) button.classList.add(style);
		this.modalFooter.appendChild(button);
		return button;
	}

	clearButtons(){ while(this.modalFooter.firstChild) this.modalFooter.removeChild(this.modalFooter.firstChild); }

	show(data = null, parent = null){
		if(typeof this.body === 'string') this.modalBody.innerHTML = this.body;
		else if(typeof this.body === 'function') this.modalBody.innerHTML = this.body(data);
		else this.modalBody.appendChild(this.body);

		if(parent === null) parent = this.parent;
		parent.appendChild(this.element);

		window.requestAnimationFrame(() => {this.element.classList.add('visible');});
		if(typeof this.onShow === 'function') this.onShow(data, this);
	}

	close(){
		var closeme = true;
		if(typeof this.onClose === 'function') closeme = this.onClose(this);
		if(closeme !== false)this.element.parentNode.removeChild(this.element);
	}

}
