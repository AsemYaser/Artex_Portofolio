/* ============================================
   ARTEX DASHBOARD — Firebase + Cloudinary Logic
   ============================================
   Auth & Database: Firebase (Auth + Firestore)
   Image Hosting:   Cloudinary (Unsigned Uploads)
   Scene Previews:  Pannellum (Visual Hotspot Picker)
   ============================================ */

// ===== FIREBASE REFERENCES =====
const auth = firebase.auth();
const db = firebase.firestore();

// ===== CLOUDINARY CONFIG =====
const CLOUDINARY_CLOUD_NAME = 'duahf1zvx';
const CLOUDINARY_UPLOAD_PRESET = 'shmgkd6y';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// ===== STATE =====
let allProjects = [];
let editingProjectId = null;
let isProjectType360 = false;

// Pending files for upload
let pendingHeroFile = null;
let pendingGalleryFiles = [];   // { file, previewUrl }
let existingGalleryUrls = [];   // URLs already in Firestore (for edit mode)
let existingHeroUrl = null;

// 360° scenes state
let scenesState = [];
let deletingProjectId = null;

// ===== SCENE PREVIEW & HOTSPOT PICKER STATE =====
let sceneViewers = {};        // { sceneIndex: pannellumViewer }
let markerIds = {};            // { sceneIndex: Set<string> }
let pickingState = null;       // { sceneIndex, hotspotIndex } or null
let mouseDownPos = null;       // For differentiating click vs drag

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {

  // --- Auth State Listener ---
  auth.onAuthStateChanged(user => {
    if (user) {
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('dashboardScreen').classList.add('active');
      document.getElementById('userEmail').textContent = user.email;
      document.getElementById('userAvatar').textContent = user.email.charAt(0).toUpperCase();
      loadProjects();
    } else {
      document.getElementById('loginScreen').style.display = 'flex';
      document.getElementById('dashboardScreen').classList.remove('active');
    }
  });

  // --- Login Form ---
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    try {
      btn.disabled = true;
      btn.textContent = 'Signing in...';
      errorEl.classList.remove('visible');
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      errorEl.textContent = getAuthError(err.code);
      errorEl.classList.add('visible');
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });

  // --- Logout ---
  document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut();
  });

  // --- Mobile Menu ---
  document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('active');
  });
  document.getElementById('sidebarOverlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
  });

  // --- File Input Listeners ---
  setupFileInputs();
});

function getAuthError(code) {
  const errors = {
    'auth/invalid-email': 'Invalid email address format.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
  };
  return errors[code] || 'Sign in failed. Please try again.';
}

// ===== FILE INPUT SETUP =====
function setupFileInputs() {
  const heroInput = document.getElementById('heroFileInput');
  const heroZone = document.getElementById('heroUploadZone');

  heroInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      pendingHeroFile = e.target.files[0];
      renderHeroPreview();
    }
  });

  setupDragDrop(heroZone, (files) => {
    if (files[0]) {
      pendingHeroFile = files[0];
      renderHeroPreview();
    }
  });

  const galleryInput = document.getElementById('galleryFileInput');
  const galleryZone = document.getElementById('galleryUploadZone');

  galleryInput.addEventListener('change', (e) => {
    Array.from(e.target.files).forEach(f => {
      pendingGalleryFiles.push({ file: f, previewUrl: URL.createObjectURL(f) });
    });
    renderGalleryPreviews();
  });

  setupDragDrop(galleryZone, (files) => {
    Array.from(files).forEach(f => {
      pendingGalleryFiles.push({ file: f, previewUrl: URL.createObjectURL(f) });
    });
    renderGalleryPreviews();
  });
}

