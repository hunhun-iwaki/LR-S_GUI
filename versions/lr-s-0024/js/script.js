/*ポンプ状態監視用インターバル*/
const intervalUpdateStatus = new TimeoutLoop(async () => {
  await updateStatus(idHandler.slaveID); 
  await psEstHandler.update();
}, 1000);
/*データロギング用インターバル*/
const intervalLoggingData = new TimeoutLoop(async () => {await loggingData(idHandler.slaveID);}, 1000);
/*メインビュー更新用インターバル*/
const intervalUpdateMainView = new TimeoutLoop(async () => {await MainView.update();}, 500);

const SyncRegList = [40051, 40061, 40081, 40091, 40101, 40102, 40103, 40104];//MODE, TYPE, SPM, SL. SYNC_ID, SYNC_GROUP, SYNC_TOTAL, SYNC_ENABLE

/*レジスタテーブル初期化*/
const pumpsNum = 16;
const regTable = new AllRegTables(pumpsNum, baseRegTbl);
/*シリアルポート*/
const port = new SerialPort();
/*Modbus*/
const modbus = new ModbusRTU(port, regTable);
/*現在の操作ポンプ*/
const activePump = {
  read: async function(address){
    await modbus.read(idHandler.slaveID, address);
    return regTable.getData(idHandler.slaveID, address);
  },
  
  write: async function(address, data){
    regTable.setData(idHandler.slaveID, address, data);
    await modbus.write(idHandler.slaveID, address, regTable.getIntData(idHandler.slaveID, address)); 
  },
  
  writeSyncPumps: async function(address, data){
    const group = syncParamTable.table[idHandler.slaveID].group;
    for(let i = 1;i<=15;i++){
      if(syncParamTable.table[i].group == group){
        regTable.setData(i, address, data);
        await modbus.write(i, address, regTable.getIntData(i, address));  
      }          
    }            
  },
  
  readSyncPumps: async function(address){
    const group = syncParamTable.table[idHandler.slaveID].group;
    let array = [];
    for(let i = 1;i<=15;i++){
      if(syncParamTable.table[i].group == group){
        await modbus.read(i, address);
        array.push({"ID":i, "Data":regTable.getData(i, address)});
      }          
    }    
    return array;
  }
}

/* mode毎の設定項目ハンドラ*/
const analogSpmScaling = {
  diagANA_SPM: document.getElementById("diagANA_SPM"),
  analogSpmSettings: document.getElementById("analogSpmSettings"),
  formANA_SPM: document.getElementById("formANA_SPM"),
  inANA_SPM_MIN: document.getElementById("inANA_SPM_MIN"),
  inANA_SPM_MAX: document.getElementById("inANA_SPM_MAX"),
  okANA_SPM: document.getElementById("okANA_SPM"),
  cancelANA_SPM: document.getElementById("cancelANA_SPM"),
  init: function(){
    const self = this;
    self.analogSpmSettings.addEventListener(
      "click",
      async function () {
        self.diagANA_SPM.showModal();
        try{
          await activePump.read(40701)
          await activePump.read(40703)
        }catch(error){
          self.inANA_SPM_MIN.value = "";
          self.inANA_SPM_MAX.value = "";
          textLog(error);
          return;
        }
        self.inANA_SPM_MIN.value = parseFloat(regTable.getData(idHandler.slaveID, 40701).toFixed(7));
        self.inANA_SPM_MAX.value = parseFloat(regTable.getData(idHandler.slaveID, 40703).toFixed(7));
      },
      false
    );
    self.formANA_SPM.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault(); //ページ遷移回避
        let inputMin = self.inANA_SPM_MIN.value;
        let inputMax = self.inANA_SPM_MAX.value;
        if (inputMin == "" && inputMax == "") {
          self.diagANA_SPM.close();
          return;
        } else if (!(0 <= inputMin && inputMin <= 720 && 0 <= inputMax && inputMax<=720)) {
          alert("入力が正しくありません。半角数字(0-720)で入力してください。");
          return;
        }
        try{
          await activePump.write(40701, inputMin);
          await activePump.write(40703, inputMax);
        }catch(error){
          textLog(error);
        }   
        self.diagANA_SPM.close();
      },
      false
    );
    self.cancelANA_SPM.addEventListener(
      "click",
      function () {
        self.diagANA_SPM.close();
      },
      false
    );
  }
}
analogSpmScaling.init();

const pulseSpmScaling = {
  diagPLS_SPM: document.getElementById("diagPLS_SPM"),
  pulseSpmSettings: document.getElementById("pulseSpmSettings"),
  formPLS_SPM: document.getElementById("formPLS_SPM"),
  inPLS_SPM_MIN: document.getElementById("inPLS_SPM_MIN"),
  inPLS_SPM_MAX: document.getElementById("inPLS_SPM_MAX"),
  okPLS_SPM: document.getElementById("okPLS_SPM"),
  cancelPLS_SPM: document.getElementById("cancelPLS_SPM"),
  init: function(){
    const self = this;
    self.pulseSpmSettings.addEventListener(
      "click",
      async function () {
        self.diagPLS_SPM.showModal();
        try{
          await activePump.read(40701)
          await activePump.read(40703)
        }catch(error){
          self.inPLS_SPM_MIN.value = "";
          self.inPLS_SPM_MAX.value = "";
          textLog(error);
          return;
        }
          self.inPLS_SPM_MIN.value = parseFloat(regTable.getData(idHandler.slaveID, 40701).toFixed(7));
          self.inPLS_SPM_MAX.value = parseFloat(regTable.getData(idHandler.slaveID, 40703).toFixed(7));
      },
      false
    );
    self.formPLS_SPM.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault(); //ページ遷移回避
        let inputMin = self.inPLS_SPM_MIN.value;
        let inputMax = self.inPLS_SPM_MAX.value;
        if (inputMin == "" && inputMax == "") {
          self.diagPLS_SPM.close();
          return;
        } else if (!(0 <= inputMin && inputMin <= 720 && 0 <= inputMax && inputMax<=720)) {
          alert("入力が正しくありません。半角数字(0-720)で入力してください。");
          return;
        }
        try{
          await activePump.write(40701, inputMin);
          await activePump.write(40703, inputMax)
        }catch(error){
          textLog(error);
        }
        self.diagPLS_SPM.close();
      },
      false
    );
    self.cancelPLS_SPM.addEventListener(
      "click",
      function () {
        self.diagPLS_SPM.close();
      },
      false
    );
  }
}
pulseSpmScaling.init();

