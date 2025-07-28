const FC_READ_HOLD = 0x03;
const FC_READ_INPUT = 0x04;
const FC_WRITE_HOLD = 0x06;
const FC_WRITE_HOLD_M = 0x10;

function crc16(arr) {
  let crc = 0xffff;
  let lsb = 0;

  for (let i = 0; i < arr.length; i++) {
    crc = crc ^ arr[i];
    for (let j = 0; j < 8; j++) {
      lsb = crc & 0x0001;
      crc = crc >> 1;
      if (lsb) {
        crc = crc ^ 0xa001;
      }
    }
  }
  return crc;
}

class ModbusRTU {
  constructor(serialPort, regTable) {
    this.isLocked = false;
    this.serialPort = serialPort;
    this.regTable = regTable;
    this.pumpsNum = this.regTable.num;
    this.availablePumpsList = new Array(this.pumpsNum).fill(false);
  }
  async write(id, address, data) {
    let func;
    if(this.regTable.getRegDataSize(id, address) == 4){
      func = FC_WRITE_HOLD_M;
    }else{
      func = FC_WRITE_HOLD;
    }
    const sendFrame = this.#makeSendFrame(id, func, address, data);
    //textLog(sendFrame);
    await this.#waitToLock();
    try{
      for(let i=0; i<3; i++){
        try{
          await this.serialPort.write(sendFrame);
          await wait(40); 
          if(id != 0){
            const rcvFrame = await this.serialPort.read();
            const rcvAddress = this.#readRcvFrame(rcvFrame);
            if(rcvAddress != address){
              throw new Error("Response Address is wrong.")
            }
          }
          return;
        }catch(e){
          if(i==2){
            throw e;
          }      
        }
      }
    }catch(e){
      throw e;
    }finally{
        this.isLocked = false;
    }
  } 
  
  async read(id, address) {
    let func;
    if(address >= 40001 && address <= 49999){
      func = FC_READ_HOLD;
    }else if(address >= 30001 && address <= 39999){
      func = FC_READ_INPUT;
    }else{
      throw new Error('Invalid register address.');
    }
    const sendFrame = this.#makeSendFrame(id, func, address, 0);
    await this.#waitToLock();
    let i = 0;
    for (i = 0; i < 3; i++){
      try{
        await this.serialPort.write(sendFrame);
        await wait(40);
        const rcvFrame = await this.serialPort.read();
        const rcvData = this.#readRcvFrame(rcvFrame);
        this.regTable.setIntData(id, address, rcvData);
        this.isLocked = false;
        return;
      }catch(e){
        if(i==2){
          this.isLocked = false;
          throw e;
        }
      }
    }
  }
  
  async syncPump(id,regList){
    const listSize = regList.length;
    for (let i = 0; i < listSize; i++){
      const value = await this.read(id, regList[i]);
    }   
    this.availablePumpsList[id] = true; 
    return;
    
    /*
    const regSize = this.regTable.tableAll[0].table.length;
    let j;
    
    for (j = 0; j < regSize; j++){
      const reg = this.regTable.tableAll[i].table[j];
      const value = await this.read(i, reg.addr);
    }   
    this.availablePumpsList[i] = true; 
    return;
    */
  }
  
  async syncAllPumps(regList){
    let i;
    
    for (i = 1; i < this.pumpsNum; i++){
      await this.syncPump(i,regList).catch((e) => {this.availablePumpsList[i] = false;})
    }
  }

  #makeSendFrame(id, func, address, data) {
    const id_ub = new Uint8Array([id]);
    const func_ub = new Uint8Array([func]);

    switch (func) {
      case FC_READ_HOLD:
        const address_ub = new numToUint8Array(address - 40001, 2);
        const READ_NUM = numToUint8Array(0x01, 2);
        const rawMsg = mergeUint8Arrays([id_ub, func_ub, address_ub, READ_NUM]);
        const crc = crc16(rawMsg);
        const crc_ub = new numToUint8Array(crc, 2);
        return mergeUint8Arrays([rawMsg, crc_ub.reverse()]);
      case FC_READ_INPUT: {
        const address_ub = new numToUint8Array(address - 30001, 2);
        const READ_NUM = numToUint8Array(0x01, 2);
        const rawMsg = mergeUint8Arrays([id_ub, func_ub, address_ub, READ_NUM]);
        const crc = crc16(rawMsg);
        const crc_ub = new numToUint8Array(crc, 2);
        return mergeUint8Arrays([rawMsg, crc_ub.reverse()]);
      }

      case FC_WRITE_HOLD: {
        const address_ub = new numToUint8Array(address - 40001, 2);
        const data_ub = numToUint8Array(data, 2);
        const rawMsg = mergeUint8Arrays([id_ub, func_ub, address_ub, data_ub]);
        const crc = crc16(rawMsg);
        const crc_ub = new numToUint8Array(crc, 2);
        return mergeUint8Arrays([rawMsg, crc_ub.reverse()]);
      }
      case FC_WRITE_HOLD_M: {
        const address_ub = new numToUint8Array(address - 40001, 2);
        const data_num = new numToUint8Array(2, 2);
        const data_byte = new Uint8Array([4]);
        const data_ub = numToUint8Array(data, 4);
        const rawMsg = mergeUint8Arrays([
          id_ub,
          func_ub,
          address_ub,
          data_num,
          data_byte,
          data_ub,
        ]);
        const crc = crc16(rawMsg);
        const crc_ub = new numToUint8Array(crc, 2);
        return mergeUint8Arrays([rawMsg, crc_ub.reverse()]);
      }
    }
  }

  #readRcvFrame(array) {
    const msg = array.slice(0, array.length - 2);
    const crc = array.slice(-2).reverse();
    if (uint8ArrayToUint16(crc, false) != crc16(msg)) {
      //CRC不一致エラー
      throw new Error("CRC error.");
    }
    const id = msg[0];
    const func = msg[1] & 0x7f;
    const exp_flag = msg[1] >> 7;
    if (exp_flag) {
      const err_code = msg[2];
      this.#checkExpFlag(err_code);
      return;
    }

    switch (func) {
        //read funcだと読み値を、write funcだと書き込んだアドレスを返す。
      case FC_READ_INPUT:
      case FC_READ_HOLD:
        const byte = msg[2];
        const data = msg.slice(3);
        if(byte == 2){
          const value = uint8ArrayToUint16(data, false);
          return value;
        }else if(byte == 4){
          return uint8ArrayToUint32(data, false);
        }else{
          throw new Error("Unexpected Data Size.")
        }      
        break;
        
      case FC_WRITE_HOLD:
      case FC_WRITE_HOLD_M:
        const address = uint8ArrayToUint16(msg.slice(2,4), false);
        return address + 40001;
    }
  }
  #checkExpFlag(data) {
    switch (data) {
      case 0x01:
        throw new Error("Exp. Invalid Function.");
      case 0x02:
        throw new Error("Exp. Invalid Register Address.");
      case 0x03:
        throw new Error("Exp. Invalid Data.");
      default:
        throw new Error("Exp. Exceptional Function.");
    }
    return;
  }
  async #waitToLock(){
    let count = 0;
    while(this.isLocked){
      await wait(1);
      count++;
      if(count>=1000){
        throw new Error("ModbusCommunication is busy.");
      }
    }
    this.isLocked = true;
    return
  } 
}