function setupDragDrop(zone, onDrop) {
  ['dragenter', 'dragover'].forEach(evt => {
    zone.addEventListener(evt, (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  });
  ['dragleave', 'drop'].forEach(evt => {
    zone.addEventListener(evt, (e) => { e.preventDefault(); zone.classList.remove('drag-over'); });
  });
  zone.addEventListener('drop', (e) => { onDrop(e.dataTransfer.files); });
}

// ===== PREVIEWS =====
function renderHeroPreview() {
  const container = document.getElementById('heroPreviews');
  container.innerHTML = '';
  const url = pendingHeroFile ? URL.createObjectURL(pendingHeroFile) : existingHeroUrl;
  if (url) {
    container.innerHTML = `
      <div class="preview-item">
        <img src="${url}" alt="Hero preview">
        <button class="remove-preview" onclick="removeHero()" title="Remove">✕</button>
      </div>`;
  }
}

function removeHero() {
  pendingHeroFile = null;
  existingHeroUrl = null;
  document.getElementById('heroFileInput').value = '';
  renderHeroPreview();
}

function renderGalleryPreviews() {
  const container = document.getElementById('galleryPreviews');
  container.innerHTML = '';
  existingGalleryUrls.forEach((url, i) => {
    container.innerHTML += `
      <div class="preview-item">
        <img src="${url}" alt="Gallery ${i + 1}">
        <button class="remove-preview" onclick="removeExistingGallery(${i})" title="Remove">✕</button>
      </div>`;
  });
  pendingGalleryFiles.forEach((item, i) => {
    container.innerHTML += `
      <div class="preview-item">
        <img src="${item.previewUrl}" alt="New ${i + 1}">
        <button class="remove-preview" onclick="removePendingGallery(${i})" title="Remove">✕</button>
      </div>`;
  });
}

function removeExistingGallery(index) {
  existingGalleryUrls.splice(index, 1);
  renderGalleryPreviews();
}

function removePendingGallery(index) {
  URL.revokeObjectURL(pendingGalleryFiles[index].previewUrl);
  pendingGalleryFiles.splice(index, 1);
  renderGalleryPreviews();
}

// ===== VIEW MANAGEMENT =====
function showListView() {
  document.getElementById('listView').style.display = 'block';
  document.getElementById('formView').classList.remove('active');
  document.getElementById('mainTitle').innerHTML = 'All <span>Projects</span>';
  document.getElementById('headerAddBtn').style.display = '';
  document.getElementById('navProjects').classList.add('active');
  document.getElementById('navAddNew').classList.remove('active');
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
  destroyAllSceneViewers();
  loadProjects();
}

function showFormView(projectId) {
  document.getElementById('listView').style.display = 'none';
  document.getElementById('formView').classList.add('active');
  document.getElementById('headerAddBtn').style.display = 'none';
  document.getElementById('navProjects').classList.remove('active');
  document.getElementById('navAddNew').classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');

  if (projectId) {
    editingProjectId = projectId;
    document.getElementById('mainTitle').innerHTML = 'Edit <span>Project</span>';
    populateFormForEdit(projectId);
  } else {
    editingProjectId = null;
    document.getElementById('mainTitle').innerHTML = 'New <span>Project</span>';
    resetForm();
  }
}

function resetForm() {
  document.getElementById('projTitle').value = '';
  document.getElementById('projCategory').value = 'Residential';
  document.getElementById('projStyle').value = '';
  document.getElementById('projYear').value = new Date().getFullYear().toString();
  document.getElementById('projClient').value = '';
  document.getElementById('projDesc1').value = '';
  document.getElementById('projDesc2').value = '';
  pendingHeroFile = null;
  existingHeroUrl = null;
  pendingGalleryFiles = [];
  existingGalleryUrls = [];
  scenesState = [];
  isProjectType360 = false;
  pickingState = null;
  destroyAllSceneViewers();
  document.getElementById('heroFileInput').value = '';
  document.getElementById('galleryFileInput').value = '';
  renderHeroPreview();
  renderGalleryPreviews();
  renderScenes();
  setProjectType('normal');
}

async function populateFormForEdit(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) { showToast('Project not found', 'error'); showListView(); return; }

  document.getElementById('projTitle').value = project.title || '';
  document.getElementById('projCategory').value = project.category || 'Residential';
  document.getElementById('projStyle').value = project.style || '';
  document.getElementById('projYear').value = project.year || '';
  document.getElementById('projClient').value = project.client || '';
  document.getElementById('projDesc1').value = project.desc1 || '';
  document.getElementById('projDesc2').value = project.desc2 || '';

  pendingHeroFile = null;
  existingHeroUrl = project.heroImg || null;
  renderHeroPreview();

  pendingGalleryFiles = [];
  existingGalleryUrls = project.images ? [...project.images] : [];
  renderGalleryPreviews();

  if (project.is360) {
    setProjectType('360');
    scenesState = [];
    if (project.scenes) {
      Object.entries(project.scenes).forEach(([sceneId, scene]) => {
        scenesState.push({
          id: sceneId,
          label: scene.label || '',
          pitch: scene.defaultPitch || 0,
          yaw: scene.defaultYaw || 0,
          imageFile: null,
          imageUrl: scene.image || '',
          hotspots: (scene.hotspots || []).map(h => ({
            pitch: h.pitch || 0,
            yaw: h.yaw || 0,
            target: h.targetScene || '',
            label: h.label || ''
          }))
        });
      });
    }
    renderScenes();
  } else {
    setProjectType('normal');
    scenesState = [];
    renderScenes();
  }
}

// ===== PROJECT TYPE TOGGLE =====
function setProjectType(type) {
  isProjectType360 = type === '360';
  document.querySelectorAll('.type-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
  document.getElementById('imagesSection').style.display = isProjectType360 ? 'none' : '';
  document.getElementById('scenesSection').classList.toggle('active', isProjectType360);
}

// ===== LOAD PROJECTS =====
async function loadProjects() {
  const grid = document.getElementById('projectsListGrid');
  grid.innerHTML = '<div class="loading-container"><div class="spinner"></div></div>';

  try {
    const snapshot = await db.collection('projects').orderBy('createdAt', 'desc').get();
    allProjects = [];
    snapshot.forEach(doc => { allProjects.push({ id: doc.id, ...doc.data() }); });
    renderProjectsList();
  } catch (err) {
    console.error('Load error:', err);
    grid.innerHTML = '<div class="empty-state"><h3>Failed to load projects</h3><p>' + err.message + '</p></div>';
    showToast('Failed to load projects', 'error');
  }
}

function renderProjectsList() {
  const grid = document.getElementById('projectsListGrid');
  if (allProjects.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <h3>No Projects Yet</h3>
        <p>Click "Add Project" to create your first project</p>
      </div>`;
    return;
  }
  grid.innerHTML = allProjects.map((p, i) => `
    <div class="dash-card" style="animation-delay: ${i * 0.05}s">
      <div class="dash-card-img">
        <img src="${p.heroImg || 'images/logo.png'}" alt="${escapeHtml(p.title)}" loading="lazy" onerror="this.src='images/logo.png'">
        ${p.is360 ? '<span class="dash-card-badge">360° TOUR</span>' : ''}
      </div>
      <div class="dash-card-body">
        <h3>${escapeHtml(p.title)}</h3>
        <span class="dash-card-category">${escapeHtml(p.category)}</span>
      </div>
      <div class="dash-card-actions">
        <button class="btn btn-sm btn-outline" onclick="editProject('${p.id}')">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button class="btn btn-sm btn-outline" onclick="confirmDelete('${p.id}')" style="border-color: rgba(231,76,60,0.3); color: var(--danger);">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          Delete
        </button>
      </div>
    </div>`).join('');
}

function editProject(id) { showFormView(id); }

// ===== CLOUDINARY UPLOAD =====
async function uploadToCloudinary(file, folder) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_UPLOAD_URL);
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText).secure_url);
      } else {
        try { reject(new Error(JSON.parse(xhr.responseText).error?.message || `Upload failed (${xhr.status})`)); }
        catch { reject(new Error(`Upload failed with status ${xhr.status}`)); }
      }
    });
    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.send(formData);
  });
}

// ===== SAVE PROJECT =====
async function saveProject() {
  const title = document.getElementById('projTitle').value.trim();
  const category = document.getElementById('projCategory').value;
  const style = document.getElementById('projStyle').value.trim();
  const year = document.getElementById('projYear').value.trim();
  const client = document.getElementById('projClient').value.trim();
  const desc1 = document.getElementById('projDesc1').value.trim();
  const desc2 = document.getElementById('projDesc2').value.trim();

  if (!title) { showToast('Please enter a project title', 'error'); return; }

  const saveBtn = document.getElementById('saveProjectBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div> Saving...';

  const progressEl = document.getElementById('overallProgress');
  const progressFill = document.getElementById('progressBarFill');
  const progressText = document.getElementById('progressText');
  progressEl.style.display = 'block';

  try {
    const projectId = editingProjectId || db.collection('projects').doc().id;
    const cloudinaryFolder = `artex-projects/${projectId}`;

    let uploadedCount = 0;
    let totalUploads = 0;
    if (pendingHeroFile) totalUploads++;
    totalUploads += pendingGalleryFiles.length;
    if (isProjectType360) { scenesState.forEach(s => { if (s.imageFile) totalUploads++; }); }

    function updateOverallProgress() {
      uploadedCount++;
      const pct = totalUploads > 0 ? Math.round((uploadedCount / totalUploads) * 100) : 100;
      progressFill.style.width = pct + '%';
      progressText.textContent = `Uploading... ${pct}%`;
    }

    let heroImgUrl = existingHeroUrl || '';
    if (pendingHeroFile) {
      progressText.textContent = 'Uploading hero image...';
      heroImgUrl = await uploadToCloudinary(pendingHeroFile, cloudinaryFolder);
      updateOverallProgress();
    }

    let finalGalleryUrls = [...existingGalleryUrls];
    for (let i = 0; i < pendingGalleryFiles.length; i++) {
      progressText.textContent = `Uploading gallery ${i + 1} of ${pendingGalleryFiles.length}...`;
      const url = await uploadToCloudinary(pendingGalleryFiles[i].file, `${cloudinaryFolder}/gallery`);
      finalGalleryUrls.push(url);
      updateOverallProgress();
    }

    const projectData = {
      title, category, style, year, client, desc1, desc2,
      heroImg: heroImgUrl,
      images: finalGalleryUrls,
      is360: isProjectType360,
      scenes: null,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (isProjectType360) {
      const scenesObj = {};
      for (const scene of scenesState) {
        let sceneImageUrl = scene.imageUrl || '';
        if (scene.imageFile) {
          progressText.textContent = `Uploading scene: ${scene.label || scene.id}...`;
          sceneImageUrl = await uploadToCloudinary(scene.imageFile, `${cloudinaryFolder}/scenes`);
          updateOverallProgress();
        }
        scenesObj[scene.id] = {
          image: sceneImageUrl,
          label: scene.label,
          defaultPitch: parseFloat(scene.pitch) || 0,
          defaultYaw: parseFloat(scene.yaw) || 0,
          hotspots: scene.hotspots.map(h => ({
            pitch: parseFloat(h.pitch) || 0,
            yaw: parseFloat(h.yaw) || 0,
            targetScene: h.target,
            label: h.label
          }))
        };
      }
      projectData.scenes = scenesObj;
      projectData.heroImg = heroImgUrl || (scenesState[0] ? (scenesState[0].imageUrl || '') : '');
      projectData.images = [projectData.heroImg];
    }

    progressText.textContent = 'Saving to database...';
    if (editingProjectId) {
      await db.collection('projects').doc(projectId).update(projectData);
    } else {
      projectData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('projects').doc(projectId).set(projectData);
    }

    progressFill.style.width = '100%';
    progressText.textContent = 'Done!';
    showToast(editingProjectId ? 'Project updated successfully!' : 'Project created successfully!', 'success');

    setTimeout(() => {
      progressEl.style.display = 'none';
      progressFill.style.width = '0%';
      showListView();
    }, 800);

  } catch (err) {
    console.error('Save error:', err);
    showToast('Failed to save: ' + err.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      Save Project`;
  }
}

// ===== DELETE PROJECT =====
function confirmDelete(projectId) {
  deletingProjectId = projectId;
  const project = allProjects.find(p => p.id === projectId);
  document.getElementById('deleteProjectTitle').textContent = project ? project.title : 'this project';
  document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  deletingProjectId = null;
}

async function executeDelete() {
  if (!deletingProjectId) return;
  const btn = document.getElementById('confirmDeleteBtn');
  btn.disabled = true;
  btn.textContent = 'Deleting...';
  try {
    await db.collection('projects').doc(deletingProjectId).delete();
    showToast('Project deleted successfully', 'success');
    closeDeleteModal();
    loadProjects();
  } catch (err) {
    console.error('Delete error:', err);
    showToast('Failed to delete: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Delete';
  }
}

// =============================================
//  360° SCENES BUILDER + VISUAL HOTSPOT PICKER
// =============================================

function addScene() {
  scenesState.push({
    id: 'scene-' + (scenesState.length + 1),
    label: '',
    pitch: 0,
    yaw: 0,
    imageFile: null,
    imageUrl: '',
    hotspots: []
  });
  renderScenes();
}

function removeScene(index) {
  destroySceneViewer(index);
  scenesState.splice(index, 1);
  exitPickMode();
  renderScenes();
}

function toggleScene(index) {
  const card = document.querySelector(`.scene-card[data-index="${index}"]`);
  if (!card) return;
  card.classList.toggle('open');

  // Lazy-init: create panorama viewer when card is opened
  if (card.classList.contains('open') && scenesState[index]?.imageUrl) {
    // Short delay to let the DOM expand first (so container has dimensions)
    setTimeout(() => initSceneViewer(index), 100);
  }
}

function addHotspot(sceneIndex) {
  scenesState[sceneIndex].hotspots.push({ pitch: 0, yaw: 0, target: '', label: '' });
  // Save open state
  const openScenes = getOpenSceneIndices();
  renderScenes();
  restoreOpenScenes(openScenes);
}

function removeHotspot(sceneIndex, hotspotIndex) {
  scenesState[sceneIndex].hotspots.splice(hotspotIndex, 1);
  exitPickMode();
  const openScenes = getOpenSceneIndices();
  renderScenes();
  restoreOpenScenes(openScenes);
}

function updateSceneField(index, field, value) {
  if (scenesState[index]) scenesState[index][field] = value;
}

function updateHotspotField(sceneIndex, hotspotIndex, field, value) {
  if (scenesState[sceneIndex]?.hotspots[hotspotIndex]) {
    scenesState[sceneIndex].hotspots[hotspotIndex][field] = value;
    // If pitch or yaw changed, refresh markers on the preview
    if ((field === 'pitch' || field === 'yaw') && sceneViewers[sceneIndex]) {
      refreshSceneMarkers(sceneIndex);
    }
  }
}

function handleSceneImage(index, file) {
  if (!file || !scenesState[index]) return;

  // Destroy old viewer for this scene
  destroySceneViewer(index);

  scenesState[index].imageFile = file;
  scenesState[index].imageUrl = URL.createObjectURL(file);

  const openScenes = getOpenSceneIndices();
  openScenes.add(index); // Ensure this scene opens after re-render
  renderScenes();
  restoreOpenScenes(openScenes);
}

// ===== OPEN/CLOSE STATE HELPERS =====
function getOpenSceneIndices() {
  const open = new Set();
  document.querySelectorAll('.scene-card.open').forEach(c => open.add(parseInt(c.dataset.index)));
  return open;
}

function restoreOpenScenes(openSet) {
  setTimeout(() => {
    openSet.forEach(i => {
      const card = document.querySelector(`.scene-card[data-index="${i}"]`);
      if (card) {
        card.classList.add('open');
        // Init viewer if scene has image
        if (scenesState[i]?.imageUrl) {
          setTimeout(() => initSceneViewer(i), 100);
        }
      }
    });
  }, 10);
}

// ===== SCENE VIEWER MANAGEMENT =====
function destroySceneViewer(index) {
  if (sceneViewers[index]) {
    try { sceneViewers[index].destroy(); } catch (e) {}
    delete sceneViewers[index];
    delete markerIds[index];
  }
}

function destroyAllSceneViewers() {
  Object.keys(sceneViewers).forEach(i => destroySceneViewer(parseInt(i)));
  sceneViewers = {};
  markerIds = {};
}

function initSceneViewer(sceneIndex) {
  const scene = scenesState[sceneIndex];
  if (!scene || !scene.imageUrl) return;

  // If already initialized with the same image, just resize
  if (sceneViewers[sceneIndex]) {
    try { sceneViewers[sceneIndex].resize(); } catch (e) {}
    return;
  }

  const container = document.getElementById(`scenePreview-${sceneIndex}`);
  if (!container || container.offsetHeight === 0) return;

  const viewer = pannellum.viewer(container, {
    type: 'equirectangular',
    panorama: scene.imageUrl,
    autoLoad: true,
    showControls: false,
    showZoomCtrl: false,
    showFullscreenCtrl: false,
    compass: false,
    mouseZoom: true,
    hfov: 110,
    minHfov: 50,
    maxHfov: 120,
    hotSpots: []
  });

  sceneViewers[sceneIndex] = viewer;
  markerIds[sceneIndex] = new Set();

  // Add existing hotspot markers once loaded
  viewer.on('load', () => {
    refreshSceneMarkers(sceneIndex);
  });

  // Click-to-place handler (differentiate from drag)
  let mDown = null;
  container.addEventListener('mousedown', (e) => {
    mDown = { x: e.clientX, y: e.clientY };
  });

  container.addEventListener('mouseup', (e) => {
    if (!pickingState || pickingState.sceneIndex !== sceneIndex) { mDown = null; return; }
    if (!mDown) return;

    // Only trigger on click (not drag) – 5px threshold
    const dx = Math.abs(e.clientX - mDown.x);
    const dy = Math.abs(e.clientY - mDown.y);
    mDown = null;

    if (dx > 5 || dy > 5) return; // Was a drag, ignore

    const coords = viewer.mouseEventToCoords(e);
    if (!coords) return;

    const [pitch, yaw] = coords;
    const hi = pickingState.hotspotIndex;

    // Update state
    scenesState[sceneIndex].hotspots[hi].pitch = pitch.toFixed(2);
    scenesState[sceneIndex].hotspots[hi].yaw = yaw.toFixed(2);

    // Update input fields directly (no full re-render!)
    const row = document.querySelector(`.hotspot-row[data-scene="${sceneIndex}"][data-hotspot="${hi}"]`);
    if (row) {
      const pitchInput = row.querySelector('.hs-pitch');
      const yawInput = row.querySelector('.hs-yaw');
      if (pitchInput) pitchInput.value = pitch.toFixed(2);
      if (yawInput) yawInput.value = yaw.toFixed(2);
    }

    // Refresh markers on preview
    refreshSceneMarkers(sceneIndex);

    // Exit pick mode
    exitPickMode();
    showToast(`Hotspot ${hi + 1} placed — Pitch: ${pitch.toFixed(1)}°, Yaw: ${yaw.toFixed(1)}°`, 'success');
  });
}

// ===== REFRESH MARKERS ON PREVIEW =====
function refreshSceneMarkers(sceneIndex) {
  const viewer = sceneViewers[sceneIndex];
  if (!viewer) return;

  const scene = scenesState[sceneIndex];
  if (!scene) return;

  // Remove old markers
  const oldIds = markerIds[sceneIndex] || new Set();
  oldIds.forEach(id => {
    try { viewer.removeHotSpot(id); } catch (e) {}
  });

  const newIds = new Set();

  // Add current hotspot markers
  scene.hotspots.forEach((hs, hi) => {
    const p = parseFloat(hs.pitch);
    const y = parseFloat(hs.yaw);
    if (isNaN(p) && isNaN(y)) return;

    const id = `marker-${sceneIndex}-${hi}`;
    newIds.add(id);

    try {
      viewer.addHotSpot({
        id: id,
        pitch: p || 0,
        yaw: y || 0,
        type: 'custom',
        cssClass: 'preview-marker',
        createTooltipFunc: (div) => {
          div.innerHTML = `<div class="marker-dot">${hi + 1}</div>`;
          div.title = hs.label || `Hotspot ${hi + 1}`;
        },
        createTooltipArgs: ''
      });
    } catch (e) {}
  });

  markerIds[sceneIndex] = newIds;
}

// ===== PICK MODE =====
function startPicking(sceneIndex, hotspotIndex) {
  // Must have a viewer
  if (!sceneViewers[sceneIndex]) {
    showToast('Upload a panorama image first, then try picking', 'error');
    return;
  }

  // Exit previous pick mode if any
  exitPickMode();

  pickingState = { sceneIndex, hotspotIndex };

  // Highlight the preview container
  const container = document.getElementById(`scenePreview-${sceneIndex}`);
  if (container) container.classList.add('picking-active');

  // Show hint
  const hint = document.getElementById(`pickHint-${sceneIndex}`);
  if (hint) hint.classList.add('visible');

  // Highlight the pick button
  const btn = document.querySelector(`.btn-pick[data-scene="${sceneIndex}"][data-hotspot="${hotspotIndex}"]`);
  if (btn) { btn.classList.add('active'); btn.textContent = '🎯 Picking...'; }
}

function exitPickMode() {
  if (!pickingState) return;

  const { sceneIndex, hotspotIndex } = pickingState;

  // Remove highlight from preview
  const container = document.getElementById(`scenePreview-${sceneIndex}`);
  if (container) container.classList.remove('picking-active');

  // Hide hint
  const hint = document.getElementById(`pickHint-${sceneIndex}`);
  if (hint) hint.classList.remove('visible');

  // Reset pick button
  const btn = document.querySelector(`.btn-pick[data-scene="${sceneIndex}"][data-hotspot="${hotspotIndex}"]`);
  if (btn) { btn.classList.remove('active'); btn.textContent = '📍 Pick'; }

  pickingState = null;
}

// ===== RENDER SCENES =====
function renderScenes() {
  // Destroy all viewers before DOM rebuild
  destroyAllSceneViewers();
  exitPickMode();

  const container = document.getElementById('scenesContainer');
  if (!container) return;

  if (scenesState.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 12px 0;">No scenes added yet. Click "Add Scene" to create your first 360° scene.</p>';
    return;
  }

  container.innerHTML = scenesState.map((scene, si) => `
    <div class="scene-card" data-index="${si}">
      <div class="scene-header" onclick="toggleScene(${si})">
        <span class="scene-header-title">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg>
          ${escapeHtml(scene.label || scene.id || 'Untitled Scene')}
        </span>
        <div class="scene-header-actions">
          <button class="btn-icon" onclick="event.stopPropagation(); removeScene(${si})" title="Remove Scene">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
          <svg class="chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div class="scene-body">
        <div class="form-row">
          <div class="form-group">
            <label>Scene ID (slug)</label>
            <input type="text" class="form-input" value="${escapeHtml(scene.id)}"
                   onchange="updateSceneField(${si}, 'id', this.value)" placeholder="e.g. reception">
          </div>
          <div class="form-group">
            <label>Scene Label</label>
            <input type="text" class="form-input" value="${escapeHtml(scene.label)}"
                   onchange="updateSceneField(${si}, 'label', this.value)" placeholder="e.g. Reception & Dining">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Default Pitch</label>
            <input type="number" class="form-input" value="${scene.pitch}" step="0.1"
                   onchange="updateSceneField(${si}, 'pitch', this.value)">
          </div>
          <div class="form-group">
            <label>Default Yaw</label>
            <input type="number" class="form-input" value="${scene.yaw}" step="0.1"
                   onchange="updateSceneField(${si}, 'yaw', this.value)">
          </div>
        </div>

        <!-- Image Upload -->
        <div class="form-group">
          <label>360° Panorama Image</label>
          <div class="upload-zone" ondragover="event.preventDefault(); this.classList.add('drag-over')"
               ondragleave="this.classList.remove('drag-over')"
               ondrop="event.preventDefault(); this.classList.remove('drag-over'); handleSceneImage(${si}, event.dataTransfer.files[0])">
            <input type="file" accept="image/*" onchange="handleSceneImage(${si}, this.files[0])">
            <svg class="upload-zone-icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p>Drop equirectangular panorama or click to browse</p>
          </div>
        </div>

        <!-- SCENE PREVIEW (Pannellum Viewer) — only when image exists -->
        ${scene.imageUrl ? `
          <div class="scene-preview-wrapper">
            <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 8px;">
              Interactive Preview — Click to place hotspots
            </label>
            <div class="scene-preview-container" id="scenePreview-${si}"></div>
            <div class="pick-hint" id="pickHint-${si}">🎯 Click anywhere on the panorama to place the hotspot</div>
          </div>
        ` : ''}

        <!-- Hotspots -->
        <div class="hotspots-header">
          <h4>Hotspots (${scene.hotspots.length})</h4>
          <button type="button" class="btn btn-sm btn-outline" onclick="addHotspot(${si})">+ Add Hotspot</button>
        </div>
        ${scene.hotspots.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.82rem;">No hotspots. Add one and use "📍 Pick" to visually place it on the panorama.</p>' : ''}
        ${scene.hotspots.map((hs, hi) => `
          <div class="hotspot-row" data-scene="${si}" data-hotspot="${hi}">
            <button type="button" class="btn-pick" data-scene="${si}" data-hotspot="${hi}"
                    onclick="startPicking(${si}, ${hi})" title="Pick location on panorama">📍 Pick</button>
            <input type="number" class="form-input hs-pitch" value="${hs.pitch}" step="0.01" placeholder="Pitch"
                   onchange="updateHotspotField(${si}, ${hi}, 'pitch', this.value)">
            <input type="number" class="form-input hs-yaw" value="${hs.yaw}" step="0.01" placeholder="Yaw"
                   onchange="updateHotspotField(${si}, ${hi}, 'yaw', this.value)">
            <input type="text" class="form-input" value="${escapeHtml(hs.target)}" placeholder="Target scene ID"
                   onchange="updateHotspotField(${si}, ${hi}, 'target', this.value)">
            <input type="text" class="form-input" value="${escapeHtml(hs.label)}" placeholder="Label"
                   onchange="updateHotspotField(${si}, ${hi}, 'label', this.value)">
            <button class="btn-icon" onclick="removeHotspot(${si}, ${hi})" title="Remove hotspot">
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success'
    ? '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    : '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  toast.innerHTML = icon + '<span>' + escapeHtml(message) + '</span>';
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ===== UTILITY =====
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