const batchControl = {
  setBatch: document.getElementById("setBatch"),
  addBatch: document.getElementById("addBatch"),
  totalBatch: document.getElementById("totalBatch"),
  init: function(){
    const self = this;
    self.addBatch.addEventListener(
      "click",
      async function (e) {
        e.preventDefault();
        const inputValue = self.setBatch.value;
        if(regTable.getData(idHandler.slaveID, 40104)===1){
          const syncTotal = regTable.getData(idHandler.slaveID, 40103);
          const q = Math.floor(inputValue / syncTotal);
          const remInt = Math.floor(inputValue % syncTotal);
          const remDec = (inputValue % syncTotal) - remInt;
          let setShot = new Array(syncTotal).fill(q);
          for(let i = 0; i<= remInt; i++){
            if(i == remInt){
              setShot[i] += remDec;
            }else{
              setShot[i] += 1;
            } 
          }     
          const leftShot = await activePump.readSyncPumps(40111);
          const sortedLeftShot = leftShot.sort((a, b) => a.Data - b.Data);
          const sortedId = sortedLeftShot.map(obj => obj.ID);
          try{
            for(let i = 0; i < syncTotal; i++){
              regTable.setData(sortedId[i],40121,setShot[i]);
              await modbus.write(sortedId[i],40121,regTable.getIntData(sortedId[i],40121));
            }
          }catch(error){
            textLog(error);
            return;
          }
        }
        else{
          try{
            await activePump.write(40121, inputValue)
          }catch(error){
            textLog(error);
            return;
          }
        }
      },
      false
    );
  },
  updateBatchLeft: async function(){
    const self = this;
    if(regTable.getData(idHandler.slaveID, 40104)===1){
      const leftShot = await activePump.readSyncPumps(40111);
      const leftShotTotal = leftShot.reduce((sum,object) => sum + object.Data,0);
      self.totalBatch.value = Math.round(leftShotTotal*100)/100;
    }
    else{
      try{
        await activePump.read(40111);
        self.totalBatch.value = Math.round(regTable.getData(idHandler.slaveID, 40111)*100)/100;
      }catch(error){
        textLog(error);
        return;
      }
    }    
  }
}
batchControl.init();

const tbControl = {
  topBtn: document.getElementById("topBtn"),
  bottomBtn: document.getElementById("bottomBtn"),
  init: function(){
    const self = this;
    self.topBtn.addEventListener(
      "click",
      async function (e) {
        try{
          await activePump.write(40051, 6);
          await activePump.write(40131, 1);
          await activePump.write(40133, 1);
          await wait(3000);
        }catch(error){
          textLog(error);
          return;
        }finally{
          try{
            await activePump.write(40131, 0);
            await activePump.write(40133, 0);
          }catch(e){
            textLog(e);
          }
        }
      },
      false
    );

    self.bottomBtn.addEventListener(
      "click",
      async function (e) {
        try{
          await activePump.write(40051, 7);
          await activePump.write(40131, 1);
          await activePump.write(40133, 1);
          await wait(3000);
        }catch(error){
          textLog("error");
          return;
        }finally{
          try{
            await activePump.write(40131, 0);
            await activePump.write(40133, 0);
          }catch(e){
            textLog(e);
          }
        }
      },
      false
    );   
  },
}
tbControl.init();

const tuningControl = {
  tuningText: document.getElementById("tuningText"),
  isProcessing:false,
  statusUpdate: async function(){
    await activePump.read(30121).catch((e)=>textLog(e));
    if(regTable.getData(idHandler.slaveID, 30121) != 0){
      this.tuningText.className = "mode-setting__tuning-container";
      this.isProcessing = true;
    }else{
      this.tuningText.className = "mode-setting__tuning-container--none mode-setting__tuning-container" ;
      if(this.isProcessing){
        await activePump.write(40133, 0).catch((e)=>textLog(e));
        this.isProcessing = false;
      }
    }
  }
}

const estCalControl = {
  estCalText: document.getElementById("estCalText"),
  isProcessing:false,
  statusUpdate: async function(){
    await activePump.read(30121).catch((e)=>textLog(e));
    if(regTable.getData(idHandler.slaveID, 30121) != 0){
      this.estCalText.className = "mode-setting__tuning-container";
      this.isProcessing = true;
    }else{
      this.estCalText.className = "mode-setting__tuning-container--none mode-setting__tuning-container" ;
      if(this.isProcessing){
        await activePump.write(40133, 0).catch((e)=>textLog(e));
        this.isProcessing = false;
      }
    }
  }
}

