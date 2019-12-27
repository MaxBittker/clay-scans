var mesh = require("./skullmeshbigfixed.json");
var fs = require('fs');

function getPos(i) {
    return mesh.positions[i]
}

function distance(a,b) {
    let [x,y,z] = a.map((aV,i)=>aV-b[i]);
    return Math.sqrt(
        (x*x) + (y*y) + (z*z)
    );
    
};
mesh.cells = mesh.cells.filter(cell => {
    let [a,b,c] = cell.map(getPos)

    let da = distance(a,b);
    let db = distance(b,c);
    let dc= distance(c,a);
    let longest = Math.max(Math.max(da,db),dc);
    if(longest>0.4){
        console.log(longest)
    }
    return longest < 0.4;
    // console.log(getPos(a),getPos(b),getPos(c))
});

fs.writeFileSync("skullmeshbigfixedfiltered.json", JSON.stringify(mesh))