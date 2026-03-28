// src/lib/IFCLoader.js
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import * as THREE from 'three';

// ── Materiais de Seleção ──────────────────────────────────────────────────
export const HIGHLIGHT_MATERIAL = new THREE.MeshLambertMaterial({
  color: 0x38bdf8,
  transparent: true,
  opacity: 0.55,
  depthTest: false,
});

export const SELECT_MATERIAL = new THREE.MeshLambertMaterial({
  color: 0xf97316,
  transparent: true,
  opacity: 0.75,
  depthTest: false,
});

// ── Estado interno ────────────────────────────────────────────────────────
let _loader = null;
let _model = null;
let _highlightModelId = 'highlight';
let _selectModelId = 'select';

/**
 * Inicializa o IFCLoader e aponta para o WASM.
 */
export async function initIFCLoader() {
  if (_loader) return _loader;

  _loader = new IFCLoader();
  // No GitHub Pages o base é /ifc-viewer/ — ajuste aqui se o repositório tiver outro nome
	await _loader.ifcManager.setWasmPath('/ifc-viewer/');
	await _loader.ifcManager.applyWebIfcConfig({
  USE_FAST_BOOLS: true,
});
  // Melhora performance com workers (opcional — descomente se usar worker)
  // await _loader.ifcManager.useWebWorkers(true, '/IFC/ifc.worker.js');

  return _loader;
}

/**
 * Carrega um arquivo IFC na cena.
 *
 * @param {THREE.Scene} scene
 * @param {File} file
 * @param {Function} [onProgress]
 * @returns {Promise<{ model: THREE.Object3D, modelID: number }>}
 */
export async function loadIFCFile(scene, file, onProgress) {
  const loader = await initIFCLoader();

  // Remove modelo anterior
  if (_model) {
    scene.remove(_model);
    try {
      await loader.ifcManager.disposeMemory();
    } catch (_) { /* silencioso */ }
    _model = null;
  }

  const url = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (model) => {
        URL.revokeObjectURL(url);
        _model = model;
        model.castShadow = true;
        model.receiveShadow = true;
        scene.add(model);
        resolve({ model, modelID: model.modelID });
      },
      (xhr) => {
        if (onProgress && xhr.lengthComputable) {
          onProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      }
    );
  });
}

/**
 * Retorna o ExpressID a partir de um Raycaster hit.
 */
export function getExpressIdFromHit(hit) {
  if (!_loader || !hit?.object?.geometry || hit.faceIndex == null) return null;
  try {
    return _loader.ifcManager.getExpressId(hit.object.geometry, hit.faceIndex);
  } catch (_) {
    return null;
  }
}

/**
 * Aplica highlight (hover) em um elemento IFC.
 * @param {THREE.Scene} scene
 * @param {number|null} expressID  — null para limpar
 */
export async function applyHighlight(scene, expressID) {
  if (!_loader || !_model) return;
  try {
    if (expressID == null) {
      _loader.ifcManager.removeSubset(_model.modelID, HIGHLIGHT_MATERIAL, _highlightModelId);
      return;
    }
    await _loader.ifcManager.createSubset({
      modelID: _model.modelID,
      ids: [expressID],
      material: HIGHLIGHT_MATERIAL,
      scene,
      removePrevious: true,
      customID: _highlightModelId,
    });
  } catch (_) { /* silencioso */ }
}

/**
 * Aplica seleção (click) em um elemento IFC.
 * @param {THREE.Scene} scene
 * @param {number|null} expressID  — null para limpar
 */
export async function applySelection(scene, expressID) {
  if (!_loader || !_model) return;
  try {
    if (expressID == null) {
      _loader.ifcManager.removeSubset(_model.modelID, SELECT_MATERIAL, _selectModelId);
      return;
    }
    await _loader.ifcManager.createSubset({
      modelID: _model.modelID,
      ids: [expressID],
      material: SELECT_MATERIAL,
      scene,
      removePrevious: true,
      customID: _selectModelId,
    });
  } catch (_) { /* silencioso */ }
}

/** Getters de estado */
export const getLoader = () => _loader;
export const getModel = () => _model;
