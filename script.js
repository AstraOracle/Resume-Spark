// Resume Builder JS

const formSections = document.getElementById('form-sections');
const preview = document.getElementById('preview');
const addSectionBtn = document.getElementById('add-section-btn');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const clearBtn = document.getElementById('clear-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const themeSelect = document.getElementById('theme-select');
const previewDiv = document.getElementById('preview');

let sections = [
  { id: generateId(), title: 'Contact Info', fields: [
    { type: 'text', label: 'Name', name: 'name' },
    { type: 'email', label: 'Email', name: 'email' },
    { type: 'tel', label: 'Phone', name: 'phone' },
  ]},
  { id: generateId(), title: 'Skills', fields: [
    { type: 'textarea', label: 'Skills (comma separated)', name: 'skills' },
  ]},
  { id: generateId(), title: 'Experience', fields: [
    { type: 'textarea', label: 'Experience', name: 'experience' },
  ]},
  { id: generateId(), title: 'Education', fields: [
    { type: 'textarea', label: 'Education', name: 'education' },
  ]},
];

let formData = {};

// Generate a unique ID for sections
function generateId() {
  return 'id-' + Math.random().toString(36).substr(2, 9);
}

// Render all sections in the form
function renderSections() {
  formSections.innerHTML = '';
  sections.forEach((section, index) => {
    const sectionEl = document.createElement('div');
    sectionEl.classList.add('section');
    sectionEl.setAttribute('draggable', 'true');
    sectionEl.dataset.id = section.id;

    // Drag events
    sectionEl.addEventListener('dragstart', dragStart);
    sectionEl.addEventListener('dragover', dragOver);
    sectionEl.addEventListener('drop', drop);
    sectionEl.addEventListener('dragend', dragEnd);

    // Section header
    const header = document.createElement('div');
    header.classList.add('section-header');

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = section.title;
    titleInput.classList.add('title-input');
    titleInput.addEventListener('input', e => {
      section.title = e.target.value;
      updatePreview();
    });
    header.appendChild(titleInput);

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('remove-btn');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      sections.splice(index, 1);
      renderSections();
      updatePreview();
    });
    header.appendChild(removeBtn);

    sectionEl.appendChild(header);

    // Fields
    section.fields.forEach(field => {
      let inputEl;
      if (field.type === 'textarea') {
        inputEl = document.createElement('textarea');
      } else {
        inputEl = document.createElement('input');
        inputEl.type = field.type;
      }
      inputEl.name = `${section.id}-${field.name}`;
      inputEl.placeholder = field.label;
      inputEl.value = formData[inputEl.name] || '';
      inputEl.addEventListener('input', (e) => {
        formData[e.target.name] = e.target.value;
        updatePreview();
      });
      sectionEl.appendChild(inputEl);
    });

    formSections.appendChild(sectionEl);
  });
}

// Function to update preview theme class
function updateTheme(theme) {
  previewDiv.classList.remove('theme-classic', 'theme-modern', 'theme-minimal');
  previewDiv.classList.add(`theme-${theme}`);
}

// Initialize theme with default or saved value
let currentTheme = localStorage.getItem('resumeTheme') || 'classic';
themeSelect.value = currentTheme;
updateTheme(currentTheme);

// Listen to theme selector changes
themeSelect.addEventListener('change', (e) => {
  currentTheme = e.target.value;
  updateTheme(currentTheme);
  localStorage.setItem('resumeTheme', currentTheme);  // Save theme selection
});

