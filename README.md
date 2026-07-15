import React, { useState, useEffect } from 'react';

// ผักชนิดต่างๆ ที่นิยมปลูกในระบบไฮโดรโปนิกส์
const VEGETABLE_TYPES = [
  { id: 'green-oak', name: 'กรีนโอ๊ค (Green Oak)', cycleDays: 45, ecRange: [1.2, 1.6], pHRange: [5.5, 6.5] },
  { id: 'red-oak', name: 'เรดโอ๊ค (Red Oak)', cycleDays: 45, ecRange: [1.2, 1.6], pHRange: [5.5, 6.5] },
  { id: 'cos', name: 'คอส (Cos)', cycleDays: 50, ecRange: [1.4, 1.8], pHRange: [5.8, 6.8] },
  { id: 'butterhead', name: 'บัตเตอร์เฮด (Butterhead)', cycleDays: 50, ecRange: [1.2, 1.6], pHRange: [5.5, 6.5] },
  { id: 'frillice', name: 'ฟิลเลย์ ไอซ์เบิร์ก (Frillice)', cycleDays: 50, ecRange: [1.5, 1.9], pHRange: [5.8, 6.5] }
];

// รายการรางปลูกทั้ง 4 รางที่มีระบบอ่างปุ๋ยแยกส่วนของตนเองพร้อมขนาดถังลิตร
const RAILS = [
  { id: 'nursery-1', name: 'รางอนุบาล 1 (ราง 1)', capacity: 140 },
  { id: 'nursery-2', name: 'รางอนุบาล 1 (ราง 2)', capacity: 140 },
  { id: 'nft-double', name: 'ราง NFT (รางคู่)', capacity: 140 },
  { id: 'nft-8m', name: 'ราง NFT 8 เมตร', capacity: 120 }
];

// ข้อมูลล็อตเริ่มต้นตามขั้นตอนปลูก 5 ระดับ และการระบุพิกัดราง
const INITIAL_LOTS = [
  {
    id: 'lot-4',
    sequence: 4,
    name: 'ล็อตที่ #4 (กรีนโอ๊ค - 14/07/2026)',
    vegetables: [{ id: 'green-oak', qty: 250 }],
    sowedDate: '2026-07-14',
    sowedQty: 250,
    currentQty: 250,
    stage: 'tissue', // ขั้น 1: เพาะเมล็ดในทิชชู่
    railId: '',
    locationPhotos: [],
    cupColor: ''
  },
  {
    id: 'lot-3',
    sequence: 3,
    name: 'ล็อตที่ #3 (คอส + เรดโอ๊ค - 10/07/2026)',
    vegetables: [
      { id: 'cos', qty: 200 },
      { id: 'red-oak', qty: 100 }
    ],
    sowedDate: '2026-07-10',
    sowedQty: 300,
    currentQty: 282,
    stage: 'sponge', // ขั้น 2: ลงโฟมเพาะ
    railId: '',
    locationPhotos: [],
    cupColor: ''
  },
  {
    id: 'lot-2',
    sequence: 2,
    name: 'ล็อตที่ #2 (เรดโอ๊ค - 28/06/2026)',
    vegetables: [{ id: 'red-oak', qty: 150 }],
    sowedDate: '2026-06-28',
    sowedQty: 150,
    currentQty: 135,
    stage: 'nursery', // ขั้น 3: ลงรางอนุบาล 1
    railId: 'nursery-1',
    cupColor: 'สีส้ม',
    locationPhotos: ['https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=400'],
    notes: 'ย้ายลงรางอนุบาล 1 เรียบร้อย สภาพต้นแข็งแรงดี'
  },
  {
    id: 'lot-1',
    sequence: 1,
    name: 'ล็อตที่ #1 (บัตเตอร์เฮด - 15/06/2026)',
    vegetables: [{ id: 'butterhead', qty: 200 }],
    sowedDate: '2026-06-15',
    sowedQty: 200,
    currentQty: 180,
    stage: 'nft', // ขั้น 4: ลงรางNFT
    railId: 'nft-double',
    cupColor: 'สีขาว',
    locationPhotos: ['https://images.unsplash.com/photo-1508500387859-6e48b4ad5d86?auto=format&fit=crop&q=80&w=400'],
    notes: 'ย้ายจากอนุบาลมาลงราง NFT คู่ สังเกตพัฒนาการใบกว้างสม่ำเสมอ'
  },
  {
    id: 'lot-old-harvested',
    sequence: 5,
    name: 'ล็อตที่ #5 (ประวัติ - เก็บเกี่ยวแล้ว)',
    vegetables: [{ id: 'green-oak', qty: 200 }],
    sowedDate: '2026-05-10',
    sowedQty: 200,
    currentQty: 0,
    stage: 'harvested', // ขั้น 5: เก็บเกี่ยว
    railId: 'nft-8m',
    cupColor: 'สีขาว',
    locationPhotos: [],
    harvestQty: 192,
    averageWeight: 145
  },
  {
    id: 'lot-old-culled',
    sequence: 6,
    name: 'ล็อตที่ #6 (ประวัติ - คัดทิ้งทั้งล็อต)',
    vegetables: [{ id: 'frillice', qty: 150 }],
    sowedDate: '2026-05-20',
    sowedQty: 150,
    currentQty: 0,
    stage: 'culled', // คัดทิ้งทั้งล็อต
    railId: 'nursery-2',
    cupColor: 'สีฟ้า',
    locationPhotos: [],
    notes: 'คัดทิ้งทั้งล็อตเนื่องจากปั๊มน้ำขัดข้องในช่วงวันหยุดและรากแห้งตาย'
  }
];

