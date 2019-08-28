export default function datetimeLocal(date, T = false, zone = false){
	if(typeof date === 'string') date = new Date(date);
	let offset;
	return date.getFullYear()+'-'+
		('0' + (date.getMonth() + 1)).slice(-2)+'-'+
		('0' + (date.getDate())).slice(-2)+
		(T ? 'T' : ' ')+
		('0' + (date.getHours())).slice(-2)+':'+
		('0' + (date.getMinutes())).slice(-2)+':'+
		('0' + (date.getSeconds())).slice(-2)+
		(!zone?'':!(offset=new Date().getTimezoneOffset())?'Z':((offset > 0 ? '-' : '+')+
			('0'+Math.floor(Math.abs(offset)/60)).slice(-2)+':'+
			('0'+Math.floor(Math.abs(offset)%60)).slice(-2)));
}