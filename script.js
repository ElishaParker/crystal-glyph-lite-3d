let scene, camera, renderer, node;
let isZoomed = false;
let hudVisible = false;
let hasPlayed = false;

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

  const ambient = new THREE.AmbientLight(0x00ffff, 0.4);
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
  if (!isZoomed) zoomToNode();
  else if (isZoomed && !hudVisible) openHUD();
}

function zoomToNode() {
  const targetZ = 2.5;
  const speed = 0.05;
  function zoom() {
    if (camera.position.z > targetZ) {
      camera.position.z -= speed;
      requestAnimationFrame(zoom);
    } else {
      isZoomed = true;
      openHUD();
    }
  }
  zoom();
}

function openHUD() {
  hud.style.display = "block";
  hudVisible = true;
  if (!hasPlayed) {
    playSoftTone(432);
    hasPlayed = true;
  }
}

function closeHUD() {
  hud.style.display = "none";
  hudVisible = false;
  hasPlayed = false;
  zoomOut();
}

function zoomOut() {
  const targetZ = 8;
  const speed = 0.05;
  function zoom() {
    if (camera.position.z < targetZ) {
      camera.position.z += speed;
      requestAnimationFrame(zoom);
    } else {
      isZoomed = false;
    }
  }
  zoom();
}

function playSoftTone(freq) {
  const synth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 3, decay: 2, sustain: 0.1, release: 4 }
  }).toDestination();

  Tone.start();
  synth.triggerAttackRelease(freq, "4n");
}

function convertText() {
  const text = textInput.value;
  const base4 = [...text].map(c => (c.charCodeAt(0) % 4).toString()).join('');
  output.textContent = base4;
}

function reverseTranslate() {
  const base4 = output.textContent;
  const decoded = [...base4].map(n => String.fromCharCode(parseInt(n, 4) + 96)).join('');
  textInput.value = decoded;
}

function animate() {
  requestAnimationFrame(animate);
  node.rotation.y += 0.003;
  node.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.002) * 0.3;
  renderer.render(scene, camera);
}
