import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Inicializa y renderiza un tornillo 3D (Three.js) en un contenedor específico.
 * @param {string} containerId ID del contenedor donde se inyectará el canvas (ej. 'screw-container')
 * @param {string} skeletonId ID del skeleton screen a ocultar cuando termine la carga (ej. 'screw-skeleton')
 */
export function initScrew3D(containerId, skeletonId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Prevenir inicializaciones múltiples
    if (container.querySelector('canvas')) return;

    // --- ESCENA ---
    const scene = new THREE.Scene();
    // No set background to maintain transparency
    // scene.background = new THREE.Color(0x000000); 

    // --- CÁMARA ---
    // Usamos el ancho y alto del contenedor
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(4, 3, 6);

    // --- RENDERER ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true para fondo transparente
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limitar a 2 para rendimiento
    
    // CONFIGURACIÓN DE LUZ CRÍTICA
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.2; 
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    container.appendChild(renderer.domElement);

    // --- CONTROLES (UX) ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false; // Desactivar zoom para no bloquear el scroll de la web

    // --- ILUMINACIÓN SOBREEXPUESTA ---
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 2.5);
    sun.position.set(5, 10, 5);
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xffffff, 2);
    fill.position.set(-5, 2, 2);
    scene.add(fill);

    // Rim Light para resaltar las crestas (Dorado/Blanco)
    const rim = new THREE.PointLight(0xffffff, 2.5);
    rim.position.set(0, -2, -5);
    scene.add(rim);

    // --- MATERIAL DORADO METÁLICO (Premium Branding) ---
    const matPremium = new THREE.MeshStandardMaterial({
        color: 0xD4AF37, // Dorado Metálico
        metalness: 1.0,
        roughness: 0.15,
        flatShading: true 
    });

    const tornillo = new THREE.Group();

    // DIMENSIONES NORMALIZADAS
    const radioNucleo = 0.5; 
    const largoVastago = 4.0;
    const radioRoscaExterior = 0.68; 

    // 1. VÁSTAGO (NÚCLEO)
    const cuerpoGeo = new THREE.CylinderGeometry(radioNucleo, radioNucleo, largoVastago, 45);
    const cuerpo = new THREE.Mesh(cuerpoGeo, matPremium);
    tornillo.add(cuerpo);

    // 2. CABEZA HEXAGONAL
    const cabezaGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.7, 6);
    const cabeza = new THREE.Mesh(cabezaGeo, matPremium);
    cabeza.position.y = (largoVastago / 2) + 0.35;
    tornillo.add(cabeza);

    // 3. GENERADOR DE ROSCA MÉTRICA 60°
    function crearRoscaISO() {
        const vertices = [];
        const indices = [];
        const vueltas = 18; 
        const segs = 100; 
        const total = vueltas * segs;
        const paso = 3.6 / vueltas; 
        const yInicio = -1.8; 
        
        for (let i = 0; i <= total; i++) {
            const f = i / segs;
            const ang = f * Math.PI * 2;
            const yBase = yInicio + (f * paso);

            const c = Math.cos(ang);
            const s = Math.sin(ang);

            vertices.push(radioNucleo * c, yBase + 0.1, radioNucleo * s);
            vertices.push(radioNucleo * c, yBase - 0.1, radioNucleo * s);
            vertices.push(radioRoscaExterior * c, yBase, radioRoscaExterior * s);
        }

        for (let i = 0; i < total; i++) {
            const a = i * 3;
            const b = (i + 1) * 3;
            indices.push(a + 0, b + 0, a + 2);
            indices.push(b + 0, b + 2, a + 2);
            indices.push(a + 1, a + 2, b + 1);
            indices.push(b + 1, a + 2, b + 2);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geo.setIndex(indices);
        geo.computeVertexNormals();
        return new THREE.Mesh(geo, matPremium);
    }

    const rosca = crearRoscaISO();
    tornillo.add(rosca);

    // 4. PUNTA (BISEL FINAL)
    const puntaGeo = new THREE.CylinderGeometry(radioNucleo, 0.2, 0.2, 32);
    const punta = new THREE.Mesh(puntaGeo, matPremium);
    punta.position.y = -(largoVastago / 2) - 0.1;
    tornillo.add(punta);

    // Posición inicial
    tornillo.rotation.x = 0.2;
    scene.add(tornillo);

    // 5. INSCRIPCIÓN EN ALTO RELIEVE (TEXTO 3D CIRCULAR)
    const loader = new THREE.FontLoader();
    loader.load('https://unpkg.com/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json', function (font) {
        const texto = 'TORNILLERIA LA ROSCA II  •  '; 
        const radioTexto = 0.65; // Sobre la cara hexagonal
        
        const textoGroup = new THREE.Group();
        
        // Ubicación: Cara superior plana de la cabeza hexagonal
        // vastago es 4.0, cabeza está en Y = 2.35 y mide 0.7 de alto. Borde superior = 2.35 + 0.35 = 2.7
        textoGroup.position.y = (largoVastago / 2) + 0.7;
        
        const anguloPorLetra = (Math.PI * 2) / texto.length;

        for (let i = 0; i < texto.length; i++) {
            const char = texto[i];
            if (char === ' ') continue;

            const charGeo = new THREE.TextGeometry(char, {
                font: font,
                size: 0.12,
                height: 0.05, // Efecto ALTO RELIEVE real
                curveSegments: 3,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.005,
            });

            charGeo.computeBoundingBox();
            charGeo.center();

            const charMesh = new THREE.Mesh(charGeo, matPremium); // Mismo material
            
            const ang = i * anguloPorLetra;
            
            charMesh.position.x = Math.cos(ang) * radioTexto;
            charMesh.position.z = Math.sin(ang) * radioTexto;
            
            charMesh.rotation.x = -Math.PI / 2;
            charMesh.rotation.z = -ang - (Math.PI / 2); // Orientar la base de la letra hacia el centro

            textoGroup.add(charMesh);
        }
        
        tornillo.add(textoGroup);
    });

    // --- OPTIMIZACIÓN DE RENDIMIENTO (ResizeObserver) ---
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
        }
    });
    resizeObserver.observe(container);

    // --- ANIMACIÓN ---
    let frameId;
    let hasFadedIn = false;

    function animate() {
        frameId = requestAnimationFrame(animate);
        tornillo.rotation.y += 0.005; // Rotación suave
        controls.update();
        renderer.render(scene, camera);

        // Fade In y ocultar skeleton en el primer frame exitoso
        if (!hasFadedIn) {
            hasFadedIn = true;
            
            // Fade-in canvas
            container.style.opacity = '1';

            // Ocultar Skeleton
            const skeleton = document.getElementById(skeletonId);
            if (skeleton) {
                skeleton.style.opacity = '0';
                setTimeout(() => skeleton.remove(), 700);
            }
        }
    }

    animate();

    // Retornar una función de limpieza para prevenir memory leaks
    return () => {
        cancelAnimationFrame(frameId);
        resizeObserver.disconnect();
        container.innerHTML = '';
        renderer.dispose();
    };
}