// Preview update
function updatePreview() {
  preview.innerHTML = '';

  sections.forEach(section => {
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = section.title || 'Untitled Section';
    preview.appendChild(sectionTitle);

    section.fields.forEach(field => {
      const key = `${section.id}-${field.name}`;
      const val = formData[key];
      if (!val) return;

      if (field.name === 'skills') {
        const ul = document.createElement('ul');
        val.split(',').map(s => s.trim()).filter(Boolean).forEach(skill => {
          const li = document.createElement('li');
          li.textContent = skill;
          ul.appendChild(li);
        });
        preview.appendChild(ul);
      } else {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${field.label}:</strong> ${val}`;
        preview.appendChild(p);
      }
    });
  });
}

// Drag & Drop handlers
let draggedId = null;

function dragStart(e) {
  draggedId = this.dataset.id;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const draggingEl = document.querySelector('.dragging');
  if (!draggingEl) return;

  const target = e.currentTarget;
  if (target === draggingEl) return;

  const bounding = target.getBoundingClientRect();
  const offset = e.clientY - bounding.top;

  if (offset > bounding.height / 2) {
    target.style['border-bottom'] = '2px solid #007bff';
    target.style['border-top'] = '';
  } else {
    target.style['border-top'] = '2px solid #007bff';
    target.style['border-bottom'] = '';
  }
}

function drop(e) {
  e.preventDefault();
  const targetId = this.dataset.id;
  const draggedIndex = sections.findIndex(s => s.id === draggedId);
  const targetIndex = sections.findIndex(s => s.id === targetId);

  const bounding = this.getBoundingClientRect();
  const offset = e.clientY - bounding.top;

  let insertAt = targetIndex;
  if (offset > bounding.height / 2) {
    insertAt = targetIndex + 1;
  }

  if (draggedIndex < insertAt) insertAt--;

  const draggedSection = sections.splice(draggedIndex, 1)[0];
  sections.splice(insertAt, 0, draggedSection);

  // Reset borders
  document.querySelectorAll('.section').forEach(s => {
    s.style['border-top'] = '';
    s.style['border-bottom'] = '';
  });

  renderSections();
  updatePreview();
}

function dragEnd(e) {
  this.classList.remove('dragging');
  document.querySelectorAll('.section').forEach(s => {
    s.style['border-top'] = '';
    s.style['border-bottom'] = '';
  });
}

// Add new section
addSectionBtn.addEventListener('click', () => {
  const newSection = {
    id: generateId(),
    title: 'New Section',
    fields: [
      { type: 'textarea', label: 'Content', name: 'content' }
    ]
  };
  sections.push(newSection);
  renderSections();
  updatePreview();
});

// Save data to localStorage
saveBtn.addEventListener('click', () => {
  localStorage.setItem('resumeData', JSON.stringify({ sections, formData }));
  alert('Resume saved locally!');
});

// Load data from localStorage
loadBtn.addEventListener('click', () => {
  const saved = localStorage.getItem('resumeData');
  if (!saved) {
    alert('No saved resume found.');
    return;
  }
  const data = JSON.parse(saved);
  sections = data.sections || [];
  formData = data.formData || {};
  renderSections();
  updatePreview();
  alert('Resume loaded!');
});

// Clear all data
clearBtn.addEventListener('click', () => {
  if (confirm('Clear all data?')) {
    sections = [];
    formData = {};
    renderSections();
    updatePreview();
    localStorage.removeItem('resumeData');
  }
});

// Export preview as PDF
exportPdfBtn.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 10;
  sections.forEach(section => {
    doc.setFontSize(16);
    doc.text(section.title || 'Untitled Section', 10, y);
    y += 10;

    section.fields.forEach(field => {
      const key = `${section.id}-${field.name}`;
      const val = formData[key];
      if (!val) return;

      doc.setFontSize(12);
      if (field.name === 'skills') {
        doc.text('Skills:', 10, y);
        y += 7;
        val.split(',').map(s => s.trim()).filter(Boolean).forEach(skill => {
          doc.text(`- ${skill}`, 12, y);
          y += 7;
        });
      } else {
        doc.text(`${field.label}: ${val}`, 10, y);
        y += 7;
      }
    });

    y += 10;
    if (y > 270) { // start new page if content too long
      doc.addPage();
      y = 10;
    }
  });

  doc.save('resume.pdf');
});

// Initial render
renderSections();
updatePreview();
