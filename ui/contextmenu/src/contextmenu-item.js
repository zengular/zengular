export default class ContextmenuItem{

	constructor(label, icon, menu){
		this.enabled = true;
		this.menu = menu;
		this.item = document.createElement('li');
		this.item.innerHTML = `<i class="${icon}"></i> ${label}`;
		this.item.addEventListener('click', (event)=>{
			event.stopPropagation();
			if(typeof this.onclick === 'function' && this.enabled){
				this.onclick(this.menu.context);
				this.menu.hide();
			}
		})
	}

	click(onclick){
		this.onclick = onclick;
		return this;
	}

	enable(){
		this.enabled = true;
		this.item.classList.remove('disabled');
		return this;
	}

	disable(){
		this.item.classList.add('disabled');
		this.enabled = false;
		return this;
	}

}