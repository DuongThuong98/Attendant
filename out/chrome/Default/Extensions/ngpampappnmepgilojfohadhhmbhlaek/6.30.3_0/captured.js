
function onLoad(event)
{
    var param = {};
    var list = window.location.search.substr(1).split('&');
    
    while (list.length)
    {
	var pair = list.shift().split('=', 2);
	param[pair[0]] = pair[1];
    }
    
    if (param.back)
        window.history.back();
        
    msgCaptured.style.display   = param.register ? 'none' : '';
    msgRegistered.style.display = param.register ? '' : 'none';
}

window.onload = onLoad;
