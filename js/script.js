let scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

let camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.x = 2;
camera.position.y = 3;
camera.position.z = 5;
camera.lookAt(new THREE.Vector3(0, 0, 0));

let renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementsByClassName("canvas_wrapper")[0].appendChild( renderer.domElement );

let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let clickableObjects = [];



document.getElementsByClassName("canvas_wrapper")[0].addEventListener( 'click', onClick, false );
window.addEventListener( 'load', renderAll, false );


document.getElementsByClassName("help")[0].addEventListener("click", () => {openAndClose("topic_help")}, false);


function openAndClose(windowId) {
  let popUpWindow = document.getElementsByClassName(windowId)[0];

  if(popUpWindow.classList.contains("close")) {
    popUpWindow.classList.remove("close");
    popUpWindow.classList.add("open");
  }
  else{
    popUpWindow.classList.remove("open");
    popUpWindow.classList.add("close");
  }
}

function onClick( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  raycaster.setFromCamera( mouse, camera );
  let intersects = raycaster.intersectObjects( clickableObjects );
  let targetColor, targetVert, targetCube;
	for ( let i = 0; i < intersects.length; i++ ) {
    targetColor = intersects[i].object.material.color;
    targetVert = intersects[i].object.position;
		targetCube = intersects[i].object.parent;
    for (let j = 0; j < targetCube.children.length; j++) {
      if( targetCube.children[j] instanceof THREE.Line  &&
          ( objEqual(targetCube.children[j].geometry.vertices[0], targetVert) ||
            objEqual(targetCube.children[j].geometry.vertices[1], targetVert) ) ){
        targetCube.children[j].material.color.set( targetColor );
      }
    }
	}
	renderer.render( scene, camera );

}

function renderAll(){
  clearScene();
  let cubes = [];
  let cubesAmount = document.getElementsByClassName("amount_input")[0].value;
  if(cubesAmount > 20){
    document.getElementsByClassName("amount_input")[0].value = 20;
    cubesAmount = 20;
  }
  for (let i = 0; i < cubesAmount; i++){
    cubes[i] = new THREE.Group();
    drawCube(cubes[i], getRandom(-2, 2), getRandom(-2, 2), getRandom(-2, 2));
    scene.add(cubes[i]);
  }
  renderer.render( scene, camera );
}

function clearScene(){
  clickableObjects = [];
  while(scene.children.length > 0){
    scene.remove(scene.children[0]);
  }
}

function drawCube(cube, x, y, z) {
  let vertices = [
    new THREE.Vector3( 0+x, 0+y, 0+z ),
    new THREE.Vector3( 1+x, 0+y, 0+z ),
    new THREE.Vector3( 1+x, 0+y, 1+z ),
    new THREE.Vector3( 0+x, 0+y, 1+z ),
    new THREE.Vector3( 0+x, 1+y, 0+z ),
    new THREE.Vector3( 1+x, 1+y, 0+z ),
    new THREE.Vector3( 1+x, 1+y, 1+z ),
    new THREE.Vector3( 0+x, 1+y, 1+z )
  ];

//draw vertices
  let sphere;
  vertices.forEach((vertice) => {
    sphere = new THREE.Mesh(
      new THREE.SphereGeometry( 0.08, 32, 32 ),
      new THREE.MeshBasicMaterial( {
        color: Math.random() * 0xffffff
      })
    );
    [sphere.position.x, sphere.position.y, sphere.position.z] = [vertice.x, vertice.y, vertice.z];
    cube.add( sphere );
    clickableObjects.push(sphere);
  });

//draw lines
  let geometry, line;

  //vertical lines
  for (let i = 0; i < 4; i++) {
    geometry = new THREE.Geometry();
    geometry.vertices.push(vertices[i], vertices[i+4]);
    line = new THREE.Line( geometry, getMaterialLine() );
    cube.add( line );
  }
  //top and bottom face lines
  for (let i = 0; i < 3; i++) {
      //bottom
      geometry = new THREE.Geometry();
      geometry.vertices.push(vertices[i], vertices[i+1]);
      line = new THREE.Line( geometry, getMaterialLine() );
      cube.add( line );
      //top
      geometry = new THREE.Geometry();
      geometry.vertices.push(vertices[i+4], vertices[i+5]);
      line = new THREE.Line( geometry, getMaterialLine() );
      cube.add( line );
  }
  //bottom
  geometry = new THREE.Geometry();
  geometry.vertices.push(vertices[3], vertices[0]);
  line = new THREE.Line( geometry, getMaterialLine() );
  cube.add( line );
  //top
  geometry = new THREE.Geometry();
  geometry.vertices.push(vertices[7], vertices[4]);
  line = new THREE.Line( geometry, getMaterialLine() );
  cube.add( line );


  cube.rotation.x = getRandom(0, 2*Math.PI);
  cube.rotation.y = getRandom(0, 2*Math.PI);
  cube.rotation.z = getRandom(0, 2*Math.PI);
}

function getMaterialLine() {
  return new THREE.LineBasicMaterial( {
    color: 0x000
  } );
}

function objEqual (obj1, obj2){
   return JSON.stringify(obj1)===JSON.stringify(obj2);
}

function getRandom(min, max){
  return min + Math.random() * (max + 1 - min);
}

function getRandomInt(min, max){
  return Math.floor(min + Math.random() * (max + 1 - min));
}
