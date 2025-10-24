let scene, camera, renderer, nodes = [], selectedNode = null;
let clock = new THREE.Clock();
const hud = document.getElementById("hud");
const titleField = document.getElementById("nodeTitle");
const textField = document.getElementById("nodeText");
const glyphOutput = document.getElementById("glyphOutput");
const convertBtn = document.getElementById("convertBtn");
const closeBtn = document.getElementById("closeBtn");

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  camera.position.z = 8;

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene'), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  const ambient = new THREE.AmbientLight(0x00ffff, 0.3);
  const point = new THREE.PointLight(0x88ffff, 1);
  point.position.set(5, 5, 5);
  scene.add(ambient, point);

  // base node
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    emissive: 0x0044ff,
    metalness: 0.7,
    roughness: 0.2,
  });
  const base = new THREE.Mesh(geometry, material);
  base.userData = { title: "Base Node", text: "" };
  scene.add(base);
  nodes.push(base);

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('click', onClick);
  convertBtn.addEventListener('click', convertToBase4);
  closeBtn.addEventListener('click', closeHUD);
}

function playTone(color) {
  const freq = 200 + (color.getHSL({}).h * 800);
  const synth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.1, release: 0.8 }
  }).toDestination();

  synth.triggerAttackRelease(freq, "8n");
}

function onClick(event) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(nodes);

  if (intersects.length > 0) {
    const node = intersects[0].object;
    selectNode(node);
  } else if (!selectedNode) {
    spawnNode();
  }
}

function selectNode(node) {
  selectedNode = node;
  playTone(new THREE.Color(node.material.color));
  titleField.value = node.userData.title || "Untitled Node";
  textField.value = node.userData.text || "";
  glyphOutput.textContent = "";
  showHUD(true);

  // smooth zoom to node
  const target = node.position.clone();
  const start = camera.position.clone();
  let progress = 0;

  const zoom = () => {
    progress += 0.02;
    camera.position.lerpVectors(start, new THREE.Vector3(target.x, target.y, target.z + 2.5), progress);
    camera.lookAt(target);
    if (progress < 1 && selectedNode) requestAnimationFrame(zoom);
  };
  zoom();
}

function closeHUD() {
  showHUD(false);
  selectedNode = null;

  // Smooth zoom out
  const start = camera.position.clone();
  const target = new THREE.Vector3(0, 0, 8);
  let progress = 0;

  const zoomOut = () => {
    progress += 0.02;
    camera.position.lerpVectors(start, target, progress);
    camera.lookAt(0, 0, 0);
    if (progress < 1 && !selectedNode) requestAnimationFrame(zoomOut);
  };
  zoomOut();
}

function showHUD(show) {
  hud.style.display = show ? "block" : "none";
}

function spawnNode() {
  const color = new THREE.Color(`hsl(${Math.random() * 360}, 100%, 60%)`);
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color.clone().multiplyScalar(0.4),
    metalness: 0.8,
    roughness: 0.1
  });

  const node = new THREE.Mesh(geometry, material);
  node.position.set(
    (Math.random() - 0.5) * 8,
    (Math.random() - 0.5) * 8,
    (Math.random() - 0.5) * 8
  );
  node.userData = { title: "New Node", text: "" };
  scene.add(node);
  nodes.push(node);

  playTone(color);
}

function convertToBase4() {
  if (!selectedNode) return;
  const text = textField.value;
  selectedNode.userData.title = titleField.value;
  selectedNode.userData.text = text;
  const base4 = textToBase4(text);
  glyphOutput.textContent = base4;
  animateGlyph(selectedNode, base4);
}

function textToBase4(str) {
  let output = "";
  for (let i = 0; i < str.length; i++) {
    const val = str.charCodeAt(i) % 4;
    output += val.toString();
  }
  return output;
}

function animateGlyph(node, code) {
  let tick = 0;
  const baseColors = [0xff0080, 0x00ffff, 0xffff00, 0x00ff00];

  function pulse() {
    if (!selectedNode) return;
    const idx = parseInt(code[tick % code.length]);
    node.material.emissive.setHex(baseColors[idx]);
    node.scale.setScalar(1 + 0.05 * Math.sin(tick * 0.3));
    tick++;
    requestAnimationFrame(pulse);
  }
  pulse();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  nodes.forEach((n, i) => {
    if (n !== selectedNode) {
      n.rotation.x += 0.002;
      n.rotation.y += 0.003;
      n.position.x += Math.sin(t + i) * 0.0005;
      n.position.y += Math.cos(t + i * 0.5) * 0.0005;
    }
  });
  renderer.render(scene, camera);
}
