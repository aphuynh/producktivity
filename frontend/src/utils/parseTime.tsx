export function parseDateTime(timeString: string){
    let d = new Date(timeString);
    let h = d.getHours()
    let m = d.getMinutes()
    let t = ((h > 12) ? (h - 12) : h) + ":" + ((m < 10) ? "0" : "") + m  + ((h > 12) ? "PM" : "AM")
    let day = d.getDate()
    let month = d.getMonth()
    let year = d.getFullYear()
    return (month + 1) + "/" + day + "/" + year + " " + t
}

export function parseDate(timeString: string){
    let d = new Date(timeString);
    let day = d.getDate()
    let month = d.getMonth()
    let year = d.getFullYear()
    return (month + 1) + "/" + day + "/" + year;
}

export function parseTime(timeString: string){
    let d = new Date(timeString);
    let h = d.getHours()
    let m = d.getMinutes()
    let t = ((h > 12) ? (h - 12) : h) + ":" + ((m < 10) ? "0" : "") + m  + ((h > 12) ? "PM" : "AM")
    return t;
}

export function timeLeft(timeString: string){
    let d = Date.parse(timeString);
    let dNow = Date.now();

    let s = (d- dNow) / 1000;
    let timeWord = s > 0 ? "left" : "late"

    s = Math.abs(s);

    //if number of seconds left is less than an hour
    if(s < 60 * 60){
        return "Less than an hour " + timeWord;
    //if number of seconds less than 24 hours
    }else if(s < 60 * 60 * 24){
        return Math.floor(s / (60 * 60)) + " hour(s) " + timeWord;
    //if less than a week
    }else if (s < 60 * 60 * 24 * 7){
        return Math.floor(s / (60 * 60 * 24)) + " day(s) " + timeWord;
    //if less than a month
    }else if (s < 60 * 60 * 24 * 30){
        return Math.floor(s / (60 * 60 * 24 * 7)) + " week(s) " + timeWord;
    //if less than a year
    }else if (s < 60 * 60 * 24 * 30 * 12){
        return Math.floor(s / (60 * 60 * 24 * 30)) + " month(s) " + timeWord;
    //else return number of years
    }else{
        return Math.floor(s / (60 * 60 * 24 * 365)) + " year(s) " + timeWord;
    }
}

export function isLate(timeString: string){
    return (Date.parse(timeString) - Date.now()) < 0 ? "true" : "false";
}