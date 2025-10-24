let scene, camera, renderer, node;
let isZoomed = false;
let nodeData = { text: "", base4: "" };
let hudShownOnce = false;

const hud = document.getElementById("hud");
const textInput = document.getElementById("textInput");
const convertBtn = document.getElementById("convertBtn");
const reverseBtn = document.getElementById("reverseBtn");
const closeBtn = document.getElementById("closeBtn");
const output = document.getElementById("output");

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 8;

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene'), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const ambient = new THREE.AmbientLight(0x00ffff, 0.3);
  const point = new THREE.PointLight(0x00ffff, 2);
  scene.add(ambient, point);

  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    emissive: 0x0044ff,
    metalness: 0.8,
    roughness: 0.2,
  });
  node = new THREE.Mesh(geometry, material);
  scene.add(node);

  window.addEventListener("resize", onResize);
  window.addEventListener("click", onClick);
  convertBtn.addEventListener("click", convertText);
  reverseBtn.addEventListener("click", reverseTranslate);
  closeBtn.addEventListener("click", closeHUD);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onClick() {
  if (!isZoomed) {
    isZoomed = true;
    zoomToNode();
  }
}

function zoomToNode() {
  const targetZ = 2.5;
  const zoomSpeed = 0.05;
  const zoom = () => {
    if (camera.position.z > targetZ) {
      camera.position.z -= zoomSpeed;
      requestAnimationFrame(zoom);
    } else {
      if (!hudShownOnce) {
        textInput.placeholder = "Enter text to encode...";
        hudShownOnce = true;
      }
      showHUD(true);
      playSmoothTone(432);
    }
  };
  zoom();
}

function showHUD(show) {
  hud.style.display = show ? "block" : "none";
}

function playSmoothTone(freq) {
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: {
      attack: 1.2,   // gentle fade-in
      decay: 2.0,
      sustain: 0.4,
      release: 2.5   // slow fade-out
    }
  }).toDestination();

  Tone.start();
  synth.triggerAttackRelease(freq, "4n");
}

function convertText() {
  const text = textInput.value;
  nodeData.text = text;
  nodeData.base4 = textToBase4(text);
  output.textContent = nodeData.base4;
}

function reverseTranslate() {
  textInput.value = nodeData.text || "";
}

function textToBase4(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    result += (str.charCodeAt(i) % 4).toString();
  }
  return result;
}

function closeHUD() {
  showHUD(false);
  isZoomed = false;
  zoomOut();
}

function zoomOut() {
  const targetZ = 8;
  const zoomSpeed = 0.05;
  const zoom = () => {
    if (camera.position.z < targetZ) {
      camera.position.z += zoomSpeed;
      requestAnimationFrame(zoom);
    }
  };
  zoom();
}

function animate() {
  requestAnimationFrame(animate);
  node.rotation.y += 0.005;
  node.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.002) * 0.3;
  renderer.render(scene, camera);
}
