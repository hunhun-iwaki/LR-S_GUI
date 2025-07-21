class SerialPort {
  #port;

  async serialInit(baud) {
    this.#port = await navigator.serial.requestPort();
 
    try{
      await this.#port.close(); 
    }catch(e){
     //Do nothing. 
    }
    await this.#port.open({ baudRate: baud });
  }

  serialDisconnect() {
    /*切断処理*/
  }

  async write(msg) {
      const writer = this.#port.writable.getWriter();
    try{ 
      const timer = setTimeout(() => {
          writer.abort();
        }, 100);
      await writer.write(Uint8Array.from(msg)); //msgだけでもいいか
      clearTimeout(timer);
    }catch(e){
      throw new Error("SerialWrite failed.");
    }finally{
      writer.releaseLock();
    }  
  }
  
  async read(){
    let data = new Uint8Array(0);
    const reader = this.#port.readable.getReader();
    try{
      while(this.#port.readable){
        const timer = setTimeout(() => {
          reader.cancel();
        }, 1);
        const {value, done} = await reader.read();
        clearTimeout(timer);

        if(done){
          if(data.length !== 0){
            return data;
          }else{
            throw new Error("SerialRead failed. No data is available.");
          }
        }else if(value !== undefined){
          data = mergeUint8Arrays([data, value]);
        }
      }
    }finally{
      reader.releaseLock()
    }
  }//read() end
  /*
  async read(timeout) {
    let timeoutId;
    let timeoutPromise = new Promise(
            (resolve, reject) =>
                this.timeoutId = setTimeout(
                    () => reject(new SerialTimeout("Timeout expired while waiting for data")),
                    timeout
                )
    );
    if(!this.readPromise) {
        this.readPromise = this.reader.read();
    }
    const result = await Promise.race([this.readPromise, timeoutPromise]);
    this.readPromise = null;
    clearTimeout(this.timeoutId);
    return result;
  }
*/
}
