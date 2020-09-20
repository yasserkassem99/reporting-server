function addOne(index){
    return index +1;
}

let page=1;

function date(){
    let date = new Date();
    // return Date.UTC()
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}` 
}
