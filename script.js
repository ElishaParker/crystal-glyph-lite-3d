let scene, camera, renderer;
let orbs = [];
let connections = [];
let selectedOrb = null;
let audioCtx, mainGain, padOsc1, padOsc2, modOsc;
let ambientParticles = [];

init();
initAudio();

function init() {
  // Scene setup
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 2000);
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("bg"), antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);
  camera.position.z = 5;

  // Lights
  const ambient = new THREE.AmbientLight(0x00ffff, 0.4);
  const point = new THREE.PointLight(0xffffff, 1);
  point.position.set(10, 10, 10);
  scene.add(ambient, point);

  // Seed orb
  const orb = makeOrb(0x00ffff);
  scene.add(orb);
  orbs.push(orb);

  // Ambient particles
  const starGeo = new THREE.BufferGeometry();
  const starCount = 600;
  const positions = [];
  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;
    positions.push(x, y, z);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.7, transparent: true, opacity: 0.6 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  window.addEventListener("resize", onWindowResize);
  renderer.domElement.addEventListener("click", onClick);

  animate();
}

function makeOrb(color) {
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.3,
    metalness: 0.7,
    roughness: 0.2
  });
  return new THREE.Mesh(geometry, material);
}

function onWindowResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

function onClick(event) {
  const mouse = new THREE.Vector2(
    (event.clientX / innerWidth) * 2 - 1,
    -(event.clientY / innerHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(orbs);
  if (hits.length > 0) selectOrb(hits[0].object);
}

function selectOrb(orb) {
  selectedOrb = orb;
  document.getElementById("hud").classList.remove("hidden");

  gsap.to(camera.position, {
    x: orb.position.x,
    y: orb.position.y,
    z: orb.position.z + 2.5,
    duration: 1.8,
    onUpdate: () => camera.lookAt(orb.position),
    onComplete: () => zoomSound()
  });

  document.getElementById("addOrb").onclick = createLinkedOrb;
}

function createLinkedOrb() {
  if (!selectedOrb) return;

  const color = new THREE.Color(`hsl(${Math.random() * 360},100%,60%)`);
  const orb = makeOrb(color);
  const dir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize().multiplyScalar(2);
  orb.position.copy(selectedOrb.position).add(dir);
  scene.add(orb);
  orbs.push(orb);

  const lineGeo = new THREE.BufferGeometry().setFromPoints([selectedOrb.position, orb.position]);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });
  const line = new THREE.Line(lineGeo, lineMat);
  scene.add(line);
  connections.push(line);

  createOrbSound();
}

function animate() {
  requestAnimationFrame(animate);
  scene.rotation.y += 0.0007;
  renderer.render(scene, camera);
}

// ===== AUDIO SECTION =====
function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  mainGain = audioCtx.createGain();
  mainGain.gain.value = 0.2;
  mainGain.connect(audioCtx.destination);

  padOsc1 = audioCtx.createOscillator();
  padOsc2 = audioCtx.createOscillator();
  padOsc1.type = "sine";
  padOsc2.type = "triangle";

  modOsc = audioCtx.createOscillator();
  const modGain = audioCtx.createGain();
  modGain.gain.value = 30; // pitch modulation
  modOsc.frequency.value = 0.15; // slow LFO
  modOsc.connect(modGain);
  modGain.connect(padOsc1.frequency);

  padOsc1.connect(mainGain);
  padOsc2.connect(mainGain);
  padOsc1.frequency.value = 220;
  padOsc2.frequency.value = 224;
  padOsc1.start();
  padOsc2.start();
  modOsc.start();
}

function zoomSound() {
  if (!audioCtx) return;
  mainGain.gain.cancelScheduledValues(audioCtx.currentTime);
  mainGain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.2);
  mainGain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 1.0);
}

function createOrbSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.value = 400 + Math.random() * 300;
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
  osc.connect(gain).connect(mainGain);
  osc.start();
  osc.stop(audioCtx.currentTime + 1);
}