const syncParamTable = {
  table: Array.from({ length: 16 }, (_, index) => ({ sid: 0, group: 0, total: 0 })),
  copyRegTable: function(){
    for(let id=1;id<16;id++){
      if(modbus.availablePumpsList[id] === true){
        this.table[id].sid = regTable.getData(id,40101);
        this.table[id].group = regTable.getData(id,40102);
        this.table[id].total = regTable.getData(id,40103);
      }
    }
  },
  checkParams: function(){
    for(let group=1;group<=6;group++){
      const tbl = this.table.filter(item => item.group === group);
      if(tbl.length !==0){
        try{
          for(let i=1;i<=tbl.length;i++){
            const foundElements = tbl.filter(element => element.sid === i);
            if(foundElements.length !== 1){
              if(i === 1){
                throw new Error(`Group${group}:'Main'が1つだけ設定されている必要があります。`);
              }else{
                throw new Error(`Group${group}:SYNC_IDが連番で設定されていません。OKを押すとSubに設定されたポンプに自動で再設定します。`);
              }
            }
          }
          const currectSyncTotalElements = tbl.filter(item => item.total === tbl.length);
          if(currectSyncTotalElements.length !== tbl.length){
            throw new Error(`Group${group}:SYNC_TOTALが正しくないポンプがあります。OKを押すと自動で再設定します。`)
          }
        }catch(e){
          return {success:false, message:e.message};
        }
      }
    }
    return {success:true};
  },
  assignSequentialSyncIdToSub: function(){
    for(let group=1;group<=6;group++){
      let sid = 2;
      for(let i=1;i<=15;i++){
        if(this.table[i].group===group && this.table[i].sid > 1){
          this.table[i].sid = sid;
          sid++;
        }
      }
    }
  },
  assigncorrectSyncTotal: function(){
    for(let group=1;group<=6;group++){
      const total = this.table.filter(item=>item.group===group).length;
      for(let i=1;i<=15;i++){
        if(this.table[i].group===group){
          this.table[i].total = total;
        }
      }
    }
  },
  setParamsBasedOnRole: function(id, role, group){
    if(modbus.availablePumpsList[id]===true){
      switch(role){
        case "main":
          this.table[id].sid = 1;
          this.table[id].group = group;
          break;
        case "sub":
          this.table[id].sid = 2;
          this.table[id].group = group;
          break;
        case "none":
          this.table[id].sid = 1;
          this.table[id].group = 0;
          this.table[id].total = 1;
          break;
        default:
      }
      this.assigncorrectSyncTotal();
      this.assignSequentialSyncIdToSub();
    }
  },
  getParams: function(id){
    return this.table[id];
  },
  writeParamsToPumps: async function(){
    for(let i=1;i<=15;i++){
      if(modbus.availablePumpsList[i]){
        regTable.setData(i, 40101, this.table[i].sid);
        regTable.setData(i, 40102, this.table[i].group);
        regTable.setData(i, 40103, this.table[i].total);
        try{
          await modbus.write(i, 40101, regTable.getIntData(i, 40101));
          await modbus.write(i, 40102, regTable.getIntData(i, 40102));
          await modbus.write(i, 40103, regTable.getIntData(i, 40103));
        }catch(e){
          textLog(e);
        }

      }
    }
  }
}
const syncControl = {
  syncCheck: document.getElementById("syncCheck"),
  syncSetting: document.getElementById("syncSetting"),
  currentGroup: 1,
  diagSYNC: document.getElementById("diagSYNC"),
  syncSettingBtn: document.getElementById("syncSettingBtn"),
  syncPumpsList: document.getElementById("syncPumpsList"),
  syncAnimoSpinner: document.getElementById("syncAnimoSpinner"),
  okSYNC: document.getElementById("okSYNC"),
  cancelSYNC: document.getElementById("cancelSYNC"),
  syncSelectId: document.getElementsByName("syncSelectId"),
  syncGroupRadio: document.getElementsByName("syncGroupRadio"),
  syncPumpAlert: document.getElementById("syncPumpAlert"),
  modeSettingSyncAlert: document.getElementById("modeSettingSyncAlert"),
  currentGroupDisplay: document.getElementById("currentGroupDisplay"),
  currentTotalPumpsDisplay: document.getElementById("currentTotalPumpsDisplay"),
  init: function(){
    const self = this;
    
    self.syncCheck.addEventListener(
      "change", 
      async function () {
        try{
          if(self.syncCheck.checked){
            activePump.write(40104, 1);
          }else{
            activePump.write(40104, 0);
          }
        }catch(e){
          textLog(e);
        }
        MainView.forcedUpdate();

    });
    
    
    self.syncSettingBtn.addEventListener(
      "click",
      async function () {
        self.syncAnimoSpinner.className = "animoSpinner";
        self.syncPumpsList.className="sync-pumps-container--hidden sync-pumps-container";
        self.syncPumpAlert.textContent = "";
        self.diagSYNC.showModal();
        for(let i = 1;i < 16; i++){
          await self.readSyncParam(i);
        }
        syncParamTable.copyRegTable();
        const currentGroup = syncParamTable.table[idHandler.slaveID].group;
        self.updateSyncListView();
        self.updateAlertMessage();
        self.syncAnimoSpinner.className = "animoSpinner animoSpinner--none";
        self.syncPumpsList.className="sync-pumps-container";
      },
      false
    );

    self.cancelSYNC.addEventListener(
      "click",
      function () {
        syncParamTable.copyRegTable();
        self.diagSYNC.close();
      },
      false
    );
    
    self.okSYNC.addEventListener(
    "click",
      async function (){
        self.syncAnimoSpinner.className = "animoSpinner";
        self.syncPumpsList.className="sync-pumps-container--hidden sync-pumps-container";
        syncParamTable.assigncorrectSyncTotal();
        syncParamTable.assignSequentialSyncIdToSub();
        try{
          await syncParamTable.writeParamsToPumps();
        }catch(e){
          textLog(e);
        }
        MainView.forcedUpdate();
        self.diagSYNC.close();      
    }
    );
    
    for(const item of self.syncGroupRadio){
      item.addEventListener(
      "change",
        function(){
          for(let i=0;i<self.syncGroupRadio.length;i++){
            if(self.syncGroupRadio[i].checked==true){
              self.currentGroup = Number(self.syncGroupRadio[i].value);
              self.updateSyncListView();
            }
          }
        },
        false
      );
    }
  },
  
  updateModeSettingView: function(){
    const currentGroup = syncParamTable.table[idHandler.slaveID].group;
    const currentGroupTotal = syncParamTable.table.filter(item=>item.group === currentGroup).length;
    if(currentGroup!==0){
      this.currentGroupDisplay.textContent = `Group ${currentGroup}`
      this.currentTotalPumpsDisplay.textContent = `Total ${currentGroupTotal} Pumps`
    }else{
      this.currentGroupDisplay.textContent = `Group -`
      this.currentTotalPumpsDisplay.textContent = `Total - Pumps`      
    }
    const result = syncParamTable.checkParams();
    if(syncParamTable.table[idHandler.slaveID].group === 0){
        this.modeSettingSyncAlert.textContent = `※This ID is not assigned to any group※`;
        return {success:false};
    }else if(result.success){
      if(syncParamTable.table[idHandler.slaveID].sid === 1){
        this.modeSettingSyncAlert.textContent = "";
        return {success:true};
      }else{
        let i;
        for(i=1;1<=15;i++){
          if(syncParamTable.table[i].group === currentGroup && syncParamTable.table[i].sid ===1){
            this.modeSettingSyncAlert.textContent = `※ID:${i} is "Main"※`;
            return {success:false};
          }
        }
        this.modeSettingSyncAlert.textContent = `※No Pump is assigned to "Main"※`;
        return {success:false};
      }
    }else{
      this.modeSettingSyncAlert.textContent = `※Check Sync Pumps Settings※`;
      return {success:false};
    }
    
  },
    
  readSyncParam:async function(slaveID){
    try{
      await modbus.read(slaveID,40101);
      await modbus.read(slaveID,40102);
      await modbus.read(slaveID,40103);
      modbus.availablePumpsList[slaveID] = true;
    }catch(e){
      modbus.availablePumpsList[slaveID] = false;
    }
  },
  updateSyncListView: function(){
    const group = this.currentGroup;
    for(let i=1;i < 16;i++){
      const pgroup = syncParamTable.table[i].group;
      const box = this.syncSelectId[i-1].children[0];
      if(modbus.availablePumpsList[i] === false){
        box.className = "sync-select__box sync-select__box--disconnect";
      }else if(pgroup == 0){
        box.className = "sync-select__box sync-select__box--none";
      }else if(pgroup != group){
        box.className = "sync-select__box sync-select__box--otherG";
      }else if(syncParamTable.table[i].sid === 1){
        box.className = "sync-select__box sync-select__box--main";
      }else{
        box.className = "sync-select__box sync-select__box--sub";
      }
    }    
  },
  updateAlertMessage: function(){
    const result = syncParamTable.checkParams();
    if(result.success === true){
      self.syncPumpAlert.textContent = "";
    }else{
      self.syncPumpAlert.textContent = result.message;
    }
  }
}
syncControl.init();
const syncModalHandler = {
  syncSelectModal: document.getElementById("syncSelectModal"),
  syncSelectPopUp: document.getElementById("syncSelectPopUp"), 
  selectSyncRole: document.getElementsByName("selectSyncRole"),
  currentId: 0,
  openSyncModal: function($this, id) {
    const self = this;
    self.currentId = id;
    for (let i = 0; i < 3; i++){
      self.selectSyncRole.item(i).checked = false;
    }
    const top = $this.offsetTop; 
    const left = $this.offsetLeft; 
    self.syncSelectModal.style.display = 'inline-block';
    self.syncSelectPopUp.style.left = (left+40)+'px';
    self.syncSelectPopUp.style.top = top+'px';
  },

  closeSyncModal: function(){
    const self = this;
    for (let i = 0; i < 3; i++){
      if (self.selectSyncRole.item(i).checked){
        syncParamTable.setParamsBasedOnRole(this.currentId, self.selectSyncRole.item(i).value, syncControl.currentGroup);
        syncControl.updateSyncListView();
        syncControl.updateAlertMessage();
      }
    }
    this.syncSelectModal.style.display = 'none'
  }
}

