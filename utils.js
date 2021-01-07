function addOne(index) {
    return index + 1;
  }
  
  let page = 1;
  
  function date() {
    let date = new Date();
    // return Date.UTC()
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  }
  
  function toColumnName(num) {
    for (var ret = "", a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
    }
    return ret;
  }
  