import './style.less';
import ContextmenuItem from './contextmenu-item';

export default class Contextmenu{

	constructor(){
		this.menu = document.createElement('ul');
		this.menu.classList.add('px-context-menu');
		this.items = {};
		this.context = null;
		document.body.appendChild(this.menu);
		document.addEventListener('click', () => { this.hide(); });
	}

	add(label, icon, name = null){
		let item = new ContextmenuItem(label, icon, this);
		if(typeof name === 'string') this.items[name] = item;
		this.menu.appendChild(item.item);
		return item;
	}

	disable(name){ this.items[name].disable(); }
	enable(name){ this.items[name].enable(); }
	setItemStatus(name, status){
		if(status) this.items[name].enable();
		else this.items[name].disable();
	}

	show(event, context){

		event.preventDefault();
		this.context = context;

		this.menu.classList.add('active');

		let coords = this.constructor.getCoords(event);
		let y = coords.clickY;
		let x = coords.clickX;
		if(coords.clientY + this.menu.offsetHeight + 10 > window.innerHeight) y -= this.menu.offsetHeight + coords.clientY - window.innerHeight + 10;
		if(coords.clientX + this.menu.offsetWidth + 10 > window.innerWidth) x -= this.menu.offsetWidth + coords.clientX - window.innerWidth + 10;
		this.menu.style.top = y + 'px';
		this.menu.style.left = x + 'px';

	}

	hide(){ this.menu.classList.remove('active'); }

	static getCoords(event){
		let clickX = 0;
		let clickY = 0;

		if((event.clientX || event.clientY) && document.body && document.body.scrollLeft != null){
			clickX = event.clientX + document.body.scrollLeft;
			clickY = event.clientY + document.body.scrollTop;
		}

		if((event.clientX || event.clientY) && document.compatMode === 'CSS1Compat' && document.documentElement && document.documentElement.scrollLeft != null){
			clickX = event.clientX + document.documentElement.scrollLeft;
			clickY = event.clientY + document.documentElement.scrollTop;
		}

		if(event.pageX || event.pageY){
			clickX = event.pageX;
			clickY = event.pageY;
		}

		return {
			clickX : clickX,
			clickY : clickY,
			clientX: event.clientX,
			clientY: event.clientY,
			screenX: event.screenX,
			screenY: event.screenY
		};
	}
}