/* ID表示操作*/
const idHandler = {
  inID: document.getElementById("inID"),
  slaveID: this.inID.value,
  init: function(){
    const self = this; 
    this.slaveID = this.inID.value;
    self.inID.addEventListener(
      "change",
      function () {
        self.slaveID = self.inID.value;
        MainView.forcedUpdate();
      },
      false
    );
  },
  setValue: function(value){
    this.slaveID = value;
    this.inID.value = value;
  }
}
idHandler.init();
/* MODE表示操作*/
const modeHandler = {
  dispMODE: document.getElementById("dispMODE"),
  diagMODE: document.getElementById("diagMODE"),
  formMODE: document.getElementById("formMODE"),
  inMODE: document.getElementById("inMODE"),
  okMODE: document.getElementById("okMODE"),
  cancelMODE: document.getElementById("cancelMODE"),
  optionsMODE: document.getElementsByName("inMODE"),
  modeSettingOptions: document.getElementsByName("modeSettingOptions"),
  init: function(){
    const self = this;
    self.dispMODE.addEventListener(
      "click",
      function () {
        self.formMODE.inMODE.value = regTable.getData(idHandler.slaveID, 40051);
        self.diagMODE.showModal();
      },
      false
    );
    self.formMODE.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault(); //ページ遷移回避
        const value = self.formMODE.inMODE.value;
        try{
          await activePump.write(40051, value);
        }catch(e){
          textLog(e);
        }
        self.updateModeView(value);
        MainView.forcedUpdate();
        self.diagMODE.close();
      },
      false
    );
    self.cancelMODE.addEventListener(
      "click",
      function () {
        self.diagMODE.close();
      },
      false
    );
  },
  modeOptions: document.getElementsByName("modeOptions"),
  updateModeView: function (mode) {
    let rmode = mode;
    if (mode == 7){
      rmode = 6;
    } 
    for (let i = 0; i < this.modeOptions.length; i++) {
      if (this.optionsMODE[i].value == rmode) {
        this.modeOptions[i].className = "mode-container__option";
        this.updateModeSettingView(i);
      } else {
        this.modeOptions[i].className =
          "mode-container__option mode-container__option--none";
      }
    }
  },
  updateModeSettingView: function(num){
    for(let i =0; i < this.modeSettingOptions.length; i++){
      this.modeSettingOptions[i].className = "mode-setting mode-setting--none";
    }                         
    this.modeSettingOptions[num].className = "mode-setting";
  },
  setValue: function(mode){
    this.dispMODE = mode;
    this.inMODE = mode;
    this.updateModeView(mode);        
  }
}
modeHandler.init();
//SPM表示操作
const spmHandler = {
  dispSPM : document.getElementById("dispSPM"),
  diagSPM : document.getElementById("diagSPM"),
  formSPM : document.getElementById("formSPM"),
  inSPM : document.getElementById("inSPM"),
  okSPM : document.getElementById("okSPM"),
  cancelSPM : document.getElementById("cancelSPM"),
  
  init: function(){
    const self = this;
    self.dispSPM.addEventListener(
      "click",
      function () {
        self.inSPM.value = parseFloat(regTable.getData(idHandler.slaveID, 40081).toFixed(7));
        self.diagSPM.showModal();
      },
      false
    );
    self.formSPM.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault(); //ページ遷移回避
        let inputNum = self.inSPM.value;
        if (inputNum == "") {
          self.diagSPM.close();
          return;
        } else if (inputNum < 0.1) {
          inputNum = 0.1;
        } else if (inputNum > 720) {
          inputNum = 720;
        } else if (inputNum >= 0.1 && inputNum <= 720) {
          inputNum = Math.round(inputNum * 10000) / 10000;
        } else {
          alert("入力が正しくありません。半角数字で入力してください。");
          return;
        }
        self.setValue(inputNum); 
        if(regTable.getData(idHandler.slaveID, 40104)===1){
          try{
            await activePump.writeSyncPumps(40081, inputNum);
          }catch(e){
            textLog(e);
          }
        }else{
          try{
            await activePump.write(40081, inputNum);
          }catch(e){
            textLog(e);
          }   
        }
        self.diagSPM.close();
      },
      false
    );
    self.cancelSPM.addEventListener(
      "click",
      function () {
        self.diagSPM.close();
      },
      false
    );
  },
  inputEnable: function(){
    self.dispSPM.className = "spm-container__input"
  },
  inputDisable: function(){
    self.dispSPM.className = "spm-container__input spm-container__input--disabled"
  },
  setValue: function(value){
    self.dispSPM.value = value;
  }
}
spmHandler.init();
//SL表示操作
const slHandler = {
  diagSL : document.getElementById("diagSL"),
  dispSL : document.getElementById("dispSL"),
  cancelSL : document.getElementById("cancelSL"),
  okSL : document.getElementById("okSL"),
  inSL : document.getElementById("inSL"),
  formSL : document.getElementById("formSL"),
  
  init : function(){
    const self = this;
    self.dispSL.addEventListener(
      "click",
      function () {
        self.inSL.value = parseFloat(regTable.getData(idHandler.slaveID, 40091).toFixed(5));
        self.diagSL.showModal();
      },
      false
    );
    self.formSL.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault(); //ページ遷移回避
        let inputNum = self.inSL.value;
        if (inputNum == "") {
          self.diagSL.close();
          return;
        } else if (inputNum < 0.1) {
          inputNum = 0.1;
        } else if (inputNum > 1.2) {
          inputNum = 1.2;          
        } else if (inputNum >= 0.1 && inputNum <= 1.2) {
          inputNum = Math.round(inputNum * 10000) / 10000;
        } else {
          alert("入力が正しくありません。半角数字で入力してください。");
        }
        self.setValue(inputNum);
        try{
          if(regTable.getData(idHandler.slaveID, 40104)===1){
            await activePump.writeSyncPumps(40091, inputNum);
          }else{        
            await activePump.write(40091, inputNum);
          }
        }catch(e){
          textLog(e);
        }       
        self.diagSL.close();
      },
      false
    );
    self.cancelSL.addEventListener(
      "click",
      function () {
        self.diagSL.close();
      },
      false
    );
  },
  inputEnable: function(){
    self.dispSL.className = "sl-container__input"
  },
  inputDisable: function(){
    self.dispSL.className = "sl-container__input sl-container__input--disabled"
  },
  setValue: function(value){
    self.dispSL.value = value;
  }
}
slHandler.init();
//TYPE表示操作
const typeHandler = {
  dispTYPE: document.getElementById("dispTYPE"),
  diagTYPE: document.getElementById("diagTYPE"),
  formTYPE: document.getElementById("formTYPE"),
  inTYPE: document.getElementById("inTYPE"),
  okTYPE: document.getElementById("okTYPE"),
  cancelTYPE: document.getElementById("cancelTYPE"),
  
  init: function(){
    const self = this;
    self.dispTYPE.addEventListener(
      "click",
      function () {
        self.formTYPE.inTYPE.value = regTable.getData(idHandler.slaveID, 40061);
        self.diagTYPE.showModal();
      },
      false
    );
    self.formTYPE.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault(); //ページ遷移回避
        const value = self.formTYPE.inTYPE.value;
        try{
          if(regTable.getData(idHandler.slaveID, 40104)===1){
            await activePump.writeSyncPumps(40061, value);
          }else{        
            await activePump.write(40061, value);
          }
        }catch(e){
          textLog(e);
        }  
        self.setValue(value);
        self.diagTYPE.close();
      },
      false
    );
    self.cancelTYPE.addEventListener(
      "click",
      function () {
        self.diagTYPE.close();
      },
      false
    );
  },
  setValue: function (value) {
    const typeOptions = document.getElementsByName("typeOptions");
    for (let i = 0; i < typeOptions.length; i++) {
      if (i == value) {
        typeOptions[i].className = "type-container__option";
      } else {
        typeOptions[i].className =
          "type-container__option type-container__option--none";
      }
    }
    const typeOptions_gray = document.getElementsByName("typeOptions");
    for (let i = 0; i < typeOptions.length; i++) {
      if (i == value) {
        typeOptions[i].className = "type-container__option";
      } else {
        typeOptions[i].className =
          "type-container__option type-container__option--none";
      }
    }
  },
  inputEnable: function(){
    self.dispTYPE.className = "type-container";
  },
  inputDisable: function(){
    self.dispTYPE.className = "type-container type-container--disabled";
  }
}
typeHandler.init();

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
      await modbus.syncAllPumps(SyncRegList).catch((e)=>textLog(e));
      idHandler.setValue(modbus.availablePumpsList.findIndex((tf) => tf === true));
      self.loadingAnime.className = "animoSpinner animoSpinner--none";
      if (idHandler.slaveID == -1) {
        return;
      }
      modeHandler.setValue(regTable.getData(idHandler.slaveID,40051));
      syncParamTable.copyRegTable();
      intervalUpdateStatus.start();
      intervalUpdateMainView.start();
    });
  }
}
serialConnectionManager.init();