// บันทึกสารอาหารน้ำของรางปลูกทั้ง 4 รางหลัก
const INITIAL_DAILY_LOGS = [
  { 
    id: 'log-1', 
    railId: 'nursery-1', 
    date: '2026-07-13', 
    time: '08:30', 
    pH: 6.2, 
    ec: 1.4, 
    waterTemp: 26.5, 
    waterLevel: 95, 
    weather: 'sunny', 
    notes: 'น้ำในรางอนุบาล 1 ใสสะอาดดี ค่าปุ๋ยนิ่งตามเกณฑ์',
    gps: '16.4322, 102.8236',
    dailyPhotos: ['https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&q=80&w=400'],
    addedAB: 50,
    addedPhDown: 10,
    addedPhUp: 0,
    addedWaterVolume: 5,
    afterPh: 6.0,
    afterEc: 1.5
  },
  { 
    id: 'log-2', 
    railId: 'nft-double', 
    date: '2026-07-14', 
    time: '09:00', 
    pH: 6.4, 
    ec: 1.6, 
    waterTemp: 27.2, 
    waterLevel: 92, 
    weather: 'cloudy', 
    notes: 'วัดค่าของราง NFT รางคู่ ใบเลี้ยงกางสมบูรณ์ แต่อุณหภูมิเริ่มสูงขึ้นช่วงสาย',
    gps: '16.4322, 102.8236',
    dailyPhotos: [],
    addedAB: 0,
    addedPhDown: 0,
    addedPhUp: 0,
    addedWaterVolume: 0,
    afterPh: null,
    afterEc: null
  },
  { 
    id: 'log-3', 
    railId: 'nft-8m', 
    date: '2026-07-14', 
    time: '11:15', 
    pH: 5.9, 
    ec: 1.7, 
    waterTemp: 28.1, 
    waterLevel: 90, 
    weather: 'hot', 
    notes: 'ราง NFT 8 เมตร น้ำค่อนข้างร้อนเนื่องจากแดดส่องบ่อพัก',
    gps: '16.4420, 102.8122',
    dailyPhotos: ['https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=400'],
    addedAB: 100,
    addedPhDown: 0,
    addedPhUp: 5,
    addedWaterVolume: 10,
    afterPh: 6.1,
    afterEc: 1.8
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('daily-record');
  const [lots, setLots] = useState(() => {
    const saved = localStorage.getItem('hydro_lots');
    return saved ? JSON.parse(saved) : INITIAL_LOTS;
  });
  const [dailyLogs, setDailyLogs] = useState(() => {
    const saved = localStorage.getItem('hydro_daily_logs');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_LOGS;
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });
  const [searchRailId, setSearchRailId] = useState('');
  const [searchLotInHistory, setSearchLotInHistory] = useState('');

  // Guide states
  const [guideSearchQuery, setGuideSearchQuery] = useState('');
  const [viewedGuideHistory, setViewedGuideHistory] = useState(() => {
    const saved = localStorage.getItem('hydro_guide_history');
    return saved ? JSON.parse(saved) : [
      { date: '14/07/2026', title: 'การควบคุมค่า pH สำหรับผักกรีนโอ๊ค' },
      { date: '12/07/2026', title: 'วิธีจำแนกเชื้อรา Pythium จากรากสลัดสีคล้ำ' }
    ];
  });

  // LocalStorage Persist Effect
  useEffect(() => {
    localStorage.setItem('hydro_lots', JSON.stringify(lots));
  }, [lots]);

  useEffect(() => {
    localStorage.setItem('hydro_daily_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('hydro_guide_history', JSON.stringify(viewedGuideHistory));
  }, [viewedGuideHistory]);

  // Real-time clock hook
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const triggerAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: '', text: '' }), 5000);
  };

  // Custom confirm dialog state to completely replace window.confirm and window.alert
  const [customConfirm, setCustomConfirm] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'ยืนยันการทำรายการ',
    cancelText: 'ยกเลิก',
    onConfirm: null,
    type: 'warning' // 'warning', 'danger', 'info'
  });

  const requestConfirm = (title, message, onConfirm, type = 'warning', confirmText = 'ยืนยัน', cancelText = 'ยกเลิก') => {
    setCustomConfirm({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setCustomConfirm(prev => ({ ...prev, isOpen: false }));
      },
      confirmText,
      cancelText,
      type
    });
  };

  // GPS Coordinates handling
  const [currentGps, setCurrentGps] = useState('');
  const [fetchingGps, setFetchingGps] = useState(false);

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      triggerAlert('danger', 'อุปกรณ์ของคุณไม่รองรับการดึงพิกัด GPS');
      return;
    }
    setFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        setCurrentGps(coords);
        setFetchingGps(false);
        triggerAlert('success', `📍 ได้ดึงพิกัด GPS สำเร็จ: ${coords}`);
      },
      (error) => {
        setFetchingGps(false);
        triggerAlert('warning', 'ไม่สามารถดึงตำแหน่งได้ กรุณาเปิดสิทธิ์การเข้าถึงตำแหน่งของอุปกรณ์');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Chemical addition dropdown states inside the record form
  const [showChemicalAdditions, setShowChemicalAdditions] = useState(false);
  const [addedAB, setAddedAB] = useState('0');
  const [addedPhDown, setAddedPhDown] = useState('0');
  const [addedPhUp, setAddedPhUp] = useState('0');
  const [addedWaterVolume, setAddedWaterVolume] = useState('0');
  // New input fields for post-addition measurement
  const [afterPh, setAfterPh] = useState('');
  const [afterEc, setAfterEc] = useState('');

  // Create Lot state management (support multi-veg dropdown inside)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLotSowedDate, setNewLotSowedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mainVegId, setMainVegId] = useState('green-oak');
  const [mainVegQty, setMainVegQty] = useState(200);

  // Multi-vegetable lists in single lot
  const [showMultiVeg, setShowMultiVeg] = useState(false);
  const [additionalVegs, setAdditionalVegs] = useState([]); // Array of { id, qty }

  const handleAddAdditionalVegLine = () => {
    setAdditionalVegs([...additionalVegs, { id: 'red-oak', qty: 50 }]);
  };

  const handleRemoveAdditionalVegLine = (index) => {
    setAdditionalVegs(additionalVegs.filter((_, idx) => idx !== index));
  };

  const handleUpdateAdditionalVeg = (index, key, value) => {
    setAdditionalVegs(additionalVegs.map((item, idx) => {
      if (idx === index) {
        return { ...item, [key]: value };
      }
      return item;
    }));
  };

  // Edit Dialog Mode: 'current' (info/qty) or 'stage' (revert/move status)
  const [editingLot, setEditingLot] = useState(null);
  const [editTab, setEditTab] = useState('current'); // 'current' or 'stage'
  const [editLotName, setEditLotName] = useState('');
  const [editLotQty, setEditLotQty] = useState(200);
  const [editLotRail, setEditLotRail] = useState('');
  const [editLotStage, setEditLotStage] = useState('tissue');
  const [editLotCupColor, setEditLotCupColor] = useState('สีขาว');

  // Daily Form control states
  const [selectedRailForLog, setSelectedRailForLog] = useState(RAILS[0]?.id || '');
  const [logPH, setLogPH] = useState('6.0');
  const [logEC, setLogEC] = useState('1.4');
  const [logWaterTemp, setLogWaterTemp] = useState('26.0');
  const [logWaterLevel, setLogWaterLevel] = useState('95');
  const [logWeather, setLogWeather] = useState('sunny');
  const [logNotes, setLogNotes] = useState('');
  const [tempDailyPhotos, setTempDailyPhotos] = useState([]);

  // Transition stage states
  const [activeTransitionLot, setActiveTransitionLot] = useState(null);
  const [transitionStage, setTransitionStage] = useState('');
  const [transitionForm, setTransitionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    qty: 0,
    railId: '',
    extraNotes: '',
    cupColor: 'สีขาว',
    averageWeight: '150'
  });

  // AI Export states
  const [selectedLotForAI, setSelectedLotForAI] = useState(lots[0]?.id || '');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [aiReportText, setAiReportText] = useState('');

  const handleCreateLot = (e) => {
    e.preventDefault();

    // Summing up all vegetables of this lot
    const mainVegObj = { id: mainVegId, qty: Number(mainVegQty) };
    const allVegsInLot = [mainVegObj, ...additionalVegs.map(item => ({ id: item.id, qty: Number(item.qty) }))];
    const totalQty = allVegsInLot.reduce((sum, item) => sum + item.qty, 0);

    const nextSequence = lots.length > 0 ? Math.max(...lots.map(l => l.sequence)) + 1 : 1;
    
    // Formatting date
    const [year, month, day] = newLotSowedDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    // Get primary veg names to construct readable name
    const primaryVegObj = VEGETABLE_TYPES.find(v => v.id === mainVegId);
    const primaryVegTh = primaryVegObj ? primaryVegObj.name.split(' ')[0] : 'สลัด';
    const hasMore = additionalVegs.length > 0 ? ` +${additionalVegs.length} ชนิด` : '';
    const constructedName = `ล็อตที่ #${nextSequence} (${primaryVegTh}${hasMore} - ${formattedDate})`;

    const executeCreate = () => {
      const newLot = {
        id: `lot-${Date.now()}`,
        sequence: nextSequence,
        name: constructedName,
        vegetables: allVegsInLot,
        sowedDate: newLotSowedDate,
        sowedQty: totalQty,
        currentQty: totalQty,
        stage: 'tissue',
        railId: '',
        locationPhotos: [],
        cupColor: ''
      };

      setLots([newLot, ...lots]);
      setShowAddModal(false);
      // Reset form states
      setAdditionalVegs([]);
      setShowMultiVeg(false);
      triggerAlert('success', `🌱 เพิ่มล็อตที่ #${nextSequence} ลงทะเบียนในระยะเริ่มเพาะสำเร็จแล้ว`);
    };

    requestConfirm(
      'ยืนยันการเริ่มล็อตใหม่',
      `คุณต้องการจัดสร้างล็อตปลูก "${constructedName}" ประกอบด้วยผักจำนวนรวม ${totalQty} ต้น ใช่หรือไม่?`,
      executeCreate,
      'info',
      'ตกลงเริ่มเพาะผัก'
    );
  };

  const handleOpenEdit = (lot) => {
    setEditingLot(lot);
    setEditTab('current');
    setEditLotName(lot.name);
    setEditLotQty(lot.currentQty);
    setEditLotRail(lot.railId || '');
    setEditLotStage(lot.stage);
    setEditLotCupColor(lot.cupColor || 'สีขาว');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingLot) return;

    const executeSave = () => {
      setLots(prev => prev.map(l => {
        if (l.id === editingLot.id) {
          return {
            ...l,
            name: editLotName,
            currentQty: Number(editLotQty),
            railId: editLotRail,
            stage: editLotStage,
            cupColor: editLotCupColor
          };
        }
        return l;
      }));
      setEditingLot(null);
      triggerAlert('success', '✏️ ได้จัดเก็บการบันทึกแก้ไขข้อมูลแปลงเรียบร้อยแล้ว');
    };

    requestConfirm(
      'ยืนยันการแก้ไขข้อมูลล็อต',
      `คุณต้องการอัปเดตการแก้ไขสำหรับล็อต "${editLotName}" ใช่หรือไม่?`,
      executeSave,
      'warning',
      'บันทึกข้อมูลย่อย'
    );
  };

  const handleDeleteLot = (lotId) => {
    const targetLot = lots.find(l => l.id === lotId);
    if (!targetLot) return;

    const executeDelete = () => {
      setLots(prev => prev.filter(l => l.id !== lotId));
      if (editingLot && editingLot.id === lotId) setEditingLot(null);
      triggerAlert('warning', '🗑️ ได้ทำการลบข้อมูลล็อตที่ระบุออกจากคลังฐานข้อมูลอย่างถาวรแล้ว');
    };

    requestConfirm(
      '⚠️ ยืนยันการลบล็อตทิ้งถาวร',
      `คุณกำลังจะลบล็อต "${targetLot.name}" ออกจากระบบ ข้อมูลพารามิเตอร์ทั้งหมดในล็อตจะสูญหายอย่างถาวร ต้องการลบใช่หรือไม่?`,
      executeDelete,
      'danger',
      'ลบถาวรทันที'
    );
  };

  const handleCullEntireLot = (lotId) => {
    const targetLot = lots.find(l => l.id === lotId);
    if (!targetLot) return;

    const executeCull = () => {
      setLots(prev => prev.map(l => {
        if (l.id === lotId) {
          return {
            ...l,
            stage: 'culled',
            currentQty: 0,
            notes: `${l.notes || ''} [คัดออกและปลดระวางพืชทั้งหมด วันที่ ${new Date().toLocaleDateString('th-TH')}]`
          };
        }
        return l;
      }));
      if (editingLot && editingLot.id === lotId) setEditingLot(null);
      triggerAlert('danger', '🍂 ล็อตปลูกนี้ถูกคัดแยกทิ้งทั้งหมด และจัดเตรียมเข้ารายงานวิเคราะห์ความเสียหายแล้ว');
    };

    requestConfirm(
      '🍂 ยืนยันการคัดทิ้งพืชยกแปลง',
      `คุณต้องการทำรายการ "คัดทิ้งทั้งล็อต" สำหรับ "${targetLot.name}" ใช่หรือไม่? พืชในล็อตนี้จะไม่แสดงผลในหน้ารวมหลักของฟาร์มแต่จะถูกเก็บเข้าประวัติรายงานวิเคราะห์`,
      executeCull,
      'danger',
      'ยืนยันการคัดทิ้งทั้งหมด'
    );
  };

  const handleSaveDailyLog = (e) => {
    e.preventDefault();
    if (!selectedRailForLog) {
      triggerAlert('warning', 'กรุณาระบุรางปลูกที่ตรวจวัดสารอาหารน้ำ');
      return;
    }

    const targetRailName = RAILS.find(r => r.id === selectedRailForLog)?.name || 'รางปลูก';

    const executeSaveLog = () => {
      const newLog = {
        id: `log-${Date.now()}`,
        railId: selectedRailForLog,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        pH: Number(logPH),
        ec: Number(logEC),
        waterTemp: Number(logWaterTemp),
        waterLevel: Number(logWaterLevel),
        weather: logWeather,
        notes: logNotes,
        gps: currentGps,
        dailyPhotos: tempDailyPhotos,
        // Chemical additions and post values
        addedAB: showChemicalAdditions ? Number(addedAB) : 0,
        addedPhDown: showChemicalAdditions ? Number(addedPhDown) : 0,
        addedPhUp: showChemicalAdditions ? Number(addedPhUp) : 0,
        addedWaterVolume: showChemicalAdditions ? Number(addedWaterVolume) : 0,
        afterPh: (showChemicalAdditions && afterPh) ? Number(afterPh) : null,
        afterEc: (showChemicalAdditions && afterEc) ? Number(afterEc) : null
      };

      setDailyLogs([newLog, ...dailyLogs]);
      setLogNotes('');
      setTempDailyPhotos([]);
      // Reset chemicals fields
      setAddedAB('0');
      setAddedPhDown('0');
      setAddedPhUp('0');
      setAddedWaterVolume('0');
      setAfterPh('');
      setAfterEc('');
      setShowChemicalAdditions(false);

      triggerAlert('success', `💾 ได้บันทึกข้อมูลประจำวันของ ${targetRailName} เรียบร้อยแล้ว`);
    };

    requestConfirm(
      'บันทึกพารามิเตอร์คุณภาพน้ำ',
      `ยืนยันการบันทึกค่าน้ำและการวิเคราะห์ประวัติสำหรับราง "${targetRailName}" ใช่หรือไม่?`,
      executeSaveLog,
      'info',
      'ตกลงบันทึกค่า'
    );
  };

  const handleDeleteDailyLog = (logId) => {
    const executeDeleteLog = () => {
      setDailyLogs(prev => prev.filter(item => item.id !== logId));
      triggerAlert('warning', '🗑️ ลบประวัติค่าน้ำที่ระบุเรียบร้อย');
    };

    requestConfirm(
      'ยืนยันการลบประวัติย้อนหลัง',
      'คุณต้องการลบรายงานบันทึกคุณภาพน้ำรายการนี้ออกจากประวัติย้อนหลังของฟาร์มใช่หรือไม่? (การกระทำนี้ไม่สามารถย้อนกลับได้)',
      executeDeleteLog,
      'danger',
      'ลบประวัติ'
    );
  };

  const handleUploadLocationPhoto = (lotId, source, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLots(prev => prev.map(l => {
          if (l.id === lotId) {
            return {
              ...l,
              locationPhotos: [reader.result, ...(l.locationPhotos || [])]
            };
          }
          return l;
        }));
        triggerAlert('success', `📸 บันทึกรูปผังที่ตั้งทางกายภาพของล็อตสำเร็จ (${source === 'camera' ? 'กล้องถ่ายภาพ' : 'คลังรูปถ่าย'})`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadDailyPhoto = (source, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempDailyPhotos(prev => [reader.result, ...prev]);
        triggerAlert('success', `📸 เก็บภาพวิเคราะห์สุขภาพพืชไว้ชั่วคราวแล้ว (${source === 'camera' ? 'กล้องถ่ายภาพ' : 'คลังรูปถ่าย'})`);
      };
      reader.readAsDataURL(file);
    }
  };

  const openTransitionModal = (lot, targetStage) => {
    setActiveTransitionLot(lot);
    setTransitionStage(targetStage);
    setTransitionForm({
      date: new Date().toISOString().split('T')[0],
      qty: lot.currentQty,
      railId: lot.railId || RAILS[0].id,
      extraNotes: '',
      cupColor: lot.cupColor || 'สีขาว',
      averageWeight: '150'
    });
  };

  const handleTransitionSubmit = (e) => {
    e.preventDefault();
    if (!activeTransitionLot) return;

    const executeTransition = () => {
      setLots(prev => prev.map(lot => {
        if (lot.id === activeTransitionLot.id) {
          const updated = {
            ...lot,
            stage: transitionStage,
            currentQty: Number(transitionForm.qty),
            notes: `${lot.notes || ''} [สลับขั้นตอนสู่ระยะ: ${transitionStage} วันที่ ${transitionForm.date}: ${transitionForm.extraNotes}]`
          };

          if (transitionStage === 'nursery' || transitionStage === 'nft') {
            updated.railId = transitionForm.railId;
            updated.cupColor = transitionForm.cupColor;
          }

          if (transitionStage === 'harvested') {
            updated.harvestQty = Number(transitionForm.qty);
            updated.averageWeight = Number(transitionForm.averageWeight);
            updated.currentQty = 0; // ย้ายพ้นรางปลูก
          }

          return updated;
        }
        return lot;
      }));

      triggerAlert('success', `🚀 ย้ายสลับขั้นตอนผักของล็อตไปยังระยะ "${transitionStage}" เรียบร้อยแล้ว`);
      setActiveTransitionLot(null);
    };

    requestConfirm(
      'ยืนยันการย้ายสถานะเพาะเลี้ยง',
      `คุณต้องการปรับเลื่อนขั้นการเจริญเติบโตของล็อตปลูก "${activeTransitionLot.name}" เข้าสู่ช่วงขั้นตอนถัดไปหรือไม่?`,
      executeTransition,
      'info',
      'ยืนยันการอัปเดตสลับขั้น'
    );
  };

  const handleGoogleSearchInGuide = () => {
    const query = guideSearchQuery.trim() || 'การปลูกผักสลัด ไฮโดรโปนิกส์ การรักษาโรคพืช';
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' ไฮโดรโปนิกส์ การป้องกันและรักษาศัตรูพืช')}`;
    window.open(googleUrl, '_blank');
    
    // Add to search histories
    if (query && !viewedGuideHistory.some(h => h.title === query)) {
      setViewedGuideHistory(prev => [
        { date: new Date().toLocaleDateString('th-TH'), title: query },
        ...prev
      ]);
    }
  };

  const handleHistorySearchClick = (term) => {
    setGuideSearchQuery(term);
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(term + ' ไฮโดรโปนิกส์ การป้องกันและรักษาศัตรูพืช')}`;
    window.open(googleUrl, '_blank');
    triggerAlert('success', `🔍 เปิดลิงก์สืบค้นข้อมูลเชิงลึกของคำค้นหา "${term}" บน Google และระบบคลังเรียบร้อยแล้ว`);
  };

  const handleDeleteHistoryItem = (e, idx) => {
    e.stopPropagation();
    setViewedGuideHistory(prev => prev.filter((_, i) => i !== idx));
    triggerAlert('info', '🧹 ลบประวัติสืบค้นที่ระบุแล้ว');
  };

  useEffect(() => {
    if (selectedLotForAI) {
      const lotObj = lots.find(l => l.id === selectedLotForAI);
      if (!lotObj) return;

      const railObj = RAILS.find(r => r.id === lotObj.railId);
      const relatedLogs = dailyLogs.filter(log => log.railId === lotObj.railId).slice(0, 4);

      let logText = relatedLogs.length > 0 
        ? relatedLogs.map(l => `- บันทึกวันที่ ${l.date} (${l.time} น.): pH=${l.pH}, EC=${l.ec} mS/cm, อุณหภูมิน้ำ=${l.waterTemp}°C, ระดับน้ำ=${l.waterLevel}%. (เคมีที่เพิ่ม: ปุ๋ย=${l.addedAB}มล., pH Down=${l.addedPhDown}มล., เติมน้ำ=${l.addedWaterVolume}ลิตร | หลังแก้ไข: pH=${l.afterPh || 'ไม่ได้บันทึก'}, EC=${l.afterEc || 'ไม่ได้บันทึก'}) พิกัด GPS: ${l.gps || 'ไม่มีข้อมูล'}`).join('\n')
        : '- ไม่พบบันทึกค่าน้ำย้อนหลังที่เกี่ยวข้องในรางปลูกนี้ของสัปดาห์นี้';

      // Gather multi-vegs in this lot
      const vegsSummary = lotObj.vegetables 
        ? lotObj.vegetables.map(item => {
            const staticObj = VEGETABLE_TYPES.find(v => v.id === item.id);
            return `- ${staticObj?.name || item.id}: จำนวนตั้งต้น ${item.qty} เมล็ด`;
          }).join('\n')
        : `- สายพันธุ์ผัก: สลัดไฮโดรโปนิกส์`;

      const prompt = `[รายละเอียดข้อมูลพารามิเตอร์ล็อตพืช]
- ชื่อล็อตปลูก: ${lotObj.name}
- ประวัติสายพันธุ์ผักในรุ่น:
${vegsSummary}
- วันเวลาเริ่มเพาะเมล็ด: ${lotObj.sowedDate}
- สีของถ้วยปลูกระบุแปลงย่อย: ${lotObj.cupColor || 'ไม่มีสีระบุ'}
- รางปลูกปัจจุบัน: ${railObj?.name || 'ไม่ได้อยู่บนราง / อยู่ขั้นตอนก่อนหน้า'}
- ยอดเมล็ดเริ่มปลูกสะสม: ${lotObj.sowedQty} ต้น | ยอดมีชีวิตล่าสุด: ${lotObj.currentQty} ต้น
- ระดับสถานะ: ${lotObj.stage}

[ประวัติบันทึกคุณภาพน้ำและระบบตรวจโรคในรางปลูก]
${logText}

[คำขอวิเคราะห์สำหรับ AI]
ผมได้แนบภาพประวัติพิกัดตำแหน่งล็อต และรูปถ่ายปัญหาบริเวณพุ่มใบ/ระบบรากมาพร้อมกับชุดคำสั่งนี้ ช่วยประเมินอาการขอบใบไหม้ (Tip burn), ตรวจสัญญาณรากเน่าจากเชื้อรา (Pythium), และวิเคราะห์ความเหมาะสมของช่วงอุณหภูมิน้ำตามพิกัด GPS เพื่อปรับปรุงสูตรสารอาหารให้ดีขึ้นด้วยครับ`;

      setAiReportText(prompt);
      setCopiedPrompt(false);
    }
  }, [selectedLotForAI, dailyLogs, lots]);

  // Copy Prompt function
  const copyToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = aiReportText;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedPrompt(true);
      triggerAlert('success', '📋 คัดลอกข้อความรายงานสำเร็จ! แนบพร้อมไฟล์รูปเพื่อวิเคราะห์ในแชทภายนอกได้เลยครับ');
    } catch (err) {
      triggerAlert('danger', 'เกิดข้อผิดพลาดในการคัดลอกข้อความโดยตรง');
    }
    document.body.removeChild(textArea);
  };

  const activeLots = lots.filter(l => l.stage !== 'harvested' && l.stage !== 'culled');
  const totalActivePlants = activeLots.reduce((sum, l) => sum + l.currentQty, 0);

  // Calculate percentages per stage safely
  const getStageCountAndPercent = (stageKey) => {
    if (totalActivePlants === 0) return { count: 0, percent: 0 };
    const count = activeLots.filter(l => l.stage === stageKey).reduce((sum, l) => sum + l.currentQty, 0);
    const percent = ((count / totalActivePlants) * 100);
    return { count, percent };
  };

  const stageData = [
    { key: 'tissue', name: '1.เพาะเมล็ดทิชชู่', color: '#F59E0B', data: getStageCountAndPercent('tissue') },
    { key: 'sponge', name: '2.ลงโฟมเพาะ', color: '#0EA5E9', data: getStageCountAndPercent('sponge') },
    { key: 'nursery', name: '3.ลงรางอนุบาล', color: '#6366F1', data: getStageCountAndPercent('nursery') },
    { key: 'nft', name: '4.ลงราง NFT', color: '#10B981', data: getStageCountAndPercent('nft') }
  ];

  // Doughnut Chart Geometry calculations
  let currentOffsetValue = 0;
  const svgRadius = 45;
  const svgCircumference = 2 * Math.PI * svgRadius; // 282.74

  const doughnutSegments = stageData.map((stage) => {
    const percentValue = stage.data.percent;
    const strokeLength = (percentValue / 100) * svgCircumference;
    // Fix offset layering to prevent overlapping stroke colors!
    const strokeOffset = -currentOffsetValue;
    currentOffsetValue += strokeLength;

    return {
      ...stage,
      strokeLength,
      strokeOffset
    };
  });

  // Filters for daily water log history
  const filteredDailyLogs = dailyLogs.filter(log => {
    const matchesRail = searchRailId ? log.railId === searchRailId : true;
    let matchesLotText = true;
    if (searchLotInHistory) {
      // Find lots related to this search text
      const matchingLots = lots.filter(l => l.name.toLowerCase().includes(searchLotInHistory.toLowerCase()));
      const activeMatchingRails = matchingLots.map(l => l.railId).filter(id => id);
      matchesLotText = activeMatchingRails.includes(log.railId);
    }
    return matchesRail && matchesLotText;
  });

  // Salad care manual details
  const saladGuideDatabase = [
    {
      id: 'guide-1',
      title: '🥬 ปัจจัยการปลูกผักสลัดไฮโดรโปนิกส์พื้นฐาน',
      category: 'basic',
      desc: 'ผักสลัดต้องการอุณหภูมิที่เหมาะสม ต่ำกว่า 30 องศาเซลเซียส ถ้าหากสูงเกินไปผักจะขม ขอบใบไหม้ และมีกลิ่นฉุน การควบคุมค่า pH ให้อยู่ระหว่าง 5.8-6.2 จะช่วยให้พืชดูดซึมธาตุอาหารได้ดีที่สุด',
      symptom: 'พืชแคระแกร็น ปลายใบอ่อนเหี่ยวเฉา',
      treatment: 'ใช้เครื่องวัดเทียบ pH และปรับปรุงพารามิเตอร์น้ำเสมอ'
    },
    {
      id: 'guide-2',
      title: '🦠 โรครากเน่าและโคนเน่าจากเชื้อรา Pythium',
      category: 'disease',
      desc: 'มักเกิดในสภาพน้ำขังที่อุณหภูมิสูงและออกซิเจนในน้ำต่ำ สังเกตรากจะเป็นเมือกสีน้ำตาลคล้ำ พืชจะแสดงอาการเหี่ยวเฉาในเวลากลางวันแม้ว่าน้ำจะไหลเวียนดี',
      symptom: 'รากเป็นเมือกน้ำตาลเข้ม ส่งกลิ่นอับ ผักเหี่ยวแห้งแดด',
      treatment: 'ล้างถังทำความสะอาด เปลี่ยนน้ำใหม่ ใส่เชื้อราไตรโคเดอร์มาชนิดผง และลดความร้อนของน้ำโดยติดตั้งสแลนกันแดดทับถังปุ๋ย'
    },
    {
      id: 'guide-3',
      title: '🍂 โรคขอบใบไหม้ (Tip burn)',
      category: 'disease',
      desc: 'เกิดจากการขาดธาตุแคลเซียมที่บริเวณส่วนใบอ่อน เนื่องจากความชื้นสัมพัทธ์ในอากาศสูงเกินไปทำให้พืชไม่สามารถคายน้ำเพื่อดูดแคลเซียมขึ้นไปเลี้ยงส่วนยอดได้',
      symptom: 'ปลายใบอ่อนมีลักษณะแห้งเป็นสีน้ำตาลเข้มหยิกงอ',
      treatment: 'เพิ่มการไหลเวียนของอากาศโดยใช้พัดลมเป่าหน้าแปลง ลดความเข้มข้นสารอาหารปุ๋ยลง 10-15% และหลีกเลี่ยงการโดนลมแห้งร้อนโดยตรง'
    },
    {
      id: 'guide-4',
      title: '🐛 เพลี้ยไฟและหนอนใยผักศัตรูร้ายตัวฉกาจ',
      category: 'pest',
      desc: 'เพลี้ยไฟชอบสภาพอากาศแห้ง ร้อน ลมแรง ดูดกินน้ำเลี้ยงส่งผลให้ยอดหยาบกระด้างและใบหงิก ส่วนหนอนใยกัดกินผิวใบด้านล่างจนใบเป็นรูพรุน',
      symptom: 'ใบด่างขาว ใบหงิก ยอดไม่เจริญ มีขี้หนอนตามใต้โฟม',
      treatment: 'ฉีดพ่นเชื้อราบิวเวอเรียและบีที (BT) สัปดาห์ละครั้งในช่วงเย็น หรือใช้สารสกัดน้ำส้มควันไม้ผสมเจือจางพ่นคุมแปลง'
    }
  ];

  const filteredGuides = saladGuideDatabase.filter(guide => {
    const q = guideSearchQuery.toLowerCase();
    return guide.title.toLowerCase().includes(q) || 
           guide.desc.toLowerCase().includes(q) || 
           guide.symptom.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased text-base sm:text-lg md:text-xl">
      
      {/* HEADER SECTION */}
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-10 border-b border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          <div className="flex items-center space-x-3">
            <div className="bg-white text-emerald-800 p-2.5 rounded-xl shadow-inner font-extrabold text-3xl sm:text-4xl flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14">
              🌱
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">ระบบควบคุมและติดตามการปลูกผักอัจฉริยะ</h1>
              <p className="text-xs sm:text-sm text-emerald-200 font-semibold mt-0.5">บันทึกควบคุมสารอาหารประจำอ่างและแปลงปลูกย่อย 4 ราง</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Realtime Clock */}
            <div className="bg-emerald-900/90 px-4 py-2 rounded-xl border border-emerald-700 font-mono text-sm sm:text-base flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
              <span>📅 {currentTime.toLocaleDateString('th-TH')}</span>
              <span className="text-yellow-300 font-bold">⏰ {currentTime.toLocaleTimeString('th-TH')} น.</span>
            </div>
          </div>

        </div>
      </header>

      {/* BANNER NOTIFICATION */}
      {alertMsg.text && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className={`p-4 rounded-xl border-2 flex items-center justify-between shadow-md transition-all duration-300 text-base sm:text-lg font-bold ${
            alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' :
            alertMsg.type === 'warning' ? 'bg-amber-50 text-amber-900 border-amber-300' :
            'bg-rose-50 text-rose-900 border-rose-300'
          }`}>
            <div className="flex items-center space-x-2.5">
              <span className="text-xl sm:text-2xl">{alertMsg.type === 'success' ? '✅' : alertMsg.type === 'warning' ? '⚠️' : '❌'}</span>
              <p className="leading-tight">{alertMsg.text}</p>
            </div>
            <button onClick={() => setAlertMsg({ type: '', text: '' })} className="text-sm font-extrabold opacity-70 hover:opacity-100 px-2 py-1">ปิด</button>
          </div>
        </div>
      )}

      {/* CORE WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* SHORT CONCISE MENUS */}
        <div className="flex border-b-2 border-slate-200 overflow-x-auto pb-2.5 mb-6 scrollbar-hide space-x-2 bg-white p-2.5 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab('daily-record')}
            className={`py-3 px-5 sm:px-6 font-extrabold text-sm sm:text-base md:text-lg rounded-xl transition-all whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'daily-record' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            📝 บันทึกประจำวัน
          </button>
          <button
            onClick={() => setActiveTab('lots')}
            className={`py-3 px-5 sm:px-6 font-extrabold text-sm sm:text-base md:text-lg rounded-xl transition-all whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'lots' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            📋 จัดการล็อต
          </button>
          <button
            onClick={() => setActiveTab('ai-report')}
            className={`py-3 px-5 sm:px-6 font-extrabold text-sm sm:text-base md:text-lg rounded-xl transition-all whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'ai-report' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            📸 ส่งรายงาน AI
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-5 sm:px-6 font-extrabold text-sm sm:text-base md:text-lg rounded-xl transition-all whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            📊 แผงสรุปผล
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-5 sm:px-6 font-extrabold text-sm sm:text-base md:text-lg rounded-xl transition-all whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'guide' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            💡 คู่มือพืช
          </button>
        </div>

        {/* =======================================================
            TAB 1: DAILY RECORD (หน้าบันทึกประจำวันรายรางปลูก)
            ======================================================= */}
        {activeTab === 'daily-record' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            
            {/* Input Form Block */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm lg:col-span-12 space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800">📝 ตรวจวัดค่าน้ำ & บันทึกเคมีรายรางปลูก</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                  กรอกค่าน้ำปุ๋ย ค่ากรด-ด่าง และถ่ายภาพพืชเพื่อสังเกตโรค โดยระบบมีอ่างน้ำปุ๋ยแยกตามสเปกความจุมิลลิลิตรรายราง
                </p>
              </div>

              <form onSubmit={handleSaveDailyLog} className="space-y-4">
                
                {/* Select Rail */}
                <div className="space-y-2">
                  <label className="font-extrabold text-slate-700 block text-sm sm:text-base">เลือกระบบรางปลูกที่กำลังตรวจวัด</label>
                  <select
                    value={selectedRailForLog}
                    onChange={(e) => setSelectedRailForLog(e.target.value)}
                    className="w-full text-sm sm:text-base rounded-xl border-2 border-slate-200 p-3 focus:outline-none focus:border-emerald-500 bg-white font-bold text-slate-800"
                  >
                    {RAILS.map(rail => (
                      <option key={rail.id} value={rail.id}>
                        {rail.name} (ขนาดอ่าง: {rail.capacity} ลิตร)
                      </option>
                    ))}
                  </select>
                </div>

                {/* GPS Coordinator */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-extrabold text-slate-700 block text-xs sm:text-sm">📍 บันทึกพิกัดจริงเพื่อประมวลผลสภาพแสงในแปลง</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleGetGps}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex-grow"
                    >
                      {fetchingGps ? '🌀 ระบบกำลังอ่านดาวเทียม...' : '📡 เรียกดึงพิกัด GPS อุปกรณ์ในแปลง'}
                    </button>
                    {currentGps && (
                      <button
                        type="button"
                        onClick={() => setCurrentGps('')}
                        className="text-xs text-rose-600 hover:underline font-bold px-2 py-1"
                      >
                        ล้างพิกัด
                      </button>
                    )}
                  </div>
                  {currentGps ? (
                    <div className="text-xs sm:text-sm font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-bold leading-relaxed">
                      ✓ พร้อมบันทึกพิกัดตำแหน่งจริง: <span className="text-slate-900 bg-white px-2 py-0.5 rounded border">{currentGps}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">ยังไม่มีการบันทึกพิกัด (กรุณากดดึงค่าเพื่อเก็บพิกัดสภาพความร้อนในพื้นที่)</p>
                  )}
                </div>

                {/* Parameter Values Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block text-xs sm:text-sm">ค่า pH (กรด-ด่างน้ำ)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={logPH}
                      onChange={(e) => setLogPH(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-200 p-3 font-mono font-bold text-base sm:text-lg focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-slate-400">ปกติ: 5.5 - 6.5</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block text-xs sm:text-sm">ค่าสารปุ๋ย EC (mS/cm)</label>
                    <input
                      type="number"
                      step="0.05"
                      required
                      value={logEC}
                      onChange={(e) => setLogEC(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-200 p-3 font-mono font-bold text-base sm:text-lg focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-slate-400">ปกติ: 1.2 - 1.8</span>
                  </div>
                </div>

                {/* Water Temp and Water Level */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block text-xs sm:text-sm">อุณหภูมิน้ำเลี้ยง (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={logWaterTemp}
                      onChange={(e) => setLogWaterTemp(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-200 p-3 font-mono font-bold text-base sm:text-lg focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-rose-500 font-bold">ระวัง: อุณหภูมิพืชสลัด &gt; 28°C</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block text-xs sm:text-sm">ระดับปริมาณน้ำอ่างสารอาหาร (%)</label>
                    <input
                      type="number"
                      required
                      value={logWaterLevel}
                      onChange={(e) => setLogWaterLevel(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-200 p-3 font-mono font-bold text-base sm:text-lg focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-slate-500 block font-semibold">
                      ปริมาตรคงเหลือ: ประมาณ {((RAILS.find(r => r.id === selectedRailForLog)?.capacity || 140) * Number(logWaterLevel) / 100).toFixed(1)} ลิตร
                    </span>
                  </div>
                </div>

                {/* CHEMICAL ADDITIONS DROP-DOWN SECTION */}
                <div className="p-1 bg-amber-50/70 border border-amber-200 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setShowChemicalAdditions(!showChemicalAdditions)}
                    className="w-full flex justify-between items-center px-4 py-3 text-amber-950 font-bold text-xs sm:text-sm hover:bg-amber-100/50 rounded-xl transition-all"
                  >
                    <span>➕ บันทึกข้อมูลการเติมเคมีและปรับปรุงน้ำ (ปุ๋ย, ปรับ pH, น้ำเติม)</span>
                    <span className="text-lg font-mono">{showChemicalAdditions ? '▲' : '▼'}</span>
                  </button>

                  {showChemicalAdditions && (
                    <div className="p-4 pt-1 grid grid-cols-2 gap-3 bg-white rounded-xl border border-amber-100 m-1.5 text-xs animate-in slide-in-from-top duration-150">
                      
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">เติมปุ๋ยน้ำ A+B (มล.)</label>
                        <input
                          type="number"
                          value={addedAB}
                          onChange={(e) => setAddedAB(e.target.value)}
                          className="w-full rounded-lg border p-2 font-mono text-center font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">เติมน้ำสะอาดเพิ่ม (ลิตร)</label>
                        <input
                          type="number"
                          value={addedWaterVolume}
                          onChange={(e) => setAddedWaterVolume(e.target.value)}
                          className="w-full rounded-lg border p-2 font-mono text-center font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-rose-855">เติม pH DOWN (มล.)</label>
                        <input
                          type="number"
                          value={addedPhDown}
                          onChange={(e) => setAddedPhDown(e.target.value)}
                          className="w-full rounded-lg border p-2 font-mono text-center font-bold text-rose-700"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-emerald-855">เติม pH UP (มล.)</label>
                        <input
                          type="number"
                          value={addedPhUp}
                          onChange={(e) => setAddedPhUp(e.target.value)}
                          className="w-full rounded-lg border p-2 font-mono text-center font-bold text-emerald-700"
                        />
                      </div>

                      {/* NEW POST ADDITION PARAMETERS FIELDS */}
                      <div className="col-span-2 border-t pt-2 mt-2">
                        <p className="font-extrabold text-amber-950 mb-1">🔍 บันทึกค่าวัดสารละลายที่เปลี่ยนไปหลังเติม:</p>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-indigo-955">ค่า pH ใหม่หลังเติม</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="เช่น 6.0"
                          value={afterPh}
                          onChange={(e) => setAfterPh(e.target.value)}
                          className="w-full rounded-lg border p-2 font-mono text-center font-bold text-indigo-900 bg-indigo-50/50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-indigo-955">ค่า EC ใหม่หลังเติม (mS/cm)</label>
                        <input
                          type="number"
                          step="0.05"
                          placeholder="เช่น 1.50"
                          value={afterEc}
                          onChange={(e) => setAfterEc(e.target.value)}
                          className="w-full rounded-lg border p-2 font-mono text-center font-bold text-indigo-900 bg-indigo-50/50"
                        />
                      </div>

                    </div>
                  )}
                </div>

                {/* Weather Select */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 block text-xs sm:text-sm">สภาพอากาศช่วงที่วัดน้ำ</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[['sunny', '☀️ แดดจัด'], ['cloudy', '☁️ ครึ้ม'], ['rainy', '🌧️ ฝนตก'], ['hot', '🔥 ร้อนจัด']].map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setLogWeather(val)}
                        className={`p-2 rounded-lg text-xs sm:text-sm font-bold border-2 transition-all ${
                          logWeather === val ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DAILY DISEASE PHOTOS */}
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-2">
                  <span className="font-extrabold text-sky-950 block text-xs sm:text-sm">🦠 รูปถ่ายใบพืชประจำวัน (เพื่อสังเกตสัญญาณใบเหลืองไหม้ หรือโรคพืช)</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <label className="bg-sky-700 hover:bg-sky-800 text-white font-extrabold text-xs sm:text-sm py-2.5 rounded-xl text-center cursor-pointer transition shadow-sm block">
                      📷 เปิดกล้องถ่ายภาพใบพืช
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleUploadDailyPhoto('camera', e)}
                        className="hidden"
                      />
                    </label>

                    <label className="bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 font-extrabold text-xs sm:text-sm py-2.5 rounded-xl text-center cursor-pointer transition shadow-sm block">
                      📂 เรียกรูปจากคลังภาพ
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadDailyPhoto('gallery', e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {tempDailyPhotos.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-xs font-bold text-sky-900">รูปตรวจวิเคราะห์โรคที่เตรียมแนบ ({tempDailyPhotos.length} รูป):</p>
                      <div className="flex gap-2 overflow-x-auto py-1">
                        {tempDailyPhotos.map((img, i) => (
                          <div key={i} className="relative flex-shrink-0">
                            <img src={img} className="w-14 h-14 rounded-lg object-cover border-2 border-sky-300" />
                            <button
                              type="button"
                              onClick={() => setTempDailyPhotos(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes Input */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 block text-xs sm:text-sm">รายละเอียดความผิดปกติที่พบบนแปลง</label>
                  <textarea
                    rows="2"
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="เช่น พบปัญหาใบซีดเหลืองเล็กน้อยบริเวณท้ายราง หรือพบเชื้อรา..."
                    className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:outline-none focus:border-emerald-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 rounded-xl shadow-md text-base sm:text-lg transition-all"
                >
                  💾 บันทึกค่าควบคุมน้ำประจำราง
                </button>

              </form>
            </div>

            {/* Quick Tips Box */}
            <div className="bg-amber-50 p-5 sm:p-7 rounded-3xl border border-amber-200 lg:col-span-12 space-y-4">
              <h3 className="text-lg font-bold text-amber-950 flex items-center gap-1.5">💡 แนวทางปฏิบัติประจำวัน</h3>
              <p className="text-sm text-amber-900 leading-relaxed">
                การวัดคุณภาพน้ำในระบบไฮโดรโปนิกส์ควรทำในช่วง **08:00 - 10:00 น.** ของทุกวัน เนื่องจากเป็นช่วงเวลาสำคัญที่ผักกำลังเริ่มคายน้ำและตอบสนองกับสารอาหาร หากพบค่าสารอาหาร EC ต่ำกว่าที่ผักแต่ละวัยต้องการ ให้ทำการเติมแม่ปุ๋ย A และ B ในอัตราส่วนที่เท่ากันในถังพักหลักทันที
              </p>
              <div className="bg-white p-4 rounded-2xl border border-amber-100 space-y-2 text-xs sm:text-sm">
                <p className="font-bold text-emerald-950">📐 อัตราปุ๋ยมาตรฐานตามประเภทราง:</p>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>รางอนุบาล 1 (ราง 1 & 2):</strong> ค่า EC ปานกลาง 0.8 - 1.2 mS/cm</li>
                  <li><strong>ราง NFT (รางคู่ & 8 เมตร):</strong> ค่า EC เข้มข้น 1.4 - 1.8 mS/cm</li>
                  <li><strong>ความเป็นกรดด่าง (pH):</strong> รักษาในช่วง 5.8 - 6.2 เพื่อไม่ให้รากพืชปิดกั้นการดูดซึมธาตุอาหาร</li>
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* =======================================================
            TAB 2: LOTS (จัดการล็อตปลูก)
            ======================================================= */}
        {activeTab === 'lots' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800">📋 จัดการล็อตพืชที่กำลังดำเนินการ (Active Lots)</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  ลงทะเบียนล็อต เริ่มเพาะเมล็ด อัปเดตความก้าวหน้าทั้ง 5 ขั้นตอน บันทึกพิกัดรูปแปลง และคัดทิ้งทั้งล็อตที่มีปัญหา
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full lg:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>🌱 + เพาะเมล็ดล็อตใหม่</span>
              </button>
            </div>

            {/* List of Active Lots */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeLots.map(lot => {
                const currentRailObj = RAILS.find(r => r.id === lot.railId);
                
                return (
                  <div key={lot.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
                    
                    {/* Lot Header */}
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg">ลำดับล็อตที่ #{lot.sequence}</span>
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 mt-1.5">{lot.name}</h4>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 ml-1">
                          {lot.stage === 'tissue' ? '1. เพาะในทิชชู่' :
                           lot.stage === 'sponge' ? '2. ลงโฟมเพาะ' :
                           lot.stage === 'nursery' ? '3. รางอนุบาล 1' :
                           lot.stage === 'nft' ? '4. ราง NFT' : '5. เก็บเกี่ยวแล้ว'}
                        </span>
                      </div>
                      
                      {/* Vegetables contained list */}
                      <div className="mt-3 space-y-1">
                        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">🌱 สายพันธุ์ที่เพาะผสม:</p>
                        <div className="flex flex-wrap gap-1">
                          {lot.vegetables?.map((veg, idx) => {
                            const staticObj = VEGETABLE_TYPES.find(v => v.id === veg.id);
                            return (
                              <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-lg px-2 py-0.5 text-xs font-bold">
                                {staticObj?.name.split(' ')[0] || veg.id} ({veg.qty} เมล็ด)
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Lot Content */}
                    <div className="p-5 space-y-4 flex-grow text-xs sm:text-sm text-slate-700">
                      
                      {/* Yield Numbers */}
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 grid grid-cols-2 gap-2 text-center">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">เริ่มเพาะ</p>
                          <p className="text-sm sm:text-base font-extrabold text-slate-800">{lot.sowedQty} ต้น</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase">เหลือรอดจริง</p>
                          <p className="text-sm sm:text-base font-extrabold text-emerald-700">{lot.currentQty} ต้น</p>
                        </div>
                      </div>

                      {/* Rail assignment details */}
                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border">
                        <p className="font-bold text-[11px] text-slate-500">📍 ข้อมูลการติดตั้งบนรางปลูก:</p>
                        <p className="text-slate-800 font-extrabold text-xs sm:text-sm">
                          {currentRailObj ? `✓ ${currentRailObj.name}` : 'ยังไม่ได้ลงรางปลูก (อยู่ในช่วงเตรียมเพาะ)'}
                        </p>
                        {lot.cupColor && (
                          <div className="flex items-center space-x-1.5 mt-1">
                            <span className="text-[11px] text-slate-400">สีถ้วยปลูก:</span>
                            <span className="bg-white border text-xs font-extrabold px-2 py-0.5 rounded-lg text-slate-700">{lot.cupColor}</span>
                          </div>
                        )}
                      </div>

                      {/* PHYSICAL LOCATION PHOTOS */}
                      <div className="border-t border-slate-150 pt-3">
                        <p className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase">📸 รูปถ่ายตำแหน่งแปลง/แผนที่ตั้งของล็อต ({lot.locationPhotos?.length || 0}):</p>
                        
                        {lot.locationPhotos && lot.locationPhotos.length > 0 ? (
                          <div className="flex gap-2 overflow-x-auto pb-1.5">
                            {lot.locationPhotos.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                className="w-14 h-14 rounded-lg object-cover border shadow-sm flex-shrink-0"
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">ยังไม่ได้ลงทะเบียนภาพผังตำแหน่งแปลงทางกายภาพ</p>
                        )}

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-1.5 rounded-lg text-center cursor-pointer transition">
                            📷 กล้องมือถือ
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => handleUploadLocationPhoto(lot.id, 'camera', e)}
                              className="hidden"
                            />
                          </label>
                          <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-1.5 rounded-lg text-center cursor-pointer transition border border-slate-250">
                            📂 คลังภาพ
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUploadLocationPhoto(lot.id, 'gallery', e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                    </div>

                    {/* Lot Actions Footer */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
                      
                      {/* Edit / Delete Buttons */}
                      <div className="flex gap-2 justify-between">
                        <button
                          onClick={() => handleOpenEdit(lot)}
                          className="bg-sky-50 hover:bg-sky-105 border border-sky-300 text-sky-800 font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
                        >
                          ✏️ แก้ไขข้อมูล
                        </button>
                        <button
                          onClick={() => handleDeleteLot(lot.id)}
                          className="bg-rose-50 hover:bg-rose-105 border border-rose-200 text-rose-700 font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
                        >
                          🗑️ ลบล็อตนี้
                        </button>
                      </div>

                      {/* Transition Flow actions */}
                      <div className="border-t border-slate-200 pt-2 flex flex-col gap-1.5">
                        {lot.stage === 'tissue' && (
                          <button
                            onClick={() => openTransitionModal(lot, 'sponge')}
                            className="w-full bg-sky-700 hover:bg-sky-800 text-white font-extrabold py-2 rounded-xl text-xs transition shadow-sm"
                          >
                            🚀 ขั้น 2: ย้ายลงโฟมเพาะ
                          </button>
                        )}
                        {lot.stage === 'sponge' && (
                          <button
                            onClick={() => openTransitionModal(lot, 'nursery')}
                            className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold py-2 rounded-xl text-xs transition shadow-sm"
                          >
                            🚀 ขั้น 3: ย้ายลงรางอนุบาล 1
                          </button>
                        )}
                        {lot.stage === 'nursery' && (
                          <button
                            onClick={() => openTransitionModal(lot, 'nft')}
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-2 rounded-xl text-xs transition shadow-sm"
                          >
                            🚀 ขั้น 4: ย้ายลงราง NFT หลัก
                          </button>
                        )}
                        {lot.stage === 'nft' && (
                          <button
                            onClick={() => openTransitionModal(lot, 'harvested')}
                            className="w-full bg-violet-700 hover:bg-violet-800 text-white font-extrabold py-2 rounded-xl text-xs transition shadow-sm"
                          >
                            🚀 ขั้น 5: ย้ายลงเก็บเกี่ยว / ขาย
                          </button>
                        )}
                      </div>

                      {/* Cull Entire Lot button */}
                      <button
                        onClick={() => handleCullEntireLot(lot.id)}
                        className="w-full text-center bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-extrabold py-2 rounded-xl text-xs sm:text-sm transition shadow-sm block mt-1"
                      >
                        🍂 คัดทิ้งทั้งหมด (คัดออกถาวร)
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* =======================================================
            TAB 3: AI REPORT (ส่งรายงานวิเคราะห์ AI)
            ======================================================= */}
        {activeTab === 'ai-report' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm lg:col-span-5 space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">1. เลือกล็อตปลูกและพารามิเตอร์ส่งวิเคราะห์</h3>
                  <p className="text-xs text-slate-500">
                    ดึงประวัติล็อต และรูปถ่ายเพื่อแนบประกอบเข้าคุยในแชท AI
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="font-extrabold text-slate-700 block text-xs sm:text-sm">ระบุล็อตพืชที่ต้องการส่งออก:</label>
                  <select
                    value={selectedLotForAI}
                    onChange={(e) => setSelectedLotForAI(e.target.value)}
                    className="w-full text-sm sm:text-base rounded-xl border border-slate-300 p-3 bg-white font-bold text-slate-700"
                  >
                    <option value="">-- เลือกล็อตปลูก --</option>
                    {lots.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.stage})</option>
                    ))}
                  </select>
                </div>

                {selectedLotForAI && (
                  <div className="p-4 bg-slate-50 rounded-2xl border space-y-4 text-xs sm:text-sm">
                    
                    {/* Copy All images link widget */}
                    <div>
                      <h4 className="font-bold text-slate-700 mb-2">📸 คัดลอกรูปภาพทั้งหมดของล็อตนี้:</h4>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            const selectedLot = lots.find(l => l.id === selectedLotForAI);
                            const relatedDailyLogs = dailyLogs.filter(log => log.railId === selectedLot?.railId);
                            const allImages = [
                              ...(selectedLot?.locationPhotos || []),
                              ...relatedDailyLogs.flatMap(log => log.dailyPhotos || [])
                            ];

                            if (allImages.length === 0) {
                              triggerAlert('warning', 'ไม่มีรูปภาพของล็อตนี้ให้คัดลอก');
                              return;
                            }

                            const textWithImages = `[รูปภาพทั้งหมดของล็อตปลูก ${selectedLot?.name}]\n` +
                              allImages.map((img, index) => `รูปที่ ${index + 1}: ${img.substring(0, 150)}... [ภาพข้อมูลเข้ารหัส]`).join('\n');

                            const textArea = document.createElement("textarea");
                            textArea.value = textWithImages;
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                            
                            triggerAlert('success', `📋 คัดลอกรูปถ่ายทั้งหมดจำนวน ${allImages.length} รายการลงคลิปบอร์ดแล้ว คุณสามารถแนบวางส่งเข้าช่องแชท AI เพื่อประมวลผลทันที`);
                          }}
                          className="bg-sky-700 hover:bg-sky-800 text-white font-extrabold py-2 px-3 rounded-lg text-xs transition"
                        >
                          🔗 คัดลอกรูปภาพและข้อมูลแผนผังทั้งหมด
                        </button>
                        <p className="text-[10px] text-slate-400 font-medium">ระบบจะคัดลอกรูปภาพทั้งหมดเพื่อนำไปใช้วางในแชท AI ได้ง่ายขึ้น</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-500 block mb-1">🗺️ รูปถ่ายพิกัดแปลง/ตำแหน่งของล็อต:</span>
                      {lots.find(l => l.id === selectedLotForAI)?.locationPhotos?.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {lots.find(l => l.id === selectedLotForAI).locationPhotos.map((img, i) => (
                            <img key={i} src={img} className="w-full aspect-square object-cover rounded-lg border" />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">ไม่มีรูปภาพสถานที่ตั้งในขณะนี้</p>
                      )}
                    </div>

                    <div>
                      <span className="font-bold text-slate-500 block mb-1">🦠 รูปถ่ายใบพืชสำหรับตรวจโรครายวัน (จากรางที่เกี่ยวข้อง):</span>
                      {dailyLogs.filter(log => log.railId === lots.find(l => l.id === selectedLotForAI)?.railId && log.dailyPhotos?.length > 0).length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {dailyLogs.filter(log => log.railId === lots.find(l => l.id === selectedLotForAI)?.railId).flatMap(log => log.dailyPhotos).map((img, i) => (
                            <img key={i} src={img} className="w-full aspect-square object-cover rounded-lg border border-sky-300" />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">ยังไม่มีบันทึกรูปภาพใบพืชหรือจุดผิดปกติของล็อตพืชนี้</p>
                      )}
                    </div>

                  </div>
                )}

              </div>

              {/* Structured text exporter */}
              <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm lg:col-span-7 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-150 pb-3 flex-wrap gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">📋 ชุดรายงาน สำหรับวางใน ChatGPT / Gemini</h3>
                  <button
                    onClick={copyToClipboard}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-all"
                  >
                    {copiedPrompt ? '✓ คัดลอกรายงานแล้ว!' : '📋 คัดลอกข้อความรายงาน'}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  กดคัดลอกข้อมูลพารามิเตอร์ด้านล่างนี้ และคัดลอกรูปถ่ายในกล่องข้อความ นำไปกดส่งให้ AI ภายนอกทำการตรวจสภาพน้ำ ค่ากรดด่าง และระดับสารอาหารที่ผักแต่ละตัวกำลังเผชิญอยู่ เพื่อรับคำแนะนำการรักษาโดยไม่เสียโควตาโทเค็นส่วนตัวใด ๆ ของคุณ
                </p>

                <textarea
                  readOnly
                  rows="12"
                  value={aiReportText}
                  className="w-full rounded-2xl border-2 border-slate-150 p-4 bg-slate-50 text-xs sm:text-sm font-mono leading-relaxed text-slate-650 focus:outline-none"
                ></textarea>
              </div>

            </div>

          </div>
        )}

        {/* =======================================================
            TAB 4: DASHBOARD (ภาพรวมฟาร์ม / แผงสรุปผล)
            ======================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-extrabold">ล็อตเพาะเลี้ยงที่ยังดำเนินงาน</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">{activeLots.length} ล็อต</p>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">จากประวัติเพาะสะสมทั้งหมด {lots.length} ล็อต</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-2xl font-bold">🥬</div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-extrabold">สรุปปริมาณสลัดมีชีวิตทั้งหมด</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">{totalActivePlants} ต้น</p>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">ปลูกและเพาะเลี้ยงตามสัดส่วนราง</p>
                </div>
                <div className="bg-sky-50 text-sky-700 p-4 rounded-2xl text-2xl font-bold">💧</div>
              </div>

              {/* Doughnut Pie Chart Card for stage distribution */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-extrabold text-center lg:text-left">อัตราส่วนพืชตามขั้นตอนปลูกจริง (%)</p>
                
                {totalActivePlants === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">ยังไม่มีพืชที่กำลังดำเนินการปลูกเพื่อคำนวณสัดส่วน</p>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-around w-full">
                    
                    {/* SVG Doughnut Circle */}
                    <div className="relative w-28 h-28 flex-shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {/* Background track circle */}
                        <circle cx="50" cy="50" r={svgRadius} fill="transparent" stroke="#F1F5F9" strokeWidth="8" />
                        
                        {doughnutSegments.map((seg, i) => {
                          if (seg.data.percent === 0) return null;
                          return (
                            <circle
                              key={i}
                              cx="50"
                              cy="50"
                              r={svgRadius}
                              fill="transparent"
                              stroke={seg.color}
                              strokeWidth="8"
                              strokeDasharray={`${seg.strokeLength} ${svgCircumference}`}
                              strokeDashoffset={seg.strokeOffset}
                              strokeLinecap="round"
                            />
                          );
                        })}
                      </svg>
                      {/* Center total number */}
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">ทั้งหมด</span>
                        <span className="text-base font-extrabold text-slate-800 font-mono leading-tight">{totalActivePlants}</span>
                      </div>
                    </div>

                    {/* Chart Legends */}
                    <div className="flex-grow space-y-1 text-xs sm:text-sm">
                      {stageData.map((stage) => (
                        <div key={stage.key} className="flex items-center justify-between gap-4">
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }}></span>
                            <span className="font-semibold text-slate-650 truncate">{stage.name}:</span>
                          </div>
                          <span className="font-mono font-extrabold text-slate-800 shrink-0">
                            {stage.data.percent.toFixed(1)}% ({stage.data.count} ต้น)
                          </span>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* List Table of Lots in Dashboard */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-150">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">สรุปรายงานล็อตเพาะปลูกที่มีอยู่ทั้งหมด</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm sm:text-base">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5">ชื่อล็อต / ชนิดผัก</th>
                      <th className="py-3 px-5">วันที่เริ่มหยอดเพาะ</th>
                      <th className="py-3 px-5">สถานะ</th>
                      <th className="py-3 px-5">รางปลูก</th>
                      <th className="py-3 px-5">ยอดที่มีชีวิต</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700">
                    {lots.map(lot => {
                      const rObj = RAILS.find(r => r.id === lot.railId);
                      return (
                        <tr key={lot.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="py-4 px-5">
                            <p className="font-bold text-slate-900">{lot.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {lot.vegetables?.map((veg, i) => {
                                const stObj = VEGETABLE_TYPES.find(v => v.id === veg.id);
                                return (
                                  <span key={i} className="bg-slate-105 text-slate-700 rounded px-1.5 py-0.2 text-[11px] font-bold">
                                    {stObj?.name.split(' ')[0] || veg.id}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-4 px-5 font-mono">{lot.sowedDate}</td>
                          <td className="py-4 px-5">
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                              lot.stage === 'tissue' ? 'bg-amber-50 text-amber-800' :
                              lot.stage === 'sponge' ? 'bg-sky-50 text-sky-800' :
                              lot.stage === 'nursery' ? 'bg-indigo-50 text-indigo-800' :
                              lot.stage === 'nft' ? 'bg-emerald-50 text-emerald-800' :
                              lot.stage === 'culled' ? 'bg-rose-50 text-rose-800' :
                              'bg-violet-50 text-violet-800'
                            }`}>
                              {lot.stage === 'tissue' ? '1.เพาะทิชชู่' :
                               lot.stage === 'sponge' ? '2.ลงโฟมเพาะ' :
                               lot.stage === 'nursery' ? '3.รางอนุบาล 1' :
                               lot.stage === 'nft' ? '4.ราง NFT' :
                               lot.stage === 'culled' ? '🍂 คัดทิ้ง' : '📦 เก็บเกี่ยวแล้ว'}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-bold">{rObj ? rObj.name : '-'}</td>
                          <td className="py-4 px-5 font-bold text-slate-800 font-mono">{lot.currentQty} ต้น</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* =======================================================
                TREATMENT LOG HISTORY (ประวัติการบันทึกควบคุมย้อนหลัง)
                ======================================================= */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800">📊 ตารางประวัติการบันทึกควบคุมย้อนหลังประจำราง</h2>
                  <p className="text-xs sm:text-sm text-slate-500">ตรวจสอบสารอาหารน้ำ ความเป็นกรดด่าง และลบออกกรณีพิมพ์ค่าบันทึกผิดพลาด</p>
                </div>
              </div>

              {/* SEARCH & FILTERS IN HISTORICAL LOGS */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm font-semibold">
                
                {/* Rail selection filter */}
                <div className="space-y-1">
                  <span className="font-extrabold text-slate-700">🔍 ค้นหาคัดกรองเฉพาะรางปลูก:</span>
                  <select
                    value={searchRailId}
                    onChange={(e) => setSearchRailId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:outline-none bg-white font-bold text-slate-700"
                  >
                    <option value="">-- แสดงบันทึก "ทุกรางปลูกทั้งหมด" --</option>
                    {RAILS.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Lot text search filter */}
                <div className="space-y-1">
                  <span className="font-extrabold text-slate-700">🔍 ค้นหาคำสำคัญของล็อตปลูกที่เกี่ยวข้อง:</span>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="เช่น กรีนโอ๊ค, บัตเตอร์เฮด, #3 ..."
                      value={searchLotInHistory}
                      onChange={(e) => setSearchLotInHistory(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 pr-8 focus:outline-none font-bold"
                    />
                    {searchLotInHistory && (
                      <button
                        onClick={() => setSearchLotInHistory('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 font-extrabold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {filteredDailyLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <span className="text-5xl">🗒️</span>
                  <p className="text-sm">ไม่พบประวัติค่าน้ำตามช่องรางที่กรองค้นหา</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {filteredDailyLogs.map((log) => {
                    const rail = RAILS.find(r => r.id === log.railId);

                    return (
                      <div key={log.id} className="p-4 rounded-2xl border-2 border-slate-100 hover:bg-slate-50/50 transition-all space-y-3 text-sm">
                        <div className="flex justify-between items-start flex-wrap gap-2 text-sm">
                          <div>
                            <span className="font-extrabold text-slate-900 text-base">{rail ? rail.name : 'รางปลูกไม่ทราบรหัส'}</span>
                            <span className="bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-lg text-xs ml-2">📅 {log.date} | ⏰ {log.time} น.</span>
                          </div>
                          {/* DELETE BUTTON */}
                          <button
                            onClick={() => handleDeleteDailyLog(log.id)}
                            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs px-2.5 py-1 rounded-lg transition-all"
                          >
                            ลบประวัติ 🗑️
                          </button>
                        </div>

                        {/* Parameter Panels */}
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          
                          <div className="p-2 rounded-xl border bg-slate-50 border-slate-200 text-slate-700">
                            <p className="text-[10px] text-slate-400 font-bold font-extrabold">ค่า pH</p>
                            <p className="text-sm sm:text-base font-extrabold font-mono">{log.pH}</p>
                          </div>

                          <div className="p-2 rounded-xl border bg-slate-50 border-slate-200 text-slate-700">
                            <p className="text-[10px] text-slate-400 font-bold font-extrabold">EC (mS/cm)</p>
                            <p className="text-sm sm:text-base font-extrabold font-mono">{log.ec}</p>
                          </div>

                          <div className="p-2 rounded-xl border bg-slate-50 border-slate-200 text-slate-700">
                            <p className="text-[10px] text-slate-400 font-bold font-extrabold">อุณหภูมิน้ำ</p>
                            <p className="text-sm sm:text-base font-extrabold font-mono">{log.waterTemp}°C</p>
                          </div>

                          <div className="p-2 rounded-xl border bg-slate-50 border-slate-200 text-slate-700">
                            <p className="text-[10px] text-slate-400 font-bold font-extrabold">ระดับน้ำคงเหลือ</p>
                            <p className="text-xs sm:text-sm font-extrabold font-mono text-slate-800">
                              {log.waterLevel}% (~{((rail?.capacity || 140) * Number(log.waterLevel) / 100).toFixed(0)} ลิตร)
                            </p>
                          </div>

                        </div>

                        {/* Display Added Substances if recorded */}
                        {(log.addedAB > 0 || log.addedPhDown > 0 || log.addedPhUp > 0 || log.addedWaterVolume > 0) && (
                          <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/70 text-xs text-slate-700 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
                            <span className="font-bold text-amber-955">🧪 รายละเอียดการเติมเคมี/น้ำ:</span>
                            {log.addedAB > 0 && <span className="text-slate-600">ปุ๋ย AB: {log.addedAB} มล.</span>}
                            {log.addedWaterVolume > 0 && <span className="text-slate-600">เติมน้ำเพิ่ม: {log.addedWaterVolume} ลิตร</span>}
                            {log.addedPhDown > 0 && <span className="text-rose-700">pH DOWN: {log.addedPhDown} มล.</span>}
                            {log.addedPhUp > 0 && <span className="text-emerald-700">pH UP: {log.addedPhUp} มล.</span>}
                            
                            {/* Render after measurement inside history if present */}
                            {(log.afterPh || log.afterEc) && (
                              <div className="w-full border-t border-amber-150 pt-1 mt-1 flex gap-4 text-indigo-900 font-bold">
                                {log.afterPh && <span>✦ pH หลังปรับ: {log.afterPh}</span>}
                                {log.afterEc && <span>✦ EC หลังปรับ: {log.afterEc} mS/cm</span>}
                              </div>
                            )}
                          </div>
                        )}

                        {log.gps && (
                          <p className="text-xs text-slate-500 font-mono">📍 อุปกรณ์อ้างอิงพิกัด GPS: {log.gps}</p>
                        )}

                        {/* Disease tracking photo gallery */}
                        {log.dailyPhotos && log.dailyPhotos.length > 0 && (
                          <div className="bg-sky-50/50 p-2.5 rounded-xl border border-sky-100">
                            <p className="text-xs font-bold text-sky-850 mb-1">📸 รูปใบพืชตรวจวิเคราะห์ในบันทึกนี้:</p>
                            <div className="flex gap-2 overflow-x-auto py-1">
                              {log.dailyPhotos.map((photo, pIdx) => (
                                <img
                                  key={pIdx}
                                  src={photo}
                                  className="w-16 h-16 rounded-lg object-cover border shadow-sm flex-shrink-0"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {log.notes && (
                          <p className="text-xs sm:text-sm text-slate-600 bg-slate-100 p-2.5 rounded-xl italic leading-relaxed">
                            💬 <strong>รายงานสถานการณ์:</strong> {log.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        )}

        {/* =======================================================
            TAB 5: GUIDE (คู่มือปลูกผักสลัด & คลังข้อมูลโรคพืชและแมลง)
            ======================================================= */}
        {activeTab === 'guide' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* SEARCH BOX & GOOGLE SEARCH ACTION */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-1">💡 คู่มือการจัดการฟาร์มผัก & คลังข้อมูลโรคพืชและแมลง</h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                คลังความรู้ออฟไลน์ครบวงจรสำหรับการจัดการสารอาหารพารามิเตอร์น้ำ และระบบดูแลป้องกันโรคพืชไฮโดรโปนิกส์
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="🔍 พิมพ์คำค้นหาโรคพืช หรือศัตรูพืช... เช่น ไหม้, รากเน่า, เพลี้ย"
                  value={guideSearchQuery}
                  onChange={(e) => setGuideSearchQuery(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 p-3.5 focus:outline-none focus:border-emerald-500 font-bold"
                />
                
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleGoogleSearchInGuide}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm py-3 sm:py-0"
                  >
                    <span>🌐 ค้นบน Google</span>
                  </button>
                  {guideSearchQuery && (
                    <button
                      onClick={() => setGuideSearchQuery('')}
                      className="bg-slate-200 hover:bg-slate-300 px-4 rounded-xl text-slate-700 font-extrabold text-xs sm:text-sm"
                    >
                      ล้าง
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Stages 1-5 (Left Column) */}
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-emerald-900 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-150 inline-block">📘 ข้อมูลขั้นตอนปลูกมาตรฐานทั้ง 5 ระยะ</h3>

                {/* Tissue */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 hover:border-emerald-500 transition-all">
                  <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">1. เพาะเมล็ดในทิชชู่ (Tissue Sowing - 1 ถึง 3 วัน)</h4>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                    วางเมล็ดบนกระดาษชำระชื้นในภาชนะปิด ล่อรากขาวงอกฝอยแรกอย่างใกล้ชิดคุมความสะอาดสูงสุดเพื่อไม่ให้เกิดราปนเปื้อนในรุ่นพืช
                  </p>
                </div>

                {/* Sponge */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 hover:border-emerald-500 transition-all">
                  <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">2. ลงโฟมเพาะ (Sponge Sowing - 3 ถึง 12 วัน)</h4>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                    คีบเมล็ดที่รากฝอยเริ่มทำงานเสียบลงฟองน้ำแช่น้ำสะอาดในถาดพรม ยอดสลัดโผล่ใบเลี้ยงและเริ่มให้รับแดดอ่อนยามเช้าเพื่อให้พืชลำต้นแข็งแรงไม่ยืด
                  </p>
                </div>

                {/* Nursery */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 hover:border-emerald-500 transition-all">
                  <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">3. ลงรางอนุบาล 1 (Nursery Rail 1 - 12 ถึง 25 วัน)</h4>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                    ย้ายลงรางน้ำไหลหมุนเวียน ให้ระดับปุ๋ยอ่อน ๆ (EC 0.8 - 1.2 mS/cm) ยอดใบแผ่กว้างระบบรากเดินไวและเปลี่ยนสีเป็นขาวสว่างสมบูรณ์
                  </p>
                </div>

                {/* NFT */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 hover:border-emerald-500 transition-all">
                  <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">4. ลงราง NFT (NFT Rail - 25 ถึง 42 วัน)</h4>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                    ระยะย้ายสลัดลงรางท่อ NFT ขนาดความยาวหลัก 8 เมตรหรือรางคู่ เพิ่มค่า EC เพื่อเร่งโครงสร้างใบผักสลัด (1.4 - 1.8 mS/cm) หมั่นตรวจค่าน้ำและอุณหภูมิสารละลาย
                  </p>
                </div>

                {/* Harvest */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 hover:border-emerald-500 transition-all">
                  <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">5. เก็บเกี่ยว (Harvesting - 45 วันขึ้นไป)</h4>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                    เลี้ยงด้วยน้ำเปล่าบริสุทธิ์เพื่อเคลียร์สารตกค้างในยอดผัก 2 วันก่อนการตัดขาย บรรจุหีบห่อด้วยความเย็นที่เหมาะสมเพื่อคงความสดกรอบให้ผักสลัด
                  </p>
                </div>

              </div>

              {/* Diseases and treatment (Right Column) */}
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-rose-900 bg-rose-50 px-4 py-2 rounded-xl border border-rose-150 inline-block">⚠️ รายการโรคพืชและแนวทางแก้ไขที่สืบค้น</h3>

                <div className="space-y-3">
                  {filteredGuides.map((guide) => (
                    <div key={guide.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 border-l-4 border-l-rose-500">
                      <h4 className="font-bold text-rose-700 text-sm sm:text-base">{guide.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">{guide.desc}</p>
                      <div className="bg-rose-50/50 p-2.5 rounded-xl border text-xs space-y-1">
                        <p className="font-bold text-rose-955">🔍 อาการที่พบ:</p>
                        <p className="text-slate-650 font-medium">{guide.symptom}</p>
                        <p className="font-bold text-emerald-955 mt-1">🧪 วิธีแก้ไข & การบำรุงรักษา:</p>
                        <p className="text-slate-650 font-medium">{guide.treatment}</p>
                      </div>
                    </div>
                  ))}

                  {filteredGuides.length === 0 && (
                    <p className="text-xs text-slate-400 italic">ไม่พบข้อมูลหัวข้อตามคำสืบค้น กรุณาทดลองพิมพ์หาด้วยคำหลักอื่น ๆ หรือกดปุ่มค้นหาบน Google ด้านบน</p>
                  )}
                </div>

                {/* History list of searched guides (linkable and clearable) */}
                <div className="p-4 bg-slate-50 rounded-2xl border space-y-2 text-xs sm:text-sm font-semibold">
                  <h4 className="font-bold text-slate-700">📑 ล่าสุดในประวัติสืบค้นคลังของคุณ (คลิกเพื่อค้นหาซ้ำ):</h4>
                  <div className="divide-y divide-slate-200">
                    {viewedGuideHistory.map((hist, i) => (
                      <div
                        key={i}
                        onClick={() => handleHistorySearchClick(hist.title)}
                        className="py-2 flex justify-between items-center text-xs text-slate-600 font-medium hover:text-emerald-700 hover:bg-white px-2 rounded-lg cursor-pointer transition-all"
                      >
                        <span className="truncate">📖 {hist.title}</span>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="font-mono text-slate-400">{hist.date}</span>
                          <button
                            onClick={(e) => handleDeleteHistoryItem(e, i)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-1.5 rounded"
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-800 text-slate-300 py-10 border-t border-slate-900 mt-12 text-center text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 space-y-2 font-medium">
          <p>🌿 ระบบควบคุมและติดตามการปลูกผักอัจฉริยะ (Smart Hydroponics Monitor) 2026</p>
          <p className="text-slate-505">แอปพลิเคชันออกแบบพิเศษเพื่อระบบไฮโดรโปนิกส์ ควบคุมปริมาณน้ำ 120-140 ลิตร ในแต่ละแปลงย่อย</p>
        </div>
      </footer>

      {/* =======================================================
          MODAL 1: ADD NEW LOT (WITH MULTI-VEG SUPPORT)
          ======================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150 text-sm my-8">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">🌱 เริ่มเพาะเมล็ดล็อตใหม่</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 text-2xl font-bold px-1.5">×</button>
            </div>

            <form onSubmit={handleCreateLot} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">วันที่เริ่มหยอดเพาะเมล็ด</label>
                <input
                  type="date"
                  required
                  value={newLotSowedDate}
                  onChange={(e) => setNewLotSowedDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 font-mono font-bold"
                />
              </div>

              {/* Primary Vegetable */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <p className="font-extrabold text-slate-800">🥬 ชนิดผักหลักที่ลงปลูก:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={mainVegId}
                    onChange={(e) => setMainVegId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 bg-white font-bold text-slate-700 text-xs"
                  >
                    {VEGETABLE_TYPES.map(veg => (
                      <option key={veg.id} value={veg.id}>{veg.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="จำนวนเมล็ด"
                    value={mainVegQty}
                    onChange={(e) => setMainVegQty(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-center font-bold text-slate-700 text-xs"
                  />
                </div>
              </div>

              {/* COLLAPSIBLE MULTI-VEG PANEL */}
              <div className="p-1 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setShowMultiVeg(!showMultiVeg)}
                  className="w-full flex justify-between items-center px-3 py-2 text-emerald-950 font-bold text-xs hover:bg-emerald-100/50 rounded-xl transition-all"
                >
                  <span>🌿 ปลูกผสมหลายชนิดในล็อตเดียวกัน ({additionalVegs.length})</span>
                  <span className="text-sm font-mono font-bold">{showMultiVeg ? '▲' : '▼'}</span>
                </button>

                {showMultiVeg && (
                  <div className="p-3 pt-1 space-y-3 bg-white rounded-xl border border-emerald-100 m-1.5 text-xs animate-in slide-in-from-top duration-150">
                    
                    {additionalVegs.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center border-b pb-2 last:border-b-0">
                        <select
                          value={item.id}
                          onChange={(e) => handleUpdateAdditionalVeg(idx, 'id', e.target.value)}
                          className="flex-grow rounded-lg border p-1.5 bg-white"
                        >
                          {VEGETABLE_TYPES.map(veg => (
                            <option key={veg.id} value={veg.id}>{veg.name.split(' ')[0]}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.qty}
                          onChange={(e) => handleUpdateAdditionalVeg(idx, 'qty', Number(e.target.value))}
                          className="w-20 rounded-lg border p-1.5 text-center font-mono font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalVegLine(idx)}
                          className="bg-rose-50 text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg font-bold"
                        >
                          ลบ
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddAdditionalVegLine}
                      className="w-full py-1.5 border-2 border-dashed border-emerald-300 text-emerald-800 rounded-xl hover:bg-emerald-50 text-center font-bold"
                    >
                      + เพิ่มผักชนิดถัดไป
                    </button>

                  </div>
                )}
              </div>

              {/* Total seeds counter preview */}
              <div className="text-right text-xs font-extrabold text-emerald-800">
                🌱 ยอดเพาะเมล็ดรวมล็อตนี้: {Number(mainVegQty) + additionalVegs.reduce((sum, item) => sum + item.qty, 0)} ต้น
              </div>

              <div className="flex gap-2.5 pt-2 justify-end font-bold">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-650"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md"
                >
                  เริ่มลงทะเบียนเพาะ 🌱
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 2: DUAL-ACTION EDIT LOT (CURRENT VS REVERT STAGE)
          ======================================================= */}
      {editingLot && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150 text-sm my-8">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">✏️ จัดการแก้ไข / ย้อนข้อมูลแปลงปลูก</h3>
              <button onClick={() => setEditingLot(null)} className="text-slate-400 hover:text-slate-700 text-2xl font-bold px-1.5">×</button>
            </div>

            {/* TAB SELECTOR INSIDE EDIT MODAL */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl border text-xs sm:text-sm font-bold">
              <button
                type="button"
                onClick={() => setEditTab('current')}
                className={`flex-1 py-2 text-center rounded-lg transition ${
                  editTab === 'current' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                1. แก้ไขข้อมูลปัจจุบัน
              </button>
              <button
                type="button"
                onClick={() => setEditTab('stage')}
                className={`flex-1 py-2 text-center rounded-lg transition ${
                  editTab === 'stage' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-855'
                }`}
              >
                2. ย้อนสถานะการปลูก
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              
              {editTab === 'current' ? (
                /* TAB 1: General Info Edit */
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">แก้ไขชื่อรุ่นล็อต</label>
                    <input
                      type="text"
                      required
                      value={editLotName}
                      onChange={(e) => setEditLotName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-3 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">จำนวนต้นที่เหลือรอดล่าสุด (ต้น)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editLotQty}
                      onChange={(e) => setEditLotQty(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-3 font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">ระบุรางที่ล็อตตั้งอยู่</label>
                    <select
                      value={editLotRail}
                      onChange={(e) => setEditLotRail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-3 bg-white font-semibold text-slate-800"
                    >
                      <option value="">-- ยังไม่ได้ลงราง (เตรียมเพาะ) --</option>
                      {RAILS.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                /* TAB 2: Revert/Change Stage Flow */
                <div className="space-y-4">
                  <div className="p-3 bg-rose-50 border border-rose-150 rounded-2xl text-xs text-rose-900 font-semibold space-y-1">
                    <p className="font-bold">⚠️ ข้อแนะนำการย้อนกลับขั้นตอน:</p>
                    <p>การปรับย้อนขั้นตอนการเจริญเติบโตช่วยแก้ไขกรณีที่คุณกดย้ายระยะเร็วเกินไป ระบบจะปรับสถานะพร้อมรางปลูกให้สอดรับกัน</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">สลับย้อนขั้นตอนการเจริญเติบโตไปเป็น:</label>
                    <select
                      value={editLotStage}
                      onChange={(e) => setEditLotStage(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-3 bg-white font-bold text-slate-800"
                    >
                      <option value="tissue">1. เพาะทิชชู่ (เมล็ดแช่กระดาษ)</option>
                      <option value="sponge">2. ลงโฟมเพาะ (ฟองน้ำจุ่มถาด)</option>
                      <option value="nursery">3. รางอนุบาล 1</option>
                      <option value="nft">4. ราง NFT (ท่อหลัก)</option>
                      <option value="harvested">5. เก็บเกี่ยวพ้นรางปลูกแล้ว</option>
                      <option value="culled">🍂 ปลดยกเลิก / คัดทิ้งทั้งล็อต</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">สลับปรับเปลี่ยนสีถ้วยปลูก</label>
                    <select
                      value={editLotCupColor}
                      onChange={(e) => setEditLotCupColor(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-3 bg-white font-bold text-slate-700"
                    >
                      <option value="สีขาว">สีขาว (White Cup)</option>
                      <option value="สีส้ม">สีส้ม (Orange Cup)</option>
                      <option value="สีฟ้า">สีฟ้า (Blue Cup)</option>
                      <option value="สีชมพู">สีชมพู (Pink Cup)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-2.5 pt-2 justify-end font-bold">
                <button
                  type="button"
                  onClick={() => setEditingLot(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md"
                >
                  บันทึกการแก้ไข 💾
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 3: TRANSITION FLOW MODAL
          ======================================================= */}
      {activeTransitionLot && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150 text-xs sm:text-sm">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                🚀 สลับขั้นตอน: {activeTransitionLot.name}
              </h3>
              <button onClick={() => setActiveTransitionLot(null)} className="text-slate-400 hover:text-slate-700 text-2xl font-bold px-1.5">×</button>
            </div>

            <p className="text-xs text-slate-505 font-semibold">
              เตรียมสลับจากขั้นตอน <strong>{activeTransitionLot.stage}</strong> ไปยังขั้น <strong>{transitionStage}</strong>
            </p>

            <form onSubmit={handleTransitionSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">วันที่ทำรายการ</label>
                <input
                  type="date"
                  required
                  value={transitionForm.date}
                  onChange={(e) => setTransitionForm({ ...transitionForm, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-3 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">จำนวนที่เหลือรอดเข้าสู่ขั้นนี้ (ต้น)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={transitionForm.qty}
                  onChange={(e) => setTransitionForm({ ...transitionForm, qty: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 p-3 font-mono font-bold text-slate-700"
                />
              </div>

              {/* SPECIFIC TO RAIL SELECTIONS FOR ACTIVE STAGES */}
              {(transitionStage === 'nursery' || transitionStage === 'nft') && (
                <>
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">🎨 เลือกรางปลูกเพื่อติดตั้ง</label>
                    <select
                      value={transitionForm.railId}
                      onChange={(e) => setTransitionForm({ ...transitionForm, railId: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-3 bg-white font-bold"
                    >
                      {RAILS.map(r => (
                        <option key={r.id} value={r.id}>{r.name} (ขนาดอ่าง: {r.capacity} ลิตร)</option>
                      ))}
                    </select>
                  </div>

                  {/* CUP COLORS */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">🎨 เลือกสีถ้วยปลูกระบุแปลง</label>
                    <select
                      value={transitionForm.cupColor}
                      onChange={(e) => setTransitionForm({ ...transitionForm, cupColor: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-3 bg-white font-bold text-slate-700"
                    >
                      <option value="สีขาว">สีขาว (White Cup)</option>
                      <option value="สีส้ม">สีส้ม (Orange Cup)</option>
                      <option value="สีฟ้า">สีฟ้า (Blue Cup)</option>
                      <option value="สีชมพู">สีชมพู (Pink Cup)</option>
                    </select>
                  </div>
                </>
              )}

              {transitionStage === 'harvested' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">น้ำหนักผลผลิตเฉลี่ยต่อต้น (กรัม/หัว)</label>
                  <input
                    type="number"
                    required
                    value={transitionForm.averageWeight}
                    onChange={(e) => setTransitionForm({ ...transitionForm, averageWeight: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-3 font-mono font-bold"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">บันทึกช่วยจำเพิ่มเติม</label>
                <textarea
                  rows="2"
                  value={transitionForm.extraNotes}
                  onChange={(e) => setTransitionForm({ ...transitionForm, extraNotes: e.target.value })}
                  placeholder="เช่น รากขาวแน่นสมบูรณ์มาก สลัดไม่มีอาการใบเหลืองใด ๆ"
                  className="w-full rounded-xl border border-slate-300 p-3 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-2.5 pt-2 justify-end font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTransitionLot(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-650"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md"
                >
                  อัปเดตสลับขั้น 🚀
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 4: PREMIUM CUSTOM CONFIRM DIALOG (SUPER SAFE & ELEGANT)
          ======================================================= */}
      {customConfirm.isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-slate-150 space-y-4 animate-in zoom-in-95 duration-150 text-sm sm:text-base">
            
            <div className="flex items-center space-x-3 text-lg font-extrabold text-slate-900 border-b pb-2">
              <span className="text-2xl">
                {customConfirm.type === 'danger' ? '⚠️' : customConfirm.type === 'info' ? 'ℹ️' : '🔔'}
              </span>
              <span>{customConfirm.title}</span>
            </div>

            <p className="text-slate-600 leading-relaxed font-semibold">
              {customConfirm.message}
            </p>

            <div className="flex gap-2.5 pt-2 justify-end font-extrabold text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setCustomConfirm(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700"
              >
                {customConfirm.cancelText}
              </button>
              <button
                type="button"
                onClick={customConfirm.onConfirm}
                className={`px-5 py-2.5 text-white rounded-xl shadow-md ${
                  customConfirm.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' :
                  customConfirm.type === 'info' ? 'bg-sky-600 hover:bg-sky-700' :
                  'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {customConfirm.confirmText}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}# salad-wut
Daily report on the salad
