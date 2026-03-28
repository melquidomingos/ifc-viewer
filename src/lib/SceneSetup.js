// src/lib/SceneSetup.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Inicializa a cena Three.js completa.
 * Retorna { scene, camera, renderer, controls, dispose }.
 *
 * @param {HTMLElement} container - Elemento DOM que receberá o canvas.
 */
export function initScene(container) {
  // ── Scene ────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0d14);
  scene.fog = new THREE.FogExp2(0x0a0d14, 0.015);

  // ── Camera ───────────────────────────────────────────────────────────────
  const w = container.clientWidth;
  const h = container.clientHeight;
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 2000);
  camera.position.set(20, 15, 20);
  camera.lookAt(0, 0, 0);

  // ── Renderer ─────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true,
  });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // ── Lights ───────────────────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0x8eb4d8, 0x1a2a1a, 0.4);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(30, 50, 20);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048, 2048);
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 200;
  dirLight.shadow.camera.left = -50;
  dirLight.shadow.camera.right = 50;
  dirLight.shadow.camera.top = 50;
  dirLight.shadow.camera.bottom = -50;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x4488bb, 0.3);
  fillLight.position.set(-20, 10, -20);
  scene.add(fillLight);

  // ── Grid ─────────────────────────────────────────────────────────────────
  const gridHelper = new THREE.GridHelper(100, 100, 0x1f2d45, 0x141d2e);
  gridHelper.position.y = -0.01;
  scene.add(gridHelper);

  // ── Axes Helper ──────────────────────────────────────────────────────────
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  // ── Orbit Controls ───────────────────────────────────────────────────────
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.screenSpacePanning = true;
  controls.minDistance = 1;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2 + 0.1;

  // ── Resize Handler ───────────────────────────────────────────────────────
  const onResize = () => {
    const nw = container.clientWidth;
    const nh = container.clientHeight;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  };
  window.addEventListener('resize', onResize);

  // ── Render Loop ──────────────────────────────────────────────────────────
  let raf;
  const animate = () => {
    raf = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  // ── Cleanup ──────────────────────────────────────────────────────────────
  const dispose = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    controls.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };

  return { scene, camera, renderer, controls, dispose };
}

/**
 * Reposiciona a câmera para enquadrar um objeto 3D.
 *
 * @param {THREE.Camera} camera
 * @param {OrbitControls} controls
 * @param {THREE.Object3D} object
 */
export function fitCameraToModel(camera, controls, object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let distance = Math.abs(maxDim / Math.sin(fov / 2)) * 0.8;
  distance = Math.max(distance, 5);

  camera.position.set(
    center.x + distance * 0.6,
    center.y + distance * 0.5,
    center.z + distance * 0.6
  );
  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.update();
}