/* RUN, PAUSE, STOP ボタン */
const driveBtnHandler = {
  btnRUN: document.getElementById("btnRUN"),
  btnPAUSE: document.getElementById("btnPAUSE"),
  btnSTOP: document.getElementById("btnSTOP"),
  init: function(){
    const self = this;
    self.btnRUN.addEventListener(
    "click",
    async function () {
      self.btnRUN.disabled = true;
      try{
        if(regTable.getData(idHandler.slaveID, 40104)===1){
          const mode = regTable.getData(idHandler.slaveID, 40051);
          activePump.writeSyncPumps(40051, mode);
          activePump.writeSyncPumps(40081, regTable.getData(idHandler.slaveID, 40081));
          activePump.writeSyncPumps(40091, regTable.getData(idHandler.slaveID, 40091));
          activePump.writeSyncPumps(40061, regTable.getData(idHandler.slaveID, 40061));
          activePump.writeSyncPumps(40104, 1);
          switch(mode){
            case 0://manual
            case 3: //BATCH
            case 4: //MAX
            case 5: //CALIB
            case 6: //TOP 
            case 7: //BOTTOM
            case 8: //AIR
            case 10: //TUNING
              break;
            case 1 : //analog
            case 2 : //pulse
              activePump.writeSyncPumps(40701, regTable.getData(idHandler.slaveID, 40701));
              activePump.writeSyncPumps(40703, regTable.getData(idHandler.slaveID, 40703));
              break;

            default :
              break;
          }
          activePump.writeSyncPumps(40133, 1);
          activePump.writeSyncPumps(40131, 1);       
        }else{
          activePump.write(40133, 1);
          activePump.write(40131, 1);      
        }
      }catch(e){
        textLog(e);
      }
      self.btnRUN.disabled = false;
    },
    false
    );
    
    self.btnPAUSE.addEventListener(
    "click",
    async function () {
      self.btnPAUSE.disabled = true;
      try{
        if(regTable.getData(idHandler.slaveID, 40104)===1){
          activePump.writeSyncPumps(40131, 0);       
        }else{
          activePump.write(40131, 0);      
        }
      }catch(e){
        textLog(e);
      }
      self.btnPAUSE.disabled = false;
    },
    false
    );
    
    self.btnSTOP.addEventListener(
    "click",
    async function () {
      self.btnSTOP.disabled = true;
      try{
        if(regTable.getData(idHandler.slaveID, 40104)===1){
          activePump.writeSyncPumps(40133, 0);       
        }else{
          activePump.write(40133, 0);      
        }
      }catch(e){
        textLog(e);
      }
      self.btnSTOP.disabled = false;
    },
    false
    );
    
  },
  enable: function(){
    this.btnRUN.className = "btn-drive";
    this.btnPAUSE.className = "btn-drive";
    this.btnSTOP.className = "btn-drive";
  },
  disable: function(){
    this.btnRUN.className = "btn-drive btn-drive--disabled";
    this.btnPAUSE.className = "btn-drive btn-drive--disabled";
    this.btnSTOP.className = "btn-drive btn-drive--disabled";
  },
  enableSTOP: function(){
    this.btnSTOP.className = "btn-drive";
  }
}
driveBtnHandler.init();

