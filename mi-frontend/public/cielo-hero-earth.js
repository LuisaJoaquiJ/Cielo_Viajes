(function () {
  const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

  function loadThree(callback) {
    if (window.THREE) {
      callback();
      return;
    }

    const existing = document.querySelector('script[data-cielo-three]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = THREE_URL;
    script.async = true;
    script.dataset.cieloThree = 'true';
    script.onload = callback;
    document.head.appendChild(script);
  }

  function initHeroEarth() {
    const container = document.querySelector('.hero-earth-bg');
    if (!container || container.dataset.threeMounted === 'true' || !window.THREE) return;
    container.dataset.threeMounted = 'true';

    const THREE = window.THREE;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.12));
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.25);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    const loader = new THREE.TextureLoader();
    if (loader.setCrossOrigin) loader.setCrossOrigin('anonymous');
    const earthGeom = new THREE.SphereGeometry(2, 64, 64);
    const dayTexture = loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
    const nightTexture = loader.load('https://threejs.org/examples/textures/planets/earth_lights_2048.png');
    const specTexture = loader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
    const cloudTexture = loader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');

    const earth = new THREE.Mesh(earthGeom, new THREE.MeshPhongMaterial({
      map: dayTexture,
      specularMap: specTexture,
      specular: new THREE.Color('grey'),
      shininess: 5,
    }));
    const nightEarth = new THREE.Mesh(earthGeom, new THREE.MeshBasicMaterial({
      map: nightTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.58,
    }));
    nightEarth.scale.set(1.001, 1.001, 1.001);
    worldGroup.add(earth, nightEarth);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(2.03, 64, 64),
      new THREE.MeshPhongMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.36,
        blending: THREE.AdditiveBlending,
      })
    );
    worldGroup.add(clouds);

    worldGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(2.1, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x92d9ff,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
      })
    ));

    const hubs = [
      { lat: 4.711, lon: -74.072 },
      { lat: 40.712, lon: -74.006 },
      { lat: 51.507, lon: -0.127 },
      { lat: 25.204, lon: 55.27 },
      { lat: 35.676, lon: 139.65 },
      { lat: -33.868, lon: 151.209 },
    ];

    function latLonToVec3(lat, lon, radius) {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lon + 180) * Math.PI / 180;
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    const flightPaths = [];
    [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]].forEach(([from, to]) => {
      const p1 = latLonToVec3(hubs[from].lat, hubs[from].lon, 2.05);
      const p2 = latLonToVec3(hubs[to].lat, hubs[to].lon, 2.05);
      const dist = p1.distanceTo(p2);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5).normalize().multiplyScalar(2.05 + dist * 0.5);
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(50)),
        new THREE.LineBasicMaterial({
          color: 0x92d9ff,
          transparent: true,
          opacity: 0.3,
          blending: THREE.AdditiveBlending,
        })
      );
      worldGroup.add(line);
      flightPaths.push({ curve, localDest: p2.clone() });
    });

    function createJet() {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, 160, 160);
      ctx.shadowColor = 'rgba(0, 194, 255, 0.7)';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#f8fbff';
      ctx.strokeStyle = 'rgba(120, 220, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';

      // Top-view airplane silhouette. Nose points up; rotation is updated every frame.
      ctx.beginPath();
      ctx.moveTo(80, 16);
      ctx.lineTo(92, 70);
      ctx.lineTo(142, 96);
      ctx.lineTo(139, 111);
      ctx.lineTo(93, 100);
      ctx.lineTo(90, 126);
      ctx.lineTo(112, 143);
      ctx.lineTo(108, 151);
      ctx.lineTo(80, 139);
      ctx.lineTo(52, 151);
      ctx.lineTo(48, 143);
      ctx.lineTo(70, 126);
      ctx.lineTo(67, 100);
      ctx.lineTo(21, 111);
      ctx.lineTo(18, 96);
      ctx.lineTo(68, 70);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0, 194, 255, 0.65)';
      ctx.beginPath();
      ctx.ellipse(80, 55, 7, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(0.24, 0.24, 1);
      sprite.renderOrder = 20;
      return sprite;
    }

    const jet = createJet();
    worldGroup.add(jet);
    const trailPoints = [];
    const trailGeom = new THREE.BufferGeometry();
    const trailLine = new THREE.Line(
      trailGeom,
      new THREE.LineBasicMaterial({
        color: 0x00c2ff,
        transparent: true,
        opacity: 0.46,
        blending: THREE.AdditiveBlending,
      })
    );
    worldGroup.add(trailLine);

    let flightIndex = 0;
    let progress = 0;
    let targetCamZ = 6;
    let currentCamZ = 6;

    function resize() {
      const nextWidth = container.clientWidth || window.innerWidth;
      const nextHeight = container.clientHeight || window.innerHeight;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    }

    function animate() {
      requestAnimationFrame(animate);
      progress += 0.0025;
      if (progress > 1) {
        progress = 0;
        flightIndex = (flightIndex + 1) % flightPaths.length;
        trailPoints.length = 0;
      }

      const activePath = flightPaths[flightIndex];
      const pos = activePath.curve.getPoint(progress);
      const look = activePath.curve.getPoint(Math.min(progress + 0.01, 1));
      jet.position.copy(pos);

      trailPoints.unshift(pos.clone());
      if (trailPoints.length > 30) trailPoints.pop();
      trailGeom.setFromPoints(trailPoints);

      const destDir = activePath.localDest.clone().normalize();
      const targetQuat = new THREE.Quaternion().setFromUnitVectors(destDir, new THREE.Vector3(0, 0, 1));
      if (progress > 0.6) {
        const centerFactor = THREE.MathUtils.smoothstep((progress - 0.6) / 0.4, 0, 1);
        worldGroup.quaternion.slerp(targetQuat, 0.04 * centerFactor);
        targetCamZ = progress > 0.85 ? 3.4 : 6;
      } else {
        targetCamZ = 6;
        worldGroup.rotation.y += 0.0004;
      }

      currentCamZ += (targetCamZ - currentCamZ) * 0.02;
      camera.position.z = currentCamZ;
      camera.lookAt(0, 0, 0);

      const screenPos = worldGroup.localToWorld(pos.clone()).project(camera);
      const screenLook = worldGroup.localToWorld(look.clone()).project(camera);
      jet.material.rotation = Math.atan2(screenLook.y - screenPos.y, screenLook.x - screenPos.x) - Math.PI / 2;

      clouds.rotation.y += 0.00015;
      renderer.render(scene, camera);
    }

    window.addEventListener('resize', resize);
    animate();
  }

  function boot() {
    loadThree(initHeroEarth);
    let ticks = 0;
    const timer = window.setInterval(() => {
      loadThree(initHeroEarth);
      ticks += 1;
      if (ticks > 40 || document.querySelector('.hero-earth-bg[data-three-mounted="true"]')) {
        window.clearInterval(timer);
      }
    }, 250);
  }

  const start = () => window.setTimeout(boot, 1800);

  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start, { once: true });
  }
})();
