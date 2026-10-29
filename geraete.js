/* Cans Fitness App – Hersteller-Geräte (gym80, Technogym, Hammer Strength), FitX-Ausstattung und Studio-Vorlagen
   gym80: Bezeichnungen und Artikelnummern aus dem offiziellen gym80-Produktkatalog 2024
   (gym80 International GmbH) und gym80.de, Stand der Recherche: 29.10.2026.
   Jedes Gerät ist den allgemeinen Geräten der App zugeordnet (eq, mehrere mit "+").
   eq "" = Bewegungsablauf aus den Quellen nicht eindeutig, deshalb bewusst nicht zugeordnet.
   Keine Produktbilder oder 3D-Modelle von gym80 übernommen – nur Namen und Kategorien. */
(function (root) {
"use strict";
const G = [
 // --- SYGNUM (Steckgewicht) ---
 ["3001","BEINSTRECKER","SYGNUM","legext"],["3002","BEINBEUGER LIEGEND","SYGNUM","legcurl"],["3003","BEINBEUGER SITZEND","SYGNUM","legcurl_s"],
 ["3004","GLUTEUS KICK KNIEND","SYGNUM","glutem"],["3005","GLUTEUS KICK RADIAL","SYGNUM","glutem"],["3006","KICKMASCHINE","SYGNUM","glutem+abductst"],
 ["3007","RÜCKENSTRECKER","SYGNUM","backextm"],["3008","KLAPPSITZ","SYGNUM","absmach"],["3010","BIZEPSMASCHINE","SYGNUM","preacher"],
 ["3011","TRIZEPSMASCHINE","SYGNUM","trimach"],["3013","BEINBEUGER STEHEND","SYGNUM","legcurl_st"],["3014","BRUSTMASCHINE","SYGNUM","pecdeck"],
 ["3016","BRUSTPRESSE","SYGNUM","chestpress"],["3017","KLIMMZUG-BARRENMASCHINE","SYGNUM","assist"],["3018","WADENMASCHINE STEHEND","SYGNUM","calf"],
 ["3020","RÜCKENZUGMASCHINE","SYGNUM","latpull"],["3021","BUTTERFLY MIT PADS","SYGNUM","pecbent"],["3022","BUTTERFLY","SYGNUM","pecdeck"],
 ["3025","BUTTERFLY REVERSE","SYGNUM","revfly"],["3027","WADENPRESSE SITZEND","SYGNUM","calfpress"],["3028","ABDUKTIONSMASCHINE","SYGNUM","abductm"],
 ["3029","ADDUKTIONSMASCHINE","SYGNUM","adductm"],["3030","BEINPRESSE SITZEND","SYGNUM","legpress_s"],["3031","BEINPRESSE LIEGEND","SYGNUM","legpress_lying"],
 ["3032","SCHULTERPRESSE","SYGNUM","shoulderpress"],["3034","KLAPPSITZ LIEGEND","SYGNUM","abslying"],["3036","DIPMASCHINE","SYGNUM","dipmach"],
 ["3037","BAUCHMUSKELMASCHINE","SYGNUM","absmach"],["3038","RÜCKENSTRECKER","SYGNUM","backextm"],["3039","RUDERMASCHINE OHNE BRUSTPOLSTER","SYGNUM","cablerow"],
 ["3040","RUDERMASCHINE","SYGNUM","rowmachine"],["3047","ISO LAT","SYGNUM","latm"],["3050","SEITHEBEMASCHINE","SYGNUM","lateralm"],
 ["3069","STEHENDE ABDUKTION","SYGNUM","abductst"],["3071","UNTERARMMASCHINE","SYGNUM","forearmm"],["3094","DONKEY CALF RAISE","SYGNUM","donkeycalf"],
 ["3095","TRIZEPSMASCHINE ÜBERKOPF","SYGNUM","tricepsoh"],["3096","NACKENDRÜCKMASCHINE","SYGNUM","neckpress"],["3097","INNER CHEST PRESS","SYGNUM","innerchest"],
 ["3123","BEINSTRECKER LIEGEND MIT VERSTELL. RÜCKENLEHNE","SYGNUM","legext"],["3225","ROTATIONSMASCHINE","SYGNUM","torso"],["4416","BOOTYMIZER","SYGNUM","hipthrust"],
 ["5001","INNOVATION BEINPRESSE","SYGNUM","legpress_s"],["5002","INNOVATION GLUTEUSMASCHINE","SYGNUM","glutem"],["5003","INNOVATION RUDERMASCHINE","SYGNUM","rowmachine"],
 ["5006","INNOVATION MULTISTRECKMASCHINE","SYGNUM",""],
 ["5024","BRUSTPRESSE HYBRID","SYGNUM","chestpress"],["5027","BEINSTRECKER HYBRID","SYGNUM","legext"],["5028","BIZEPSMASCHINE HYBRID","SYGNUM","preacher"],
 // --- SYGNUM DUAL ---
 ["3041","BRUSTPRESSE DUAL","SYGNUM DUAL","chestpress"],["3042","SCHRÄGBANK DUAL","SYGNUM DUAL","inclinechest"],["3043","SCHULTERPRESSE DUAL","SYGNUM DUAL","shoulderpress"],
 ["3044","RÜCKENZUGMASCHINE DUAL","SYGNUM DUAL","latpull"],["3045","RUDERMASCHINE DUAL","SYGNUM DUAL","rowmachine"],["3046","BEINPRESSE DUAL","SYGNUM DUAL","legpress_dual"],
 ["4401","FTM DEADLIFT MASCHINE","SYGNUM DUAL","deadliftm"],["4402","FTM SCHULTER- UND BRUSTPRESSE","SYGNUM DUAL","shoulderpress+chestpress"],["4403","FTM ZUG- UND DRÜCKMASCHINE","SYGNUM DUAL",""],
 ["5004","INNOVATION CURLER MASCHINE","SYGNUM DUAL","preacher"],
 // --- SYGNUM CABLE ART ---
 ["5101","CABLE ART NR. 1 - SCHULTER UND RÜCKEN +","SYGNUM CABLE ART","cableadj"],["5102","CABLE ART NR. 2 - LATISSIMUS UND TRAPEZIUS +","SYGNUM CABLE ART","cableadj"],
 ["5103","CABLE ART NR. 3 - BRUST UND SCHULTER +","SYGNUM CABLE ART","cableadj"],["5104","CABLE ART NR. 4 - BIZEPS UND TRIZEPS +","SYGNUM CABLE ART","cableadj"],
 ["5105","CABLE ART NR. 5 - OBERKÖRPER","SYGNUM CABLE ART","cableadj"],["5106","CABLE ART NR. 6 - BEINE","SYGNUM CABLE ART","cableadj"],
 // --- SYGNUM STATIONS ---
 ["4004","KABELZUG CROSSOVER","SYGNUM STATIONS","cable2"],["4012","KABELZUG CROSSOVER VERSTELLBAR","SYGNUM STATIONS","cable2+cableadj"],["4016","RUDERSTATION","SYGNUM STATIONS","cablerow"],
 ["4032","BANDZUG 4-STATIONENTURM","SYGNUM STATIONS","cable+latpull+cablerow"],["4033","DUPLEXSTATION","SYGNUM STATIONS","cable2"],["4034","DUAL VERSTELLBARER SEILZUG","SYGNUM STATIONS","cable2+cableadj"],
 ["4036","MULTIDRÜCKSTATION","SYGNUM STATIONS","smith"],["4042","SEILZUG V-STATION","SYGNUM STATIONS","cable2"],["4044","5-STATIONENTURM","SYGNUM STATIONS","cable+latpull+cablerow"],
 ["4116","RÜCKENZUGSTATION","SYGNUM STATIONS","latpull"],["4117","5-STATIONENTURM","SYGNUM STATIONS","cable+latpull+cablerow"],["4125","SEILZUG EXPLOSIV","SYGNUM STATIONS","cableadj"],
 ["4134","SEILZUG UNIVERSAL","SYGNUM STATIONS","cableadj"],["4170","8-STATIONENTURM","SYGNUM STATIONS","cable+latpull+cablerow"],["4900","INCLINE ROW COMBO","SYGNUM STATIONS","rowmachine"],
 ["5201","MULTI-POWER STATION","SYGNUM STATIONS","smith"],["5242","MULTI-POWER STATION PRIVATEGYM","SYGNUM STATIONS","smith"],
 // --- SYGNUM COMBO ---
 ["5011","ABDUKTION UND ADDUKTION COMBO","SYGNUM COMBO","abduct"],["5012","BAUCH UND RÜCKEN COMBO","SYGNUM COMBO","absmach+backextm"],
 ["5013","BEINBEUGER UND BEINSTRECKER COMBO","SYGNUM COMBO","legext+legcurl_s"],["5014","BUTTERFLY UND BUTTERFLY REVERSE COMBO","SYGNUM COMBO","pecdeck+revfly"],
 ["5015","SCHULTER UND LATZUG COMBO","SYGNUM COMBO","shoulderpress+latpull"],
 // --- PURE KRAFT (Plate Loaded) ---
 ["4018","PURE KRAFT RUDERMASCHINE T-BAR","PURE KRAFT","tbarm"],["4023","PURE KRAFT 45 GRAD BEINPRESSE","PURE KRAFT","legpress"],["4026","PURE KRAFT WADENMASCHINE SITZEND","PURE KRAFT","calfseated"],
 ["4038N","PURE KRAFT KNIEBEUGEMASCHINE","PURE KRAFT","levsquat"],["4159N","PURE KRAFT HACKENSCHMIDT","PURE KRAFT","hack"],["4307","PURE KRAFT BAUCHMUSKELBANK LIEGEND","PURE KRAFT","abslying"],
 ["4311","PURE KRAFT RÜCKENZUGMASCHINE DUAL","PURE KRAFT","latm"],["4314","PURE KRAFT BEINPRESSE SITZEND DUAL","PURE KRAFT","legpress_dual"],["4317","PURE KRAFT BAUCHMUSKELMASCHINE AB SWING","PURE KRAFT","absmach"],
 ["4318","PURE KRAFT BODENHANTEL MULTI-GRIP","PURE KRAFT","bentrowm"],["4319","PURE KRAFT LOW ROW","PURE KRAFT","lowrow"],["4320","PURE KRAFT SCHULTERMASCHINE DUAL","PURE KRAFT","shoulderpress"],
 ["4321","PURE KRAFT GLUTEUS KICK MASCHINE","PURE KRAFT","glutem"],["4322","PURE KRAFT RUDERMASCHINE SITZEND DUAL","PURE KRAFT","rowmachine"],["4324","PURE KRAFT 45 GRAD PIVOT BEINPRESSE","PURE KRAFT","legpress"],
 ["4325","PURE KRAFT SEITHEBEMASCHINE DUAL","PURE KRAFT","lateralm"],["4326","PURE KRAFT BRUSTMASCHINE DUAL","PURE KRAFT","pecdeck"],["4327","PURE KRAFT POWER ROW DUAL","PURE KRAFT","rowmachine"],
 ["4328","PURE KRAFT BANKDRÜCKMASCHINE SITZEND DUAL","PURE KRAFT","chestpress"],["4331","PURE KRAFT DRÜCKBANK LIEGEND DUAL","PURE KRAFT","chestlying"],["4332","PURE KRAFT DEADLIFT DREHGRIFFE DUAL","PURE KRAFT","deadliftm"],
 ["4333","PURE KRAFT DEADLIFT DOPPELGRIFFE DUAL","PURE KRAFT","deadliftm"],["4335","PURE KRAFT TRIZEPS DIP MASCHINE DUAL","PURE KRAFT","dipmach"],["4336N","PURE KRAFT BEINSTRECKERMASCHINE","PURE KRAFT","legext"],
 ["4337N","PURE KRAFT BEINBEUGERMASCHINE","PURE KRAFT","legcurl"],["4338N","PURE KRAFT BIZEPSMASCHINE","PURE KRAFT","preacher"],["4339N","PURE KRAFT TRIZEPSMASCHINE","PURE KRAFT","trimach"],
 ["4340","PURE KRAFT HIGH ROW DUAL","PURE KRAFT","highrow"],["4341","PURE KRAFT BUTTERFLY DUAL","PURE KRAFT","pecdeck"],["4343","PURE KRAFT BAUCHMUSKELMASCHINE CRUNCH","PURE KRAFT","absmach"],
 ["4344","PURE KRAFT BUTTERFLY REVERSE DUAL","PURE KRAFT","revfly"],["4345","PURE KRAFT 55° WADENMASCHINE STEHEND","PURE KRAFT","calf"],["4346","PURE KRAFT NEGATIVDRÜCKBANK DUAL","PURE KRAFT","declinechest"],
 ["4348","PURE KRAFT TIBIALISMASCHINE SITZEND","PURE KRAFT","tibm"],["4350N","PURE KRAFT ÜBERZUGMASCHINE","PURE KRAFT","pulloverm"],["4352","PURE KRAFT BOOTY BOOSTER","PURE KRAFT","hipthrust"],
 ["4354","PURE KRAFT VERTIKALE BEINPRESSE","PURE KRAFT","legpressv"],["4355","PURE KRAFT BIZEPSMASCHINE DUAL","PURE KRAFT","preacher"],["4366","PURE KRAFT BIZEPS ÜBERKOPF","PURE KRAFT","bicepsoh"],
 ["4371","PURE KRAFT NACKENDRÜCKMASCHINE","PURE KRAFT","neckpress"],["4372","PURE KRAFT MULTIGELENK STEHEND","PURE KRAFT",""],["4373","PURE KRAFT BEINBEUGER STEHEND","PURE KRAFT","legcurl_st"],
 ["4374","PURE KRAFT STEHENDE ABDUKTION","PURE KRAFT","abductst"],["4375","PURE KRAFT INVERSE LEG CURL","PURE KRAFT","invlegcurl"],["4376","PURE KRAFT INNER CHEST LIEGEND DUAL","PURE KRAFT","innerchest"],
 ["4379","PURE KRAFT TRIZEPS ÜBERKOPF","PURE KRAFT","tricepsoh"],["4380","PURE KRAFT DONKEY CALF","PURE KRAFT","donkeycalf"],["4382","PURE KRAFT HIGH ROW MIT BEWEGLICHEN GRIFFEN","PURE KRAFT","highrow"],
 ["4383","PURE KRAFT 55 GRAD RUDERMASCHINE","PURE KRAFT","rowmachine"],["4384","PURE KRAFT ABDUKTION 3D","PURE KRAFT","abductm"],["4385","PURE KRAFT SEITHEBEMASCHINE STEHEND","PURE KRAFT","lateralm2"],
 ["4386N","PURE KRAFT BOOTY BOOSTER SPECIAL","PURE KRAFT","hipthrust"],["4388","PURE KRAFT VIKING PRESS","PURE KRAFT","viking"],["4389","PURE KRAFT LEVERAGE SQUAT","PURE KRAFT","levsquat"],
 ["4390","PURE KRAFT BUTTERFLY 50 GRAD","PURE KRAFT","pecdeck"],["4391","PURE KRAFT 3D LEG MACHINE","PURE KRAFT",""],["4392","PURE KRAFT BEINSTRECKER STEHEND","PURE KRAFT","legext"],
 // --- PURE KRAFT STRONG ---
 ["4361","PURE KRAFT-STRONG BEINPRESSE DUAL","PURE KRAFT STRONG","legpress_dual"],["4362","PURE KRAFT-STRONG NEGATIVDRÜCKBANK DUAL","PURE KRAFT STRONG","declinechest"],
 ["4363","PURE KRAFT-STRONG SCHULTERDRÜCKMASCHINE DUAL","PURE KRAFT STRONG","shoulderpress"],["4364","PURE KRAFT-STRONG DRÜCKBANK DUAL","PURE KRAFT STRONG","chestlying"],
 ["4365","PURE KRAFT-STRONG SCHRÄGBANK DUAL","PURE KRAFT STRONG","inclinechest"],
 // --- 80ATHLETICS ---
 ["3081","BARBELL ROTATION STATION","80ATHLETICS","landmine"],["4347","SISSY SQUAT","80ATHLETICS","sissym"],["4423","GLUTE BOOSTER RACK","80ATHLETICS","hipthrust"],
 ["4434","GLUTE HAM DEVELOPER","80ATHLETICS","ghd"],["5225","GEWICHTHEBEPLATTFORM","80ATHLETICS","rack"],["80A00001","HALF RACK","80ATHLETICS","rack"],
 ["80A00003","HALF RACK BACK2BACK","80ATHLETICS","rack"],["80A00005","POWER RACK","80ATHLETICS","rack"],["80A00006","POWER RACK COLLEGIATE","80ATHLETICS","rack"],
 ["80A00007","POWER RACK BACK2BACK","80ATHLETICS","rack"],["80A00009","VERSTELLBARE BRUSTPRESSE","80ATHLETICS","bench+incline"],["80A00010","HALF RACK PLATTFORM","80ATHLETICS","rack"],
 ["80A00011","POWER RACK PLATTFORM","80ATHLETICS","rack"],["80A00013","REVERSE HYPER EXTENSION MACHINE","80ATHLETICS","revhyper"],["80A00020","PERFORMANCE CROSSRIG 2","80ATHLETICS","rack+pullup"],
 ["80A00021","PERFORMANCE CROSSRIG 4","80ATHLETICS","rack+pullup"],["80A00022","PERFORMANCE CROSSRIG 6","80ATHLETICS","rack+pullup"],["80A00023","PERFORMANCE CROSSRIG 8","80ATHLETICS","rack+pullup"],
 ["80A00024","FUNCTIONAL PERFORMANCE HUB","80ATHLETICS",""],["80A00028","ROWING BENCH","80ATHLETICS","bench"],["80A00127","NARROW RACK UNIT","80ATHLETICS","rack"],
 ["80A00128","NARROW RACK EXTENSION","80ATHLETICS","rack"],["80A00130","NARROW RACK DOUBLE","80ATHLETICS","rack"],
 ["80A00101","DIPSTATION","80ATHLETICS ZUBEHÖR","dip"],["80A00109","BATTLE ROPE ANKERPUNKT","80ATHLETICS ZUBEHÖR","battlerope"],["80A00110","WALLBALLSTATION","80ATHLETICS ZUBEHÖR","medball"],
 ["80A00111","GERADE KLIMMZUGSTANGE FÜR CROSSRIG (KURZ)","80ATHLETICS ZUBEHÖR","pullup"],["80A00112","GERADE KLIMMZUGSTANGE FÜR CROSSRIG (LANG)","80ATHLETICS ZUBEHÖR","pullup"],
 ["80A00113","JAMMER ARMS","80ATHLETICS ZUBEHÖR","landmine"],["80A00117","SPLIT SQUAT-ROLLE","80ATHLETICS ZUBEHÖR","bench"],["80A00123","BATWING KLIMMZUGSTANGE","80ATHLETICS ZUBEHÖR","pullup"],
 ["80A00131","GERADE KLIMMZUGSTANGE FÜR RACKS","80ATHLETICS ZUBEHÖR","pullup"],["80A00132","ANKERPUNKT FÜR ELASTIKBÄNDER","80ATHLETICS ZUBEHÖR","bands"],
 ["80A00134","ANKERPUNKT FÜR SCHLINGENTRAINER","80ATHLETICS ZUBEHÖR","trx"],["80A00137","VORSTEHENDE KLIMMZUGSTANGE","80ATHLETICS ZUBEHÖR","pullup"],
 // --- IRON QUBES (Functional-Stationen) ---
 ["4445","IRONQUBE M","IRON QUBES",""],["4446","IRONQUBE L","IRON QUBES",""],["4447","IRONQUBE XL","IRON QUBES",""],["4448","IRONQUBE XXL","IRON QUBES",""],
 // --- Bänke ---
 ["4005","BASIC FLACHBANK","BÄNKE","bench"],["4007","NEGATIV BANK MIT DOPPELROLLE","BÄNKE","absbench"],["4010","BASIC UNIVERSALBANK","BÄNKE","bench+incline"],
 ["4011","BASIC UNIVERSALBANK MIT FUSSABLAGE","BÄNKE","bench+incline"],["4027","BASIC BAUCHMUSKELBANK","BÄNKE","absbench"],["4028","BASIC ROMAN CHAIR","BÄNKE","backext"],
 ["4096","BASIC SCHRÄGBANK","BÄNKE","incline+rack"],["4097","BASIC DRÜCKBANK","BÄNKE","bench+rack"],["4103","BASIC DRÜCKBANK VERSTELLBAR","BÄNKE","bench+incline+rack"],
 ["4107","NEGATIVBANK","BÄNKE","declinebench"],["4112","UNIVERSALBANK LEICHT","BÄNKE","bench+incline"],["4370","DUMBBELL ROW BENCH","BÄNKE","bench"],["4847","BASIC NEGATIVBANK","BÄNKE","declinebench"],
 // --- Basics ---
 ["4002","BASIC MULTIDRÜCKSTATION","BASICS","smith"],["4019","SCOTT CURLER STEHEND","BASICS","preacher"],["4021","BASIC BARREN","BASICS","dip"],
 ["4031","BASIC BEINHEBEGERÄT MIT KLIMMZUGSTANGE","BASICS","vkr+pullup"],["4040","BASIC MAX RACK","BASICS","rack"],["4046","BASIC BEINHEBEGERÄT","BASICS","vkr"],
 ["4093","BASIC SCOTT CURL SITZEND","BASICS","preacher"],["4094","BASIC SQUAT RACK","BASICS","rack"],["4119","BASIC 45-GRAD RÜCKENSTRECKER","BASICS","backext"],
 ["4156","MULTI RACK STATION MIT KLIMMZUG","BASICS","rack+pullup"],["4165","BASIC ROMAN CHAIR VERSTELLBAR","BASICS","backext"],["4922","BASIC STEP","BASICS","plyobox"],
 ["5221","HALF RACK","BASICS","rack"],["5226","HALF RACK / KNIEBEUGENSTÄNDER PLATTFORM","BASICS","rack"],["5233","HOMERACK","BASICS","rack"]
];
const GYM80 = G.map(([nr, name, series, eq]) => ({nr, name, series, eq: eq ? eq.split("+") : []}));

/* Technogym (laut FitX einer der Hersteller). Namen von technogym.com (Kategorien Selection 700, Selection 900,
   Plate Loaded / Pure Strength), abgerufen 29.10.2026. Die Selection-900-Seite hat „Mehr laden“ – evtl. nicht vollständig. */
const TG = [
 ["Selection 700","Selection 700 Vertical Traction","latm"],["Selection 700","Selection 700 Leg Press","legpress_s"],["Selection 700","Selection 700 Low Row","rowmachine"],
 ["Selection 700","Selection 700 Dual Leg Curl / Extension","legext+legcurl_s"],["Selection 700","Selection 700 Lat Machine","latpull"],["Selection 700","Selection 700 Dual Abductor / Adductor","abduct"],
 ["Selection 700","Selection 700 Chest Press","chestpress"],["Selection 700","Selection 700 Abdominal Crunch","absmach"],["Selection 700","Selection 700 Lower Back","backextm"],
 ["Selection 700","Selection 700 Leg Extension","legext"],["Selection 700","Selection 700 Leg Curl","legcurl_s"],["Selection 700","Selection 700 Shoulder Press","shoulderpress"],
 ["Selection 700","Selection 700 Multi Hip","glutem+abductst"],["Selection 700","Selection 700 Dual Pectoral / Reverse Fly","pecdeck+revfly"],["Selection 700","Selection 700 Delts Machine","lateralm"],
 ["Selection 900","Selection 900 Standing Calf","calf"],["Selection 900","Selection 900 Glute Press","glutem"],["Selection 900","Selection 900 Hip Thrust","hipthrust"],
 ["Selection 900","Selection 900 Multi Flight","lateralm+revfly"],["Selection 900","Selection 900 Arm Extension","trimach"],["Selection 900","Selection 900 Adductor","adductm"],
 ["Selection 900","Selection 900 Low Row","rowmachine"],["Selection 900","Selection 900 Lower Back","backextm"],["Selection 900","Selection 900 Shoulder Press","shoulderpress"],
 ["Selection 900","Selection 900 Leg Extension","legext"],["Selection 900","Selection 900 Lat Machine","latpull"],["Selection 900","Selection 900 Pectoral","pecdeck"],
 ["Selection 900","Selection 900 Total Abdominal","absmach"],["Selection 900","Selection 900 Rotary Torso","torso"],["Selection 900","Selection 900 Pulley","cablerow"],
 ["Selection 900","Selection 900 Vertical Traction","latm"],["Selection 900","Selection 900 Leg Press","legpress_s"],["Selection 900","Selection 900 Prone Leg Curl","legcurl"],
 ["Selection 900","Selection 900 Delts Machine","lateralm"],["Selection 900","Selection 900 Chest Press","chestpress"],["Selection 900","Selection 900 Arm Curl","preacher"],
 ["Selection 900","Selection 900 Abdominal Crunch","absmach"],["Selection 900","Selection 900 Leg Curl","legcurl_s"],["Selection 900","Selection 900 Reverse Fly","revfly"],
 ["Pure Strength","Pure Strength Hip Thrust","hipthrust"],["Pure Strength","Pure Strength Linear Leg Press","legpress"],["Pure Strength","Pure Strength Leg Press","legpress"],
 ["Pure Strength","Pure Strength Hack Squat","hack"],["Pure Strength","Pure Strength Belt Squat","beltsquat"],["Pure Strength","Pure Strength Row","rowmachine"],
 ["Pure Strength","Pure Strength Incline Chest Press","inclinechest"],["Pure Strength","Pure Strength Chest Press","chestpress"],["Pure Strength","Pure Strength Shoulder Press","shoulderpress"],
 ["Pure Strength","Pure Strength Seated Calf","calfseated"],["Pure Strength","Pure Strength Low Row","lowrow"],["Pure Strength","Pure Strength Biceps","preacher"],
 ["Pure Strength","Pure Strength Rear Kick","glutem"],["Pure Strength","Pure Strength Seated Dip","dipmach"],["Pure Strength","Pure Strength Deadlift","deadliftm"],
 ["Pure Strength","Pure Strength Calf","calf"],["Pure Strength","Pure Strength Pullover","pulloverm"],["Pure Strength","Pure Strength Standing Abductor","abductst"],
 ["Pure Strength","Pure Strength Leg Extension","legext"],["Pure Strength","Pure Strength Wide Chest Press","chestpress"],["Pure Strength","Pure Strength Standing Leg Curl","legcurl_st"],
 ["Pure Strength","Pure Strength Pulldown","latm"],["Pure Strength","T Bar Row","tbarm"]
];
/* Hammer Strength Plate-Loaded (laut FitX einer der Hersteller). Namen von lifefitness.com (Hammer Strength Plate Loaded), abgerufen 29.10.2026. */
const HS = [
 ["Plate-Loaded Oberkörper","Iso-Lateral T-Bar Row","tbarm"],["Plate-Loaded Oberkörper","T-Bar Row","tbarm"],["Plate-Loaded Oberkörper","Iso-Lateral Bench Press","chestlying"],
 ["Plate-Loaded Oberkörper","Abdominal / Oblique Crunch","absmach"],["Plate-Loaded Oberkörper","Plate Loaded Gripper","forearmm"],["Plate-Loaded Oberkörper","Iso-Lateral Chest / Back","chestpress+rowmachine"],
 ["Plate-Loaded Oberkörper","Iso-Lateral D.Y. Row","rowmachine"],["Plate-Loaded Oberkörper","Iso-Lateral Decline Chest Press","declinechest"],["Plate-Loaded Oberkörper","Iso-Lateral Front Lat Pulldown","latm"],
 ["Plate-Loaded Oberkörper","Iso-Lateral High Row","highrow"],["Plate-Loaded Oberkörper","Iso-Lateral Horizontal Bench Press","chestpress"],["Plate-Loaded Oberkörper","Iso-Lateral Incline Press","inclinechest"],
 ["Plate-Loaded Oberkörper","Iso-Lateral Low Row","lowrow"],["Plate-Loaded Oberkörper","Iso-Lateral Row","rowmachine"],["Plate-Loaded Oberkörper","Iso-Lateral Shoulder Press","shoulderpress"],
 ["Plate-Loaded Oberkörper","Iso-Lateral Super Incline Press","inclinechest"],["Plate-Loaded Oberkörper","Iso-Lateral Wide Chest","chestpress"],["Plate-Loaded Oberkörper","Iso-Lateral Wide Pulldown","latm"],
 ["Plate-Loaded Oberkörper","Plate Loaded Lateral Raise","lateralm"],["Plate-Loaded Oberkörper","Plate Loaded Pullover","pulloverm"],["Plate-Loaded Oberkörper","Plate Loaded Seated Biceps","preacher"],
 ["Plate-Loaded Oberkörper","Plate Loaded Seated Dip","dipmach"],["Plate-Loaded Oberkörper","Seated / Standing Shrug","shrugm"],["Plate-Loaded Oberkörper","Plate Loaded Super Fly","pecdeck"],
 ["Plate-Loaded Oberkörper","Plate Loaded 4-Way Neck",""],
 ["Plate-Loaded Unterkörper","Glute Ham / Reverse Hyper","ghd+revhyper"],["Plate-Loaded Unterkörper","Plate Loaded Glute Drive","hipthrust"],["Plate-Loaded Unterkörper","Plate Loaded Belt Squat","beltsquat"],
 ["Plate-Loaded Unterkörper","Iso-Lateral Kneeling Leg Curl","legcurl_st"],["Plate-Loaded Unterkörper","Iso-Lateral Leg Curl","legcurl"],["Plate-Loaded Unterkörper","Plate Loaded Hack Squat","hack"],
 ["Plate-Loaded Unterkörper","Plate Loaded Linear Leg Press","legpress"],["Plate-Loaded Unterkörper","Plate Loaded Seated Calf Raise","calfseated"],["Plate-Loaded Unterkörper","Plate Loaded Tibia Dorsi-Flexion","tibm"],
 ["Plate-Loaded Unterkörper","Plate Loaded Assisted Nordic Ham","invlegcurl"],["Plate-Loaded Unterkörper","Iso-Lateral Leg Extension","legext"],["Plate-Loaded Unterkörper","Plate Loaded Reverse V-Squat","vsquat"],
 ["Plate-Loaded Unterkörper","Plate Loaded Super Squat Press","levsquat"],["Plate-Loaded Unterkörper","Plate Loaded Pendulum-X Squat","pendulum"],
 ["Ground Base","Ground Base Jammer","viking"],["Ground Base","Ground Base Combo Twist","torso"],["Ground Base","Ground Base Squat / High Pull","levsquat"],["Ground Base","Ground Base Multi-Squat","levsquat"]
];
/* FitX-Ausstattung einzeln: status "belegt" = auf fitx.de genannt, "typisch" = üblich, für FitX nicht einzeln bestätigt */
const FX = [
 ["belegt","Kurzhanteln bis 60 kg","db"],["belegt","Langhanteln und Gewichtsscheiben bis 20 kg","rack"],["belegt","Bänke","bench+incline"],["belegt","Kabelzüge / Kabeltürme","cable"],
 ["belegt","Ruderzug","cablerow"],["belegt","Beinpresse","legpress"],["belegt","Brustpresse","chestpress"],["belegt","Plate-Loaded-Brustpresse schräg","inclinechest"],["belegt","Trizepsmaschine","trimach"],
 ["belegt","Kettlebells","kb"],["belegt","Medizinbälle","medball"],["belegt","Sandbags","sandbag"],["belegt","Battle Ropes","battlerope"],["belegt","Sprossenleitern","wallbars"],["belegt","Ringe","rings"],["belegt","Plyo-Boxen","plyobox"],
 ["belegt","Laufband","treadmill"],["belegt","Crosstrainer","crosstrainer"],["belegt","Rudergerät","rower"],["belegt","Stair Climber","stair"],
 ["typisch","Indoor-Bikes (Kurs „tour de x“)","bike"],["typisch","SZ-Stange","ez"],["typisch","Doppelter Kabelzug","cable2"],["typisch","Latzug","latpull"],["typisch","Hackenschmidt","hack"],
 ["typisch","Beinstrecker","legext"],["typisch","Beinbeuger liegend","legcurl"],["typisch","Beinbeuger sitzend","legcurl_s"],["typisch","Butterfly / Reverse Butterfly","pecdeck+revfly"],
 ["typisch","Schulterpresse","shoulderpress"],["typisch","Seitheben-Maschine","lateralm"],["typisch","Bizepsmaschine","preacher"],["typisch","Abduktor/Adduktor","abduct"],
 ["typisch","Wadenmaschine stehend","calf"],["typisch","Wadenheben sitzend","calfseated"],["typisch","Hip-Thrust-Maschine","hipthrust"],["typisch","Glute-Kickback-Maschine","glutem"],
 ["typisch","Multipresse","smith"],["typisch","Klimmzugstange","pullup"],["typisch","Dipbarren","dip"],["typisch","Klimmzug-/Dip-Assistent","assist"],["typisch","Hyperextension-Bank","backext"],
 ["typisch","Bauchmaschine","absmach"],["typisch","Rudermaschine (brustgestützt)","rowmachine"]
];
const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/* Alle wählbaren Modelle in einer Liste: id, Hersteller, Serie, Name, (Nr.), zugeordnete App-Geräte */
const MODELS = [
 ...GYM80.map(g => ({id: "gym80:" + g.nr, brand: "gym80", series: g.series, name: g.name, nr: g.nr, eq: g.eq})),
 ...TG.map(([series, name, eq]) => ({id: "tg:" + slug(name), brand: "technogym", series, name, eq: eq ? eq.split("+") : []})),
 ...HS.map(([series, name, eq]) => ({id: "hs:" + slug(name), brand: "hammer", series, name, eq: eq ? eq.split("+") : []})),
 ...FX.map(([status, name, eq]) => ({id: "fitx:" + slug(name), brand: "fitx", series: status === "belegt" ? "Belegt (fitx.de)" : "Typisch (nicht bestätigt)", status, name, eq: eq ? eq.split("+") : []}))
];
const BRANDS = [
 {id: "fitx", name: "FitX", note: "Auf fitx.de genannte Ausstattung („belegt“) und übliche, aber nicht einzeln bestätigte Ausstattung („typisch“). Laut FitX stammen die Geräte von Technogym und Hammer Strength – die konkreten Modelle wählst du in den jeweiligen Reitern. Die Ausstattung unterscheidet sich je nach Standort.", src: "fitx.de, abgerufen 29.10.2026"},
 {id: "gym80", name: "gym80", note: "Offizielle Bezeichnungen und Artikelnummern aus dem gym80-Produktkatalog 2024.", src: "gym80 Produktkatalog 2024, gym80.de"},
 {id: "technogym", name: "Technogym", note: "Selection 700, Selection 900 und Pure Strength laut technogym.com. Die Selection-900-Liste ist evtl. nicht vollständig.", src: "technogym.com, abgerufen 29.10.2026"},
 {id: "hammer", name: "Hammer Strength", note: "Plate-Loaded-Linie laut Hersteller (Life Fitness).", src: "lifefitness.com, abgerufen 29.10.2026"}
];

/* Studio-Vorlagen. "belegt" = auf offiziellen FitX-Seiten genannt; "typisch" = in Studios dieser Größe üblich,
   für FitX aber nicht einzeln bestätigt. Quellen: fitx.de (Trainingsbereiche, Freihantel, Studioseiten), abgerufen 29.10.2026. */
const STUDIOS = [
 {id: "fitx_belegt", name: "FitX – nur belegte Ausstattung",
  note: "Auf fitx.de genannt: Kurzhanteln bis 60 kg, Langhanteln, Scheiben bis 20 kg, Bänke, Kabelzüge, Plate-Loaded-Geräte (u. a. schräge Brustpresse), Beinpresse, Brustpresse, Trizepsmaschine, Ruderzug, Turnecke mit Medizinbällen, Kettlebells, Sandbags, Battle Ropes, Sprossenleitern, Ringen und Plyo-Boxen sowie Laufband, Crosstrainer, Rudergerät und Stair Climber. Hersteller laut FitX: Technogym und Hammer Strength. Racks werden nicht ausdrücklich genannt; „Langhantel & Power Rack“ ist enthalten, weil Langhanteln belegt sind.",
  eq: ["db","rack","bench","incline","cable","cablerow","legpress","chestpress","inclinechest","trimach","kb","medball","sandbag","battlerope","wallbars","rings","plyobox","treadmill","crosstrainer","rower","stair"]},
 {id: "fitx_typisch", name: "FitX – typische Ausstattung",
  note: "Belegte Ausstattung plus Geräte, die in großen Studios mit „über 60 Profigeräten“ üblich sind, für FitX aber nicht einzeln bestätigt: z. B. Latzug, Beinstrecker, Beinbeuger, Butterfly, Schulterpresse, Waden- und Abduktorenmaschine, Multipresse, Klimmzug- und Dipstation, Indoor-Bikes (Kurs „tour de x“). Bitte im eigenen Studio prüfen und abwählen, was fehlt.",
  eq: ["db","rack","ez","bench","incline","cable","cable2","cablerow","latpull","legpress","hack","legext","legcurl","legcurl_s","chestpress","inclinechest","pecdeck","revfly","shoulderpress","lateralm","trimach","preacher","abduct","calf","calfseated","hipthrust","glutem","smith","pullup","dip","assist","backext","absmach","rowmachine","kb","medball","sandbag","battlerope","wallbars","rings","plyobox","treadmill","crosstrainer","rower","stair","bike"]}
];
const API = {GYM80, STUDIOS, MODELS, BRANDS};
if (typeof module !== "undefined" && module.exports) module.exports = API; else root.Geraete = API;
})(typeof window !== "undefined" ? window : this);