/* RESET ボタン */
const resetBtnHandler = {
  btnReset : document.getElementById("btnReset"),
  btnAllReset : document.getElementById("btnAllReset"),
  init: function(){
    btnReset.addEventListener(
      "click",
      async function () {
        btnReset.disabled = true;
        try{
          if(regTable.getData(idHandler.slaveID, 40104)===1){
            activePump.writeSyncPumps(40191, 0);       
          }else{
            activePump.write(40191, 0);      
          }
        }catch(e){
          textLog(e);
        }
        //sync処理も行う？
        btnReset.disabled = false;
      },
      false
    );
    btnAllReset.addEventListener(
      "click",
      async function () {
        btnReset.disabled = true;
        try{
          for(let i = 0;i < 16; i++){
            regTable.setData(i, 40191, 0);
            await modbus.write(i, 40191, regTable.getIntData(i, 40191));
          }
        }catch(e){
          textLog(e);
        }
        //sync処理も行う？
        btnReset.disabled = false;
      },
      false
    );  
  }
}
resetBtnHandler.init();

/*圧力推定*/
const psEstHandler = {
  inEstPs: document.getElementById("inEstPs"),
  update: async function(){
    try{
      const self =this;
      const estps = await activePump.read(30151);
      self.inEstPs.value = Math.round(estps*100)/100;
    }catch(e){
      textLog(e);
    }
  }
}

