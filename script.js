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

const displayValues = {};

function setCard(id, targetValue, unit, color){
    const card = document.getElementById(id);
    card.classList.remove("green","yellow","orange","red");
    card.classList.add(color);

    if(displayValues[id] === undefined){
        displayValues[id] = parseFloat(targetValue);
    }

    const valueElement = card.querySelector(".value");
    const animate = () =>{

        let current = displayValues[id];
        current += (targetValue - current) * 0.12;
        displayValues[id] = current;
        let decimals = 1;

        if(unit=="%")
            decimals = 2;

        valueElement.innerHTML =
        current.toFixed(decimals)+" "+unit;

        valueElement.animate(

        [
          {transform:"scale(1.08)"},
          {transform:"scale(1)"}
        ],

        {
          duration:180
        }

);

        if(Math.abs(targetValue-current)>0.05){

            requestAnimationFrame(animate);

        }else{
            displayValues[id]=targetValue;
            valueElement.innerHTML=
            targetValue.toFixed(decimals)+" "+unit;
        }

    }

    animate();

}


// ===== LOOP
setInterval(()=>{

  const d = generateRealtime();
  const now = new Date();

const date =
    now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

const time =
    now.toLocaleTimeString("id-ID");
    hour12: false
document.getElementById("date").innerText =
    `${date} • ${time} WIB`;

  setCard("cardIR", d.IR, "A", colorCurrent(d.IR));
  setCard("cardIS", d.IS, "A", colorCurrent(d.IS));
  setCard("cardIT", d.IT, "A", colorCurrent(d.IT));

  // tampilkan juga % biar konsisten dengan “80% rule”
  setCard("cardLoad", d.loadPct, "%", colorLoad(d.loadPct));

  setCard("cardTemp", d.temp, "°C", colorTemp(d.temp));
  setCard("cardUnb", d.unb, "%", colorUnb(d.unb));

}, 2000);

document.querySelectorAll(".card").forEach(card=>{

    card.addEventListener("mousemove",(e)=>{
        const rect=card.getBoundingClientRect();
        const x=e.clientX-rect.left;
        const y=e.clientY-rect.top;

        card.style.setProperty("--x",x+"px");
        card.style.setProperty("--y",y+"px");

    });

});

document.querySelectorAll(".card").forEach(card=>{

    card.addEventListener("mousemove",(e)=>{
        const rect=card.getBoundingClientRect();
        const x=e.clientX-rect.left;
        const y=e.clientY-rect.top;

        card.style.setProperty("--x",x+"px");
        card.style.setProperty("--y",y+"px");

        const centerX=rect.width/2;
        const centerY=rect.height/2;

        const rotateY=((x-centerX)/centerX)*5;
        const rotateX=((centerY-y)/centerY)*5;

        /*
        card.style.transform=
        `
        perspective(900px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-8px)
        scale(1.02)
        `;
        */
    });

    card.addEventListener("mouseleave",()=>{
        /*
        card.style.transform=
        `
        perspective(900px)
        rotateX(0deg)
        rotateY(0deg)
        translateY(0px)
        scale(1)
        `;
        */

    });

});

let activeCard = null;

function openCard(cardId){

    const grid = document.querySelector(".grid");
    const card = document.getElementById(cardId);

    // klik card yang sama = tutup
    if(activeCard === card){
        grid.classList.remove("focus");
        card.classList.remove("active");
        activeCard = null;
        return;
    }

    // reset semua active
    document.querySelectorAll(".card").forEach(c=>{
        c.classList.remove("active");
    });

    activeCard = card;
    grid.classList.add("focus");
    card.classList.add("active");
}

document.querySelectorAll(".card").forEach(card=>{
    card.addEventListener("click",()=>{
        openCard(card.id);
    });
});
