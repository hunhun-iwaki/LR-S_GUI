//file://でも動く様にJSONファイルのfetchやimportはしない。
const reg_json =
  '[{"addr" :40821, "size" :2 , "resolution" :0.1 , "data" :20 , "min" :1 , "max" :1000 },{"addr" :40831, "size" :2 , "resolution" :0.001 , "data" :660 , "min" :1 , "max" :1000 },{"addr" :40011, "size" :2 , "resolution" :1.0 , "data" :1 , "min" :1 , "max" :247 },{"addr" :40051, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :13 },{"addr" :40061, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :3 },{"addr" :40071, "size" :2 , "resolution" :1.0 , "data" :3 , "min" :0 , "max" :3 },{"addr" :40081, "size" :4 , "resolution" :0.0001 , "data" :1200000 , "min" :1000 , "max" :7200000 },{"addr" :40083, "size" :4 , "resolution" :0.0001 , "data" :7200000 , "min" :1000 , "max" :7200000 },{"addr" :40091, "size" :2 , "resolution" :0.0001 , "data" :10000 , "min" :1000 , "max" :15000 },{"addr" :40111, "size" :4 , "resolution" :0.0001 , "data" :0 , "min" :0 , "max" :4000000000 },{"addr" :40121, "size" :4 , "resolution" :0.0001 , "data" :0 , "min" :0 , "max" :4000000000 },{"addr" :40131, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :1 },{"addr" :40133, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :1 },{"addr" :40136, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :1 },{"addr" :40181, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :65535 },{"addr" :40141, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :3 },{"addr" :40191, "size" :2 , "resolution" :1.0 , "data" :0, "min" :0, "max" :65535},{"addr" :40201, "size" :2 , "resolution" :1.0 , "data" :1 , "min" :0 , "max" :1 },{"addr" :40221, "size" :2 , "resolution" :0.01 , "data" :100 , "min" :0 , "max" :10000 },{"addr" :40231, "size" :2 , "resolution" :1.0 , "data" :60 , "min" :0 , "max" :6000 },{"addr" :40241, "size" :2 , "resolution" :0.0001 , "data" :30 , "min" :0 , "max" :3000 },{"addr" :40251, "size" :2 , "resolution" :100.0 , "data" :300 , "min" :0 , "max" :100000 },{"addr" :40401, "size" :2 , "resolution" :1.0 , "data" :1 , "min" :0 , "max" :10 },{"addr" :40101, "size" :2 , "resolution" :1.0 , "data" :1 , "min" :1 , "max" :255 },{"addr" :40102, "size" :2 , "resolution" :1.0 , "data" :1 , "min" :0 , "max" :255 },{"addr" :40103, "size" :2 , "resolution" :1.0 , "data" :1 , "min" :1 , "max" :255 },{"addr" :40601, "size" :2 , "resolution" :1.0 , "data" :170, "min" :0 , "max" :255 },{"addr" :40701, "size" :4 , "resolution" :0.0001 , "data" :0 , "min" :0 , "max" :7200000 },{"addr" :40703, "size" :4 , "resolution" :0.0001 , "data" :7200000 , "min" :0 , "max" :7200000 },{"addr" :40801, "size" :2 , "resolution" :1 , "data" :3 , "min" :0 , "max" :3 },{"addr" :40104, "size" :2 , "resolution" :1 , "data" :0 , "min" :0 , "max" :1 }, {"addr" :40711, "size" :4 , "resolution" :0.00001, "data" :1000000 , "min" :10000 , "max" :5000000},{"addr" :40713, "size" :4 , "resolution" :0.00001, "data" :0 , "min" :0 , "max" :5000000}, {"addr" :40715, "size" :2 , "resolution" :0.00001, "data" :6944 , "min" :6528 , "max" :9027},    {"addr" :40717, "size" :2 , "resolution" :0.0001, "data" :30000 , "min" :0 , "max" :60000},    {"addr" :40719, "size" :2 , "resolution" :1.0, "data" :0 , "min" :0 , "max" :1}, {"addr" :30011, "size" :2 , "resolution" :1.0 , "data" :4 , "min" :0 , "max" :65535 },{"addr" :30021, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :65535 },{"addr" :30022, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :65535 },{"addr" :30031, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :255 },{"addr" :30032, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :255 },{"addr" :30033, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :255 },{"addr" :30034, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :255 },{"addr" :30035, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :255 },{"addr" :30036, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :255 },{"addr" :30037, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :255 },{"addr" :30038, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :255 },{"addr" :30039, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :255 },{"addr" :30040, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :255 },{"addr" :30071, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :1023 },{"addr" :30081, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :1023 },{"addr" :30091, "size" :2 , "resolution" :0.0001 , "data" :0 , "min" :0 , "max" :65535 },{"addr" :30096, "size" :2 , "resolution" :0.0001 , "data" :0 , "min" :0 , "max" :65535 },{"addr" :30095, "size" :2 , "resolution" :0.0001 , "data" :0 , "min" :0 , "max" :65535 },{"addr" :30101, "size" :4 , "resolution" :0.0001 , "data" :0 , "min" :0 , "max" :7200000 },{"addr" :30111, "size" :2 , "resolution" :0.0001 , "data" :14000 , "min" :0 , "max" :30000 },{"addr" :30121, "size" :2 , "resolution" :1.0 , "data" :0 , "min" :0 , "max" :255 },{"addr" :30301, "size" :2 , "resolution" :0.0001 , "data" :5000 , "min" :0 , "max" :10000 },{"addr" :30311, "size" :2 , "resolution" :0.0001 , "data" :5000 , "min" :0 , "max" :10000 },{"addr" :30131, "size" :2 , "resolution" :0.0001 , "data" :0 , "min" :0 , "max" :30000 },{"addr" :30133, "size" :2 , "resolution" :0.0001 , "data" :0 , "min" :0 , "max" :65535 },{"addr" :30135, "size" :2 , "resolution" :0.00001 , "data" :0 , "min" :0 , "max" :65535 },{"addr" :30137, "size" :2 , "resolution" :0.0001 , "data" :0 , "min" :0 , "max" :65535 },{"addr" :30139, "size" :2 , "resolution" :0.0001 , "data" :0 , "min" :0 , "max" :65535 },{"addr" :30141, "size" :2 , "resolution" :0.00001 , "data" :0 , "min" :0 , "max" :65535 },{"addr" :30143, "size" :2 , "resolution" :0.0001 , "data" :0 , "min" :0 , "max" :65535 },{"addr" :30151, "size" :4 , "resolution" :0.0001 , "data" :0 , "min" :0 , "max" :65535 },{"addr" :40261, "size" :2 , "resolution" :0.01 , "data" :100 , "min" :0 , "max" :10000 },{"addr" :40271, "size" :2 , "resolution" :1.0 , "data" :60 , "min" :0 , "max" :6000 },{"addr" :40281, "size" :2 , "resolution" :0.0001 , "data" :30 , "min" :0 , "max" :3000 }]';

