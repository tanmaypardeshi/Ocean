import jwt_decode from 'jwt-decode';

export const getCookie = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

export const getDetailsFromCookie = () => {
    var cookie = getCookie("usertoken");
    return jwt_decode(cookie);
}

export const setUserTokenCookie = (cvalue) => {
    var date = new Date(Date.now() + 86400e3);
    date = date.toUTCString();  
    document.cookie = "usertoken=" + cvalue + ';' + date + ";path=/";	//cookie set
}
