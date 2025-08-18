const ModeNum = {
  MANUAL:0,
  ANALOG:1,
  PULSE:2,
  BATCH:3,
  MAX:4,
  CALIB:5,
  TOP:6,
  BOTTOM:7,
  AIR:8,
  TEST:9,
  TUNING:10,
  SYNC:11,  
  PS_EST_TUNING:13
};
const TypeChar = ["SINE", "PULSE", "CONT", "VISC", "S_CONT"];
const SyncRegList = [40051, 40061, 40081, 40091, 40101, 40102, 40103, 40104];//MODE, TYPE, SPM, SL. SYNC_ID, SYNC_GROUP, SYNC_TOTAL, SYNC_ENABLE

/*レジスタテーブル初期化*/
const pumpsNum = 16;
const regTable = new AllRegTables(pumpsNum, baseRegTbl);
/*シリアルポート*/
const port = new SerialPort();
/*Modbus*/
const modbus = new ModbusRTU_slave(port, regTable);

//シリアル接続
const serialConnectionManager = {
  btnSerial: document.getElementById("serialConnect"),
  loadingAnime: document.getElementById("loadingAnime"),
  init: function(){
    const self = this;
    self.btnSerial.addEventListener("click", async function () {
      try {
        await port.serialInit(115200);
      } catch (e) {
        alert(e);
        return;
      }
      self.loadingAnime.className = "animoSpinner";
      self.loadingAnime.className = "animoSpinner animoSpinner--none";
    });
  }
}

//ポーリング
while(1){
  data = await port.read();
  if (data.length === 0) {
    modbus.
  }
}

