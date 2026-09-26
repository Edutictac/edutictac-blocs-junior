import {gn, getUrlVars} from '../utils/lib';

let place;

export function gettingStartedMain () { // eslint-disable-line import/prefer-default-export
    gn('closeHelp').onclick = gettingStartedCloseMe;
    gn('closeHelp').onmousedown = gettingStartedCloseMe;
    var videoObj = gn('myVideo');
    // junior: no carreguem el video introductori original de ScratchJr (marca).
    // Mostrem la imatge de marca i traiem els controls de reproduccio.
    if (videoObj) {
        videoObj.removeAttribute('src');
        videoObj.controls = false;
        videoObj.poster = 'assets/brand/logo-wordmark.svg';
    }

    var urlvars = getUrlVars();
    place = urlvars.place;
    document.onmousemove = function (e){
        e.preventDefault();
    };
}


function gettingStartedCloseMe () {
    window.location.href = 'home.html?place=' + place;
}
