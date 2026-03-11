const mathScore = document.getElementById("mathScore");
const englishScore = document.getElementById("englishScore");
const scienceScore = document.getElementById("scienceScore");

// function imposeMinMax(el){
//   if(el.value != ""){
//     if(parseInt(el.value) < parseInt(el.min)){
//       el.value = el.min;
//     }
//     if(parseInt(el.value) > parseInt(el.max)){
//       el.value = el.max;
//     }
//   }
// }

const max = 100;
const min = 0;

mathScore.addEventListener("blur", () => {
    if(mathScore.value != ""){
        if(parseInt(mathScore.value) < min){
            mathScore.value = min;
        }
        if(parseInt(mathScore.value) > max){
            mathScore.value = max;
        }
    }
})