const baseRegTbl = JSON.parse(reg_json);

class RegTable {
  constructor(regTbl) {
    this.table = structuredClone(regTbl); //現状Web Serial APIを使う前提上、ChromeかEdgeのみ対応なので、structureCloneを使用
  }
  getData(addr) {
    const reg = this.table.find((element) => element.addr == addr);
    if (reg == undefined) {
      throw new Error("存在しないレジスタアドレスです。");
    } else {
      return reg.data * reg.resolution;
    }
  }
  getIntData(addr) {
    const reg = this.table.find((element) => element.addr == addr);
    if (reg == undefined) {
      throw new Error("存在しないレジスタアドレスです。");
    } else {
      return reg.data;
    }
  }
  setIntData(addr, data) {
    const reg = this.table.find((element) => element.addr == addr);
    if (reg == undefined) {
      throw new Error("存在しないレジスタアドレスです。");
    } else if (data >= reg.min && data <= reg.max) {
      reg.data = data;
    } else {
      throw new Error("レジスタの範囲外のデータです。");
    }
  }
  setData(addr, data) {
    const reg = this.table.find((element) => element.addr == addr);
    if (reg == undefined) {
      throw new Error("存在しないレジスタアドレスです。");
    } else {
      const intData = Math.round(data / reg.resolution);
      if (intData >= reg.min && intData <= reg.max) {
        reg.data = intData;
      } else {
        throw new Error("レジスタの範囲外のデータです。");
      }
    }
  }
  getRegDataSize(addr){
    const reg = this.table.find((element) => element.addr == addr);
    if (reg == undefined) {
      throw new Error("存在しないレジスタアドレスです。");
    } else {
      return reg.size;
    }
  }
}

class AllRegTables {
  constructor(num, baseRegTbl) {
    this.num = num;
    this.tableAll = [...Array(num)].map(() => new RegTable(baseRegTbl));
  }
  getData(id, addr) {
    if (id >= 0 && id <= this.num) {
      return this.tableAll[id].getData(addr);
    } else {
      throw new Error("範囲外のIDです。");
    }
  }
  setData(id, addr, data) {
    if (id >= 0 && id <= this.num) {
      this.tableAll[id].setData(addr, data);
    } else {
      throw new Error("範囲外のIDです。");
    }
  }
  getIntData(id, addr) {
    if (id >= 0 && id <= this.num) {
      return this.tableAll[id].getIntData(addr);
    } else {
      throw new Error("範囲外のIDです。");
    }
  }
  setIntData(id, addr, data) {
    if (id >= 0 && id <= this.num) {
      this.tableAll[id].setIntData(addr, data);
    } else {
      throw new Error("範囲外のIDです。");
    }
  }
  getRegDataSize(id, addr){
    if (id >= 0 && id <= this.num) {
      return this.tableAll[id].getRegDataSize(addr);
    } else {
      throw new Error("範囲外のIDです。");
    }
  }
}
