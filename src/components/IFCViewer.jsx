// src/components/IFCViewer.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { initScene, fitCameraToModel } from '../lib/SceneSetup.js';
import {
  initIFCLoader,
  loadIFCFile,
  getExpressIdFromHit,
  applyHighlight,
  applySelection,
  getModel,
} from '../lib/IFCLoader.js';

import styles from './IFCViewer.module.css';

// ── Raycaster ─────────────────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
raycaster.firstHitOnly = true;
const mouse = new THREE.Vector2();

function getCanvasCoords(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

// ── Component ─────────────────────────────────────────────────────────────
export default function IFCViewer() {
  const containerRef = useRef(null);
  const sceneRef     = useRef(null);
  const fileInputRef = useRef(null);

  const [status, setStatus]       = useState('idle');   // idle | loading | ready | error
  const [progress, setProgress]   = useState(0);
  const [fileName, setFileName]   = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId]   = useRef(null) && useState(null);

  // ── Inicialização da cena ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const sceneObj = initScene(containerRef.current);
    sceneRef.current = sceneObj;

    // Pré-carrega o IFCLoader em background
    initIFCLoader().catch(console.error);

    return () => sceneObj.dispose();
  }, []);

  // ── Upload de arquivo IFC ──────────────────────────────────────────────
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('loading');
    setProgress(0);
    setSelectedId(null);
    setFileName(file.name);

    // Limpa seleção anterior
    if (sceneRef.current) {
      await applyHighlight(sceneRef.current.scene, null);
      await applySelection(sceneRef.current.scene, null);
    }

    try {
      const { model } = await loadIFCFile(
        sceneRef.current.scene,
        file,
        setProgress
      );

      fitCameraToModel(
        sceneRef.current.camera,
        sceneRef.current.controls,
        model
      );

      setStatus('ready');
    } catch (err) {
      console.error('[IFCViewer] Erro ao carregar IFC:', err);
      setStatus('error');
    }

    // Reset input para permitir re-upload do mesmo arquivo
    e.target.value = '';
  }, []);

  // ── Mouse Move — hover / highlight ────────────────────────────────────
  const handleMouseMove = useCallback(async (e) => {
    if (status !== 'ready' || !sceneRef.current) return;

    const { camera, renderer, scene } = sceneRef.current;
    const model = getModel();
    if (!model) return;

    getCanvasCoords(e, renderer.domElement);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(model, true);
    const hit  = hits[0] ?? null;

    const id = getExpressIdFromHit(hit);

    if (id !== hoveredId) {
      setHoveredId(id);  // local ref
      await applyHighlight(scene, id ?? null);
    }
  }, [status]);

  // ── Click — seleção ───────────────────────────────────────────────────
  const handleClick = useCallback(async (e) => {
    if (status !== 'ready' || !sceneRef.current) return;

    const { camera, renderer, scene } = sceneRef.current;
    const model = getModel();
    if (!model) return;

    getCanvasCoords(e, renderer.domElement);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(model, true);
    const hit  = hits[0] ?? null;

    const id = getExpressIdFromHit(hit);

    if (id != null) {
      setSelectedId(id);
      console.log(`[IFCViewer] Elemento selecionado — ExpressID: ${id}`);
    } else {
      setSelectedId(null);
    }

    await applySelection(scene, id ?? null);
  }, [status]);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className={styles.root}>
      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <header className={styles.toolbar}>
        <div className={styles.brand}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 12l10 5 10-5" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round" strokeOpacity="0.5"/>
          </svg>
          <span className={styles.brandName}>IFC<span>Viewer</span></span>
        </div>

        <button
          className={styles.uploadBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={status === 'loading'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <polyline points="17,8 12,3 7,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {status === 'loading' ? 'Carregando…' : 'Abrir arquivo IFC'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ifc"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Progress bar */}
        {status === 'loading' && (
          <div className={styles.progressWrap}>
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
            <span className={styles.progressLabel}>{progress}%</span>
          </div>
        )}

        {/* Nome do arquivo */}
        {status === 'ready' && fileName && (
          <span className={styles.fileTag}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <polyline points="20,6 9,17 4,12" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {fileName}
          </span>
        )}

        {/* Selected ID */}
        {selectedId != null && (
          <div className={styles.selectedTag}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            ExpressID&nbsp;<code>{selectedId}</code>
          </div>
        )}

        <div className={styles.hints}>
          <span title="Rotacionar">⟳ Orbit</span>
          <span title="Pan">⇔ Pan (dir)</span>
          <span title="Zoom">⊕ Scroll</span>
        </div>
      </header>

      {/* ── Viewport ──────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className={styles.viewport}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        {/* Placeholder vazio */}
        {status === 'idle' && (
          <div className={styles.placeholder}>
            <div className={styles.placeholderIcon}>
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="20" width="48" height="36" rx="3" stroke="#1f2d45" strokeWidth="2"/>
                <path d="M32 8L8 22v2l24-14 24 14v-2L32 8z" fill="#1f2d45"/>
                <path d="M32 14L12 26v16l20 12 20-12V26L32 14z" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round" strokeOpacity="0.5"/>
                <path d="M32 14L52 26M32 14L12 26M52 26v16M12 26v16M52 42L32 54M12 42L32 54M32 38V54M32 38L52 26M32 38L12 26" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.25"/>
              </svg>
            </div>
            <p className={styles.placeholderTitle}>Nenhum modelo carregado</p>
            <p className={styles.placeholderSub}>
              Clique em <strong>Abrir arquivo IFC</strong> para começar
            </p>
            <button
              className={styles.placeholderBtn}
              onClick={() => fileInputRef.current?.click()}
            >
              Selecionar arquivo .ifc
            </button>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className={styles.placeholder}>
            <div className={styles.placeholderIcon} style={{ color: '#ef4444' }}>⚠</div>
            <p className={styles.placeholderTitle} style={{ color: '#ef4444' }}>Erro ao carregar modelo</p>
            <p className={styles.placeholderSub}>Verifique se o arquivo é um IFC válido e tente novamente.</p>
            <button
              className={styles.placeholderBtn}
              onClick={() => { setStatus('idle'); fileInputRef.current?.click(); }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Axes legend (canto inferior esquerdo) */}
        {status === 'ready' && (
          <div className={styles.axesLegend}>
            <span style={{ color: '#ef4444' }}>■ X</span>
            <span style={{ color: '#22c55e' }}>■ Y</span>
            <span style={{ color: '#3b82f6' }}>■ Z</span>
          </div>
        )}
      </div>
    </div>
  );
}
