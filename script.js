let scene, camera, renderer, node;
let isZoomed = false;
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
  if (!isZoomed) {
    isZoomed = true;
    zoomToNode();
  } else if (!hudVisible) {
    showHUD(true);
  }
}

function closeHUD() {
  showHUD(false);
  hudVisible = false;
  hasPlayed = false;

  // Smooth zoom out to reset camera
  const targetZ = 8;
  const zoomSpeed = 0.05;
  function zoom() {
    if (camera.position.z < targetZ) {
      camera.position.z += zoomSpeed;
      requestAnimationFrame(zoom);
    } else {
      // Re-enable interaction after zoom completes
      isZoomed = false;
    }
  }
  zoom();
}

let hudVisible = false;

function showHUD(show) {
  hud.style.display = show ? "block" : "none";
  hudVisible = show;
}

}

function zoomToNode() {
  const targetZ = 2.5;
  const zoomSpeed = 0.05;
  function zoom() {
    if (camera.position.z > targetZ) {
      camera.position.z -= zoomSpeed;
      requestAnimationFrame(zoom);
    } else {
      showHUD(true);
      if (!hasPlayed) {
        playSoftTone(396);
        hasPlayed = true;
      }
    }
  }
  zoom();
}

function showHUD(show) {
  hud.style.display = show ? "block" : "none";
}

function playSoftTone(freq) {
  const synth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 4.5,   // slower fade-in (was 1.2)
      decay: 3.5,
      sustain: 0.1,
      release: 6.0   // longer release (was 2.5)
    }
  }).toDestination();

  Tone.start();
  synth.triggerAttackRelease(freq, "12n"); // longer note length
}


function convertText() {
  const text = textInput.value;
  const base4 = textToBase4(text);
  output.textContent = base4;
}

function reverseTranslate() {
  textInput.value = textInput.value || "";
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
  hasPlayed = false;
  zoomOut();
}

function zoomOut() {
  const targetZ = 8;
  const zoomSpeed = 0.05;
  function zoom() {
    if (camera.position.z < targetZ) {
      camera.position.z += zoomSpeed;
      requestAnimationFrame(zoom);
    }
  }
  zoom();
}

function animate() {
  requestAnimationFrame(animate);
  node.rotation.y += 0.004;
  node.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.002) * 0.3;
  renderer.render(scene, camera);
}
