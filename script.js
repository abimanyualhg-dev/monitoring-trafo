const RATING = 607;

// ===== HELPER
function clamp(x, lo, hi){ return Math.min(Math.max(x, lo), hi); }

// ===== STATE (biar halus, gak loncat)
let state = {
  IR: 420,
  IS: 415,
  IT: 425,
  temp: 52
};

// ===== GENERATOR (DIJAGA DI ZONA HIJAU)
function generateRealtime(){

  // target di bawah 80% rating (≈ < 485 A)
  let baseTarget = 430 + (Math.random()*20 - 10); // 420–440

  // inertia (gerak pelan)
  state.IR += (baseTarget - state.IR) * 0.15 + (Math.random()*4 - 2);
  state.IS += (baseTarget - 5 - state.IS) * 0.15 + (Math.random()*4 - 2);
  state.IT += (baseTarget + 5 - state.IT) * 0.15 + (Math.random()*4 - 2);

  // clamp current supaya tetap < ~80% rating
  state.IR = clamp(state.IR, 360, 480);
  state.IS = clamp(state.IS, 360, 480);
  state.IT = clamp(state.IT, 360, 480);

  let Iavg = (state.IR + state.IS + state.IT) / 3;
  let Imax = Math.max(state.IR, state.IS, state.IT);

  // unbalance kecil (hijau)
  let unb = ((Imax - Iavg) / Iavg) * 100;
  unb = clamp(unb + (Math.random()*0.4 - 0.2), 0.5, 3.5);

  // suhu halus + range aman
  let tempTarget = 50 + (Iavg - 400) * 0.03; // korelasi ringan
  state.temp += (tempTarget - state.temp) * 0.1 + (Math.random()*0.5 - 0.25);
  state.temp = clamp(state.temp, 45, 60);

  return {
    IR: state.IR,
    IS: state.IS,
    IT: state.IT,
    Iavg,
    loadPct: (Iavg / RATING) * 100, // tetap <80%
    unb,
    temp: state.temp
  };
}


// ===== COLOR LOGIC (SEMUA AKAN HIJAU KARENA RANGE DIJAGA)
function colorCurrent(I){
  // range UI disesuaikan: <80% rating = hijau
  if (I < 0.8 * RATING) return "green";
  return "red";
}

function colorLoad(pct){
  if (pct < 80) return "green";
  return "red";
}

function colorTemp(t){
  if (t < 65) return "green";
  return "red";
}

function colorUnb(u){
  if (u < 5) return "green";
  return "red";
}

function setCard(id, val, unit, color){
  const c = document.getElementById(id);
  c.className = "card " + color;
  c.querySelector(".value").innerText = val + " " + unit;
}


// ===== LOOP
setInterval(()=>{

  const d = generateRealtime();

  document.getElementById("date").innerText =
    new Date().toLocaleString();

  setCard("cardIR", d.IR.toFixed(1), "A", colorCurrent(d.IR));
  setCard("cardIS", d.IS.toFixed(1), "A", colorCurrent(d.IS));
  setCard("cardIT", d.IT.toFixed(1), "A", colorCurrent(d.IT));

  // tampilkan juga % biar konsisten dengan “80% rule”
  setCard("cardLoad", d.loadPct.toFixed(1), "%", colorLoad(d.loadPct));

  setCard("cardTemp", d.temp.toFixed(1), "°C", colorTemp(d.temp));
  setCard("cardUnb", d.unb.toFixed(2), "%", colorUnb(d.unb));

}, 2000);
