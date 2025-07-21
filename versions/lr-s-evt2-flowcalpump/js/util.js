/* wait関数 */
const wait = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/*htmlエスケープ関数*/
const escapeHtml= (str) => {
  str = str.replace(/&/g, '&amp;');
  str = str.replace(/</g, '&lt;');
  str = str.replace(/>/g, '&gt;');
  str = str.replace(/"/g, '&quot;');
  str = str.replace(/'/g, '&#39;');
  return str;
}
/*カンマ区切りの文字を数値配列に変える関数*/
const parseNumbers = (input) => {
  // 半角スペースと全角スペースを削除
  input = input.replace(/[\s　]/g, '');
  // 全角数字を半角数字に変換
  input = input.replace(/[０-９]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
  // カンマで分割し、数値に変換
  return input.split(',').map(function(item) {
    return parseInt(item, 10);
  });
}
/*textareaへのlog関数*/
const pageConsole = document.getElementById("pageConsole");
const textLog = (
  (txtarea) => {
    return (txt) => {
      const isScrolledToBottom = txtarea.scrollHeight - txtarea.clientHeight <= txtarea.scrollTop + 26;//2rem
      txtarea.textContent += (txt+'\r\n');
      if(isScrolledToBottom){
        txtarea.scrollTop = txtarea.scrollHeight;
      }
    }
  }
)(pageConsole)

const loggingConsole = document.getElementById("loggingConsole");
const dataLog = (
  (txtarea) => {
    return (txt) => {
      const isScrolledToBottom = txtarea.scrollHeight - txtarea.clientHeight <= txtarea.scrollTop + 26;//2rem
      txtarea.textContent += (txt+'\r\n');
      if(isScrolledToBottom){
        txtarea.scrollTop = txtarea.scrollHeight;
      }
    }
  }
)(loggingConsole)

/*数値→Uint8配列変換*/
function numToUint8Array(data, num) {
  const arr = new Uint8Array(num);
  for (let i = 0; i < num; i++) {
    arr[i] = (data >> (8 * (num - i - 1))) & 0xff;
  }

  return arr;
}

/*Uint8配列のconcat*/
function mergeUint8Arrays(arrays) {
  let length = 0;
  arrays.forEach((array) => {
    length += array.length;
  });

  const mergedArray = new Uint8Array(length);
  let offset = 0;
  arrays.forEach((array) => {
    mergedArray.set(array, offset);
    offset += array.length;
  });

  return mergedArray;
}

/*Uint8配列→Uint16数値変換(入力オブジェクトはただの配列でもＯＫ)*/
function uint8ArrayToUint16(array, littleEndian){
  const view = new DataView(new Uint8Array(array).buffer);
  if(littleEndian){
    return view.getUint16(0,true)
  }else{
    return view.getUint16(0,false)
  }
}

/*Uint8配列→Uint32数値変換(入力オブジェクトはただの配列でもＯＫ)*/
function uint8ArrayToUint32(array, littleEndian){
  const view = new DataView(new Uint8Array(array).buffer);
  if(littleEndian){
    return view.getUint32(0,true)
  }else{
    return view.getUint32(0,false)
  }
}

class IntervalManager{
  constructor(func, interval){
    this.id = 0;
    this.func = func;
    this.interval = interval;
    this.hasBeenStarted = false;
    this.hasBeenSet = false;
  }
  
  start(){
    if(!(this.hasBeenSet)){
      this.id = setInterval(this.func, this.interval);
      this.hasBeenSet = true;
    }
    this.hasBeenStarted = true;
  }

  stop(){
    if(this.hasBeenSet){
      clearInterval(this.id);
      this.hasBeenSet = false;
    }
    this.hasBeenStarted = false;
  }

  suspend(){
    if(this.hasBeenStarted && this.hasBeenSet){
      clearInterval(this.id);
      this.hasBeenSet = false;
    }
  }

  resume(){
    if(this.hasBeenStarted && !(this.hasBeenSet)){
        this.id = setInterval(this.func, this.interval);
        this.hasBeenSet = true;
    }
  }
  
  changeInterval(interval){
    this.interval = interval;
    if(this.hasBeenSet){
      this.stop();
      this.start();
    }
  }
}

class TimeoutLoop{
  constructor(func, interval){
    this.id = 0;
    this.clearFlag = false;
    this.func = func;
    this.interval = interval;
    this.hasBeenStarted = false;
    this.hasBeenSet = false;
  }
  
  async #loop(){
    await this.func();
    this.id = setTimeout(() => {this.#loop()}, this.interval);
    if(this.clearFlag){
      clearTimeout(this.id);
      this.hasBeenSet = false;
    }
  }
  
  start(){
    if(!(this.hasBeenSet)){
      this.clearFlag = false;
      this.#loop();
      this.hasBeenSet = true;
    }
    this.hasBeenStarted = true;
  }

  stop(){
    this.clearFlag = true;
    this.hasBeenStarted = false;
  }

  suspend(){
    this.clearFlag = true;
  }

  resume(){
    if(this.hasBeenStarted && !(this.hasBeenSet)){
        this.start();
    }
  }
  
  changeInterval(interval){
    this.interval = interval;    
  }
}