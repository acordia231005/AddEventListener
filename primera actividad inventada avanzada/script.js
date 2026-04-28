/* ═══════════════════════════════════════════════════════
   Gestión de Alumnos — script.js
   ═══════════════════════════════════════════════════════ */

// ── Estado ────────────────────────────────────────────────────────────────
let students = JSON.parse(localStorage.getItem('gestion_students') || '[]');
let editingId = null;
let dragId = null;

// ── Paleta de avatares ────────────────────────────────────────────────────
const COLORS = [
    '#2a6ef5', '#e05c3a', '#1a8a5a', '#8b5cf6',
    '#d97706', '#0d9488', '#db2777', '#64748b',
];
const avatarColor = id => COLORS[id % COLORS.length];

// ── Utilidades ────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initials = name => name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
const newId = () => Date.now() + Math.floor(Math.random() * 999);

function save() {
    localStorage.setItem('gestion_students', JSON.stringify(students));
}

// ── Render ────────────────────────────────────────────────────────────────
function render() {
    const avail = students.filter(s => s.zone === 'available');
    const sel = students.filter(s => s.zone === 'selected');

    renderZone($('available-students'), avail, 'Aún no hay alumnos.<br>Pulsa "Añadir alumno" para empezar.');
    renderZone($('selected-students'), sel, 'Arrastra aquí a los alumnos<br>que quieras seleccionar.');

    $('badge-available').textContent = avail.length;
    $('badge-selected').textContent = sel.length;
    $('send-btn').disabled = sel.length === 0;
}

function renderZone(zone, list, emptyText) {
    zone.innerHTML = '';
    if (list.length === 0) {
        zone.innerHTML = `<p class="empty-msg">${emptyText}</p>`;
        return;
    }
    list.forEach(s => zone.appendChild(buildCard(s)));
}

// ── Construir tarjeta ─────────────────────────────────────────────────────
function buildCard(student) {
    const div = document.createElement('div');
    div.className = 'student-card';
    div.draggable = true;
    div.dataset.id = student.id;

    div.innerHTML = `
    <div class="card-avatar" style="background:${avatarColor(student.id)}">${initials(student.name)}</div>
    <div class="card-info">
      <span class="card-name">${esc(student.name)}</span>
      <span class="card-course">${esc(student.course)}</span>
    </div>
    <div class="card-actions">
      <button class="btn-icon" data-action="edit"   title="Editar">&#9998;</button>
      <button class="btn-icon danger" data-action="delete" title="Eliminar">&#128465;</button>
    </div>
  `;

    div.addEventListener('dragstart', onDragStart);
    div.addEventListener('dragend', onDragEnd);
    div.addEventListener('touchstart', onTouchStart, { passive: true });

    div.querySelector('[data-action=edit]').addEventListener('click', e => {
        e.stopPropagation(); openModal(student.id);
    });
    div.querySelector('[data-action=delete]').addEventListener('click', e => {
        e.stopPropagation(); deleteStudent(student.id);
    });

    return div;
}

// ── Drag & Drop (desktop) ─────────────────────────────────────────────────
function onDragStart(e) {
    dragId = parseInt(this.dataset.id);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragId);
}

function onDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    dragId = null;
}

function setupDropZones() {
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', e => {
            if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
        });
        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const id = parseInt(e.dataTransfer.getData('text/plain'));
            const newZone = zone.id === 'available-students' ? 'available' : 'selected';
            moveStudent(id, newZone);
        });
    });
}

function moveStudent(id, newZone) {
    const s = students.find(x => x.id === id);
    if (!s || s.zone === newZone) return;
    s.zone = newZone;
    save();
    render();
    toast(`${s.name} movido a ${newZone === 'selected' ? 'Seleccionados' : 'Disponibles'}`);
}

// ── Touch drag (mobile) ───────────────────────────────────────────────────
let touchCard = null;
let touchClone = null;
let touchId_ = null;

