let scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

let camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
[camera.position.x, camera.position.y, camera.position.z] = [2, 3, 5];
camera.lookAt(new THREE.Vector3(0, 0, 0));

let renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementsByClassName("canvas_wrapper")[0].appendChild( renderer.domElement );

let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let clickableObjects = [];

//classes
class Vertex {
  constructor(x, y, z){
    this._sphere = new THREE.Mesh(
      new THREE.SphereGeometry( 0.08, 32, 32 ),
      new THREE.MeshBasicMaterial( {
        color: Math.random() * 0xffffff
      } )
    );
    [this._sphere.position.x, this._sphere.position.y, this._sphere.position.z] = [x, y, z];
  }

  addToCube(cube){
    cube.add( this._sphere );
  }

  addToClickableObjects(clickableObjects){
    clickableObjects.push( this._sphere );
  }

  get position(){
    return this._sphere.position;
  }
}

class Edge {
  constructor(vector1, vector2) {
    let geometry = new THREE.Geometry();
    geometry.vertices.push(vector1, vector2);

    this._line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial( {
        color: 0x000
      } )
    );
  }

  addToCube(cube){
    cube.add( this._line );
  }
}

class Cube {
  constructor() {
    this._group = new THREE.Group();
    this._buildCube(this._group, getRandom(-2, 2), getRandom(-2, 2), getRandom(-2, 2));
    this.setRotation(getRandom(0, 2*Math.PI), getRandom(0, 2*Math.PI), getRandom(0, 2*Math.PI));
  }

 _buildCube(cube, x, y, z) {
    let vertices = [
      new Vertex( 0+x, 0+y, 0+z ),
      new Vertex( 1+x, 0+y, 0+z ),
      new Vertex( 1+x, 0+y, 1+z ),
      new Vertex( 0+x, 0+y, 1+z ),
      new Vertex( 0+x, 1+y, 0+z ),
      new Vertex( 1+x, 1+y, 0+z ),
      new Vertex( 1+x, 1+y, 1+z ),
      new Vertex( 0+x, 1+y, 1+z )
    ];

  //add vertices
    vertices.forEach( (vertex) => {
      vertex.addToCube(cube);
      vertex.addToClickableObjects(clickableObjects);
    });

  //draw lines
    let edge;

    //vertical lines
    for (let i = 0; i < 4; i++) {
      edge = new Edge(vertices[i].position, vertices[i+4].position);
      edge.addToCube(cube);
    }
    //top and bottom face lines
    for (let i = 0; i < 3; i++) {
        //bottom
        edge = new Edge(vertices[i].position, vertices[i+1].position);
        edge.addToCube(cube);
        //top
        edge = new Edge(vertices[i+4].position, vertices[i+5].position);
        edge.addToCube(cube);
    }
    //bottom
    edge = new Edge(vertices[3].position, vertices[0].position);
    edge.addToCube(cube);
    //top
    edge = new Edge(vertices[7].position, vertices[4].position);
    edge.addToCube(cube);
  }

  setRotation(x, y, z){
    [this._group.rotation.x, this._group.rotation.y, this._group.rotation.z] = [x, y, z];
  }

  addToScene(scene){
    scene.add(this._group);
  }
}

//eventlisteners
window.addEventListener( 'load', renderAll, false );
document.getElementsByClassName("canvas_wrapper")[0].addEventListener( 'click', onCanvasClick, false );
document.getElementsByClassName("help")[0].addEventListener("click", () => { openAndClose("topic_help") }, false);

//functions
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

function onCanvasClick( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );
  let intersects = raycaster.intersectObjects( clickableObjects );

  let targetColor, targetVert, targetCube;

	for (let i = 0; i < intersects.length; i++) {
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
  if(cubesAmount < 0){
    document.getElementsByClassName("amount_input")[0].value = 0;
    cubesAmount = 0;
  }

  for (let i = 0; i < cubesAmount; i++){
    cubes[i] = new Cube();
    cubes[i].addToScene(scene);
  }

  renderer.render( scene, camera );
}

function clearScene(){
  clickableObjects = [];
  while(scene.children.length > 0){
    scene.remove(scene.children[0]);
  }
}

function objEqual (obj1, obj2){
   return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function getRandom(min, max){
  return min + Math.random() * (max - min);
}

function getRandomInt(min, max){
  return Math.floor( min + Math.random() * (max + 1 - min) );
}
