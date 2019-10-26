
function openNewTab(event)
{
    chrome.tabs.create({ url: event.target.href });
    return false;
}

function onLoad(event)
{
    var param = {};
    var list = window.location.search.substr(1).split('&');
    
    while (list.length)
    {
	var pair = list.shift().split('=', 2);
	param[pair[0]] = pair[1];
    }
    
    msgInstalled.style.display = param.previous ? 'none' : '';
    msgUpdated.style.display = param.previous ? '' : 'none';
    msgIncognitoAccess.style.display = param.incognito ? '' : 'none';
    msgMultiSearch.style.display = param.mulsrch ? '' : 'none';
    msgIdmNotInstalled.style.display = param.manager ? 'none' : '';
    msgIdmNeedsUpdate.style.display = param.manager && param.update ? '' : 'none';

    if (param.msedge)
    {
	msgBrowserName.innerText = 'Microsoft Edge';
	msgAppMinVersion1.innerText =
	msgAppMinVersion2.innerText = '6.26 build 14';
    }
    else if (param.mzffox)
    {
	msgBrowserName.innerText = 'Mozilla Firefox';
	msgAppMinVersion1.innerText = 
	msgAppMinVersion2.innerText = '6.28';
    }
    
    linkContactSupport.href += window.location.search;
    linkExtensions.onclick = openNewTab;
}

window.onload = onLoad;