/*Mメインビュー表示管理*/
const MainView = {
  mainView: document.getElementById("mainView"),
  lastMODE: -1,
  lastSyncEnable: -1,
  forcedUpdate: function(){
    this.lastMODE = -1;
    this.lastSyncEnable = -1;
    this.update();
  },
  update:async function(){
    const mode = regTable.getData(idHandler.slaveID, 40051);
    modeHandler.setValue(mode);
    const syncEnable = regTable.getData(idHandler.slaveID, 40104);
    const isChanged = (this.lastMODE != mode)||(this.lastSyncEnable != syncEnable);
    switch(mode){
      case 0 ://manual
        if(isChanged){
          driveBtnHandler.enable();
          spmHandler.inputEnable();
          slHandler.inputEnable();
          typeHandler.inputEnable();
          spmHandler.setValue(regTable.getData(idHandler.slaveID, 40081));
          slHandler.setValue(regTable.getData(idHandler.slaveID, 40091));
          typeHandler.setValue(regTable.getData(idHandler.slaveID, 40061));
        }
        break;
      case 1 : //analog
      case 2 : //pulse
        if(isChanged){
          driveBtnHandler.enable();
          spmHandler.inputDisable();
          slHandler.inputEnable();
          typeHandler.inputEnable();
          slHandler.setValue(regTable.getData(idHandler.slaveID, 40091));
          typeHandler.setValue(regTable.getData(idHandler.slaveID, 40061));
        }
        await this.readExtSpm();
        break;
      case 3: //BATCH
        if(isChanged){
          driveBtnHandler.enable();
          spmHandler.inputEnable();
          slHandler.inputEnable();
          typeHandler.inputEnable();
          spmHandler.setValue(regTable.getData(idHandler.slaveID, 40081));
          slHandler.setValue(regTable.getData(idHandler.slaveID, 40091));
          typeHandler.setValue(regTable.getData(idHandler.slaveID, 40061));
        }
        await batchControl.updateBatchLeft().catch((e)=>{textLog(e)});
        break;
      case 4: //MAX
        if(isChanged){
          driveBtnHandler.enable();
          spmHandler.inputDisable();
          spmHandler.setValue(720);
          slHandler.inputEnable();
          typeHandler.inputEnable();
        }
        break;
      case 5: //CALIB
        
        break;
      case 6: //TOP
      case 7: //BOTTOM
        if(isChanged){
          spmHandler.inputDisable();
          slHandler.inputDisable();
          typeHandler.inputDisable();
          driveBtnHandler.disable();
        }
        break;
      case 8: //AIR
        if(isChanged){
          await modbus.read(idHandler.slaveID, 30111).catch((e)=>{textLog(e)});
          driveBtnHandler.enable();
          spmHandler.inputDisable();
          spmHandler.setValue(720);
          slHandler.inputDisable();
          slHandler.setValue(Math.round((regTable.getData(idHandler.slaveID, 30111)-0.1)*100)/100);
          typeHandler.inputDisable();
          typeHandler.setValue(2);//CONT
        }
        break;
      case 10: //TUNING
        if(isChanged){
          driveBtnHandler.enable();
          spmHandler.inputDisable();
          spmHandler.setValue(0);
          slHandler.inputDisable();
          slHandler.setValue(0);
          typeHandler.inputDisable();
          typeHandler.setValue(0);//SINE
        }
        await tuningControl.statusUpdate();
        break;
      case 13: //PS_EST_TUNING
        if(isChanged){
          driveBtnHandler.enable();
          spmHandler.inputDisable();
          spmHandler.setValue(0);
          slHandler.inputDisable();
          slHandler.setValue(0);
          typeHandler.inputDisable();
          typeHandler.setValue(0);//SINE
        }
        await estCalControl.statusUpdate();
        break;

      default :
        break;
    }
    if(isChanged){
      if(syncEnable){
        syncControl.syncCheck.checked = true;
        syncControl.syncSetting.className = "sync-setting";
        const result = syncControl.updateModeSettingView();
        if(result.success){
          /*
          driveBtnHandler.enable();
          spmHandler.inputEnable();
          slHandler.inputEnable();
          typeHandler.inputEnable();
          spmHandler.setValue(regTable.getData(idHandler.slaveID, 40081));
          slHandler.setValue(regTable.getData(idHandler.slaveID, 40091));
          typeHandler.setValue(regTable.getData(idHandler.slaveID, 40061));
          */
        }else{
          driveBtnHandler.disable();
          driveBtnHandler.enableSTOP();
          spmHandler.inputDisable();
          slHandler.inputDisable();
          typeHandler.inputDisable();
        }
      }else{
        syncControl.syncCheck.checked = false;
        syncControl.syncSetting.className = "sync-setting sync-setting--none";
      }      
    }    
    this.lastMODE = mode;
    this.lastSyncEnable = syncEnable;
  },
  readExtSpm: async function () {
    try {
      await modbus.read(idHandler.slaveID, 30101);
    } catch (e) {
      textLog(e);
      return;
    }
    spmHandler.setValue(Math.round(regTable.getData(idHandler.slaveID, 30101)*100)/100);
  }
}