function onTouchStart(e) {
    const card = e.currentTarget;
    touchId_ = parseInt(card.dataset.id);

    touchClone = card.cloneNode(true);
    touchClone.style.cssText = `position:fixed;pointer-events:none;opacity:.7;z-index:999;width:${card.offsetWidth}px;transform:scale(1.03);transition:none;`;
    document.body.appendChild(touchClone);
    touchCard = card;
    card.classList.add('dragging');
    moveTouchClone(e.touches[0]);

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchEnd);
}

function moveTouchClone(touch) {
    if (!touchClone) return;
    touchClone.style.left = (touch.clientX - touchClone.offsetWidth / 2) + 'px';
    touchClone.style.top = (touch.clientY - touchClone.offsetHeight / 2) + 'px';
}

function onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    moveTouchClone(touch);
    document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const zone = el && el.closest('.drop-zone');
    if (zone) zone.classList.add('drag-over');
}

function onTouchEnd(e) {
    const touch = (e.changedTouches || e.touches)[0];
    if (touchClone) { touchClone.remove(); touchClone = null; }
    if (touchCard) { touchCard.classList.remove('dragging'); touchCard = null; }
    document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
    document.removeEventListener('touchcancel', onTouchEnd);
    if (!touch) return;
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const zone = el && el.closest('.drop-zone');
    if (!zone || !touchId_) return;
    const newZone = zone.id === 'available-students' ? 'available' : 'selected';
    moveStudent(touchId_, newZone);
    touchId_ = null;
}

// ── Modal ─────────────────────────────────────────────────────────────────
function openModal(id = null) {
    editingId = id;
    $('modal-title').textContent = id !== null ? 'Editar alumno' : 'Nuevo alumno';
    const s = id !== null ? students.find(x => x.id === id) : null;
    $('input-name').value = s ? s.name : '';
    $('input-course').value = s ? s.course : '';
    $('modal-overlay').classList.remove('hidden');
    $('student-modal').classList.remove('hidden');
    $('input-name').focus();
}

function closeModal() {
    $('modal-overlay').classList.add('hidden');
    $('student-modal').classList.add('hidden');
    editingId = null;
}

function saveModal() {
    const name = $('input-name').value.trim();
    const course = $('input-course').value.trim();
    if (!name || !course) { toast('Completa todos los campos', 'error'); return; }

    if (editingId !== null) {
        const s = students.find(x => x.id === editingId);
        s.name = name;
        s.course = course;
        toast('Alumno actualizado');
    } else {
        students.push({ id: newId(), name, course, zone: 'available' });
        toast('Alumno añadido');
    }
    save(); render(); closeModal();
}

function deleteStudent(id) {
    const s = students.find(x => x.id === id);
    if (!confirm(`¿Eliminar a "${s.name}"?`)) return;
    students = students.filter(x => x.id !== id);
    save(); render();
    toast('Alumno eliminado');
}

// ── Enviar selección ──────────────────────────────────────────────────────
function sendSelection() {
    const sel = students.filter(s => s.zone === 'selected');
    if (sel.length === 0) return;

    // Reemplaza este console.log con tu fetch() al backend
    console.log('Alumnos enviados:', sel);

    toast(`Enviado${sel.length > 1 ? 's' : ''}: ${sel.length} alumno${sel.length > 1 ? 's' : ''}`, 'ok');
}

// ── Toast ─────────────────────────────────────────────────────────────────
let toastTimer;
function toast(msg, type = '') {
    const t = $('toast');
    t.textContent = msg;
    t.className = `toast ${type} show`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupDropZones();
    render();

    $('add-student-btn').addEventListener('click', () => openModal());
    $('modal-save').addEventListener('click', saveModal);
    $('modal-cancel').addEventListener('click', closeModal);
    $('modal-close-x').addEventListener('click', closeModal);
    $('modal-overlay').addEventListener('click', closeModal);
    $('send-btn').addEventListener('click', sendSelection);

    $('student-modal').addEventListener('keydown', e => {
        if (e.key === 'Enter') saveModal();
        if (e.key === 'Escape') closeModal();
    });
});