// === Initialize Scene ===
let scene, camera, renderer, nodes = [];
let clock = new THREE.Clock();

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene'), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  // Soft glow lighting
  const ambient = new THREE.AmbientLight(0x00ffff, 0.3);
  const point = new THREE.PointLight(0x88ffff, 1);
  point.position.set(5, 5, 5);
  scene.add(ambient, point);

  // Create a base sphere
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    emissive: 0x0044ff,
    metalness: 0.7,
    roughness: 0.2,
  });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
  nodes.push(sphere);

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('click', spawnNode);
}

function spawnNode(event) {
  const color = new THREE.Color(`hsl(${Math.random() * 360}, 100%, 60%)`);
  const geometry = new THREE.SphereGeometry(0.3, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color.clone().multiplyScalar(0.3),
    metalness: 0.8,
    roughness: 0.1
  });

  const node = new THREE.Mesh(geometry, material);
  node.position.set(
    (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 6
  );
  scene.add(node);
  nodes.push(node);

  // Animate pulse
  node.scale.set(0.1, 0.1, 0.1);
  const grow = setInterval(() => {
    node.scale.multiplyScalar(1.05);
    if (node.scale.x > 1.5) clearInterval(grow);
  }, 16);
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
    n.rotation.x += 0.002;
    n.rotation.y += 0.003;
    n.position.x += Math.sin(t + i) * 0.0005;
    n.position.y += Math.cos(t + i * 0.5) * 0.0005;
  });

  renderer.render(scene, camera);
}