/*エラー問い合わせ*/
const inStatus = document.getElementById("inStatus");
const statusLed = document.getElementById("statusLed");
async function updateStatus(id) {
  if (!modbus.availablePumpsList[id]) {
    statusLed.className = "led-off";
    inStatus.value = "disconnect";
    return;
  }
  try {
    await modbus.read(id, 30121);
    await modbus.read(id, 40191);
  } catch (e) {
    textLog(e);
    statusLed.className = "led-off";
    inStatus.value = "disconnect";
    return;
  }

  const errData = regTable.getData(id, 40191) ;
  if (errData != 0) {
    statusLed.className = "led-red led-red--blink";
    inStatus.value = `Error ${errData}`;
  } else {
    const condition = regTable.getData(id, 30121);
    switch (condition) {
      case 0:
        statusLed.className = "led-red";
        inStatus.value = "STOP";
        break;

      case 1:
        statusLed.className = "led-yellow";
        inStatus.value = "PAUSE";
        break;

      case 2:
        statusLed.className = "led-green led-green--blink";
        inStatus.value = "RUN";
        break;

      default:
        statusLed.className = "led-off";
        inStatus.value = "unknown";
    }
  }
}

/* データロギング */
const inLoggingStart = document.getElementById("inLoggingStart");
const inLoggingAddress = document.getElementById("inLoggingAddress");
const inLoggingInterval = document.getElementById("inLoggingInterval");

inLoggingStart.addEventListener(
  "change",
  async function () {
    if(inLoggingStart.checked) {
      intervalLoggingData.start();
    }else{
      intervalLoggingData.stop();
    }
    return;
  },
  false
);

inLoggingInterval.addEventListener(
  "change",
  async function () {
    intervalLoggingData.changeInterval(inLoggingInterval.value);
    return;
  },
  false
);

/*データロギング*/
async function loggingData(id){
  try {
    const addressArray = parseNumbers(escapeHtml(inLoggingAddress.value));
    let dataArray = new Array(addressArray.length);
    for(let i = 0; i < addressArray.length;i++){
      await modbus.read(id, addressArray[i]);
      dataArray[i] = regTable.getData(id, addressArray[i]);
    }
    dataArray = dataArray.map((element) => {return Math.round(element*10000)/10000});
    dataLog(dataArray.join(','));
  }catch (e) {
    dataLog(e);
  }
  return;
}

/*デモ用
//デモ用混合比率
const mixtureRatio = document.getElementById("mixtureRatio");
const mixtureRatioDisp = document.getElementById("mixtureRatioDisp");
const mixtureGroup1 = document.getElementById("mixtureGroup1");
const mixtureGroup2 = document.getElementById("mixtureGroup2");
// ここを追加
mixtureRatio.addEventListener("input", (e) => {
  const value = e.target.value;
  mixtureRatioDisp.innerHTML = value;
});
mixtureRatio.addEventListener(
  "change",
  async function () {
  if(regTable.getData(idHandler.slaveID, 40104)===1){
    const ratio = mixtureRatio.value;
    const group1 = mixtureGroup1.value;
    const group2 = mixtureGroup2.value;
    for(let i = 1;i<=15;i++){
      if(syncParamTable.table[i].group == group1){
        regTable.setData(i, 40081, 20*ratio*0.01);
        await modbus
          .write(i, 40081, regTable.getIntData(i, 40081))
          .catch((error) => {
            textLog(error);
          });     
      }          
    }
    for(let i = 1;i<=15;i++){
      if(syncParamTable.table[i].group == group2){
        regTable.setData(i, 40081, 20*(100-ratio)*0.01);
        await modbus
          .write(i, 40081, regTable.getIntData(i, 40081))
          .catch((error) => {
            textLog(error);
          });     
      }          
    }       
  }
  },
  false
);
*/

/*ウィンドウが非アクティブになった際にポーリングを一時停止する処理*/
window.addEventListener('blur', () => {
  intervalUpdateStatus.suspend();
  intervalLoggingData.suspend();
  intervalUpdateMainView.suspend();
});
window.addEventListener('focus', () => {
  intervalUpdateStatus.resume();
  intervalLoggingData.resume();
  intervalUpdateMainView.resume();
});
