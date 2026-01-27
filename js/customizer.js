/**
 * HBG Website Customizer Widget
 * A visual editor for non-technical users
 * Version 1.0
 */

(function() {
    'use strict';

    // ===== Configuration =====
    const CONFIG = {
        storageKey: 'hbg_customizer_data',
        passwordKey: 'hbg_customizer_password',
        defaultPassword: 'hbg2024',
        maxHistorySteps: 50
    };

    // ===== State Management =====
    let state = {
        isOpen: false,
        isLoggedIn: false,
        isEditMode: false,
        currentTab: 'colors',
        history: [],
        historyIndex: -1,
        unsavedChanges: false
    };

    // ===== Default Settings =====
    const defaultSettings = {
        colors: {
            outerSpace: '#242e33',
            greenWhite: '#e8ece3',
            shakespeare: '#45b1d9',
            astral: '#347baa'
        },
        fonts: {
            primary: 'Poppins',
            headingWeight: '800',
            bodyWeight: '400'
        },
        images: {
            logo: null,
            heroImage: null,
            aboutImage: null
        },
        text: {},
        sections: {
            home: true,
            about: true,
            services: true,
            careers: true,
            contact: true,
            team: true
        },
        sectionOrder: ['home', 'about', 'services', 'careers', 'contact', 'team'],
        backgrounds: {
            home: 'pattern',
            about: 'dark',
            services: 'light',
            careers: 'dark',
            contact: 'light',
            team: 'dark'
        },
        services: [
            {
                id: 'delivery',
                name: 'Delivery Services',
                description: 'Fast, reliable delivery through platforms like DoorDash, Instacart, Uber Eats, GrubHub, Veho, Roadie, and more. Your packages and meals arrive on time, every time.',
                icon: 'truck',
                enabled: true
            },
            {
                id: 'interpreting',
                name: 'Sign Language Interpreting',
                description: 'Professional ASL interpretation services that bridge communication gaps. Experienced, certified, and committed to facilitating clear, meaningful connections.',
                icon: 'chat',
                enabled: true
            },
            {
                id: 'warehouse',
                name: 'Warehouse Shifts',
                description: 'Dependable warehouse support when you need it. From inventory management to order fulfillment, we bring energy and efficiency to your operations.',
                icon: 'warehouse',
                enabled: true
            },
            {
                id: 'driving',
                name: 'Driving Services',
                description: 'Professional driving for various needs. Whether it\'s transporting goods or providing rideshare services, count on safe, courteous, and timely transportation.',
                icon: 'car',
                enabled: true
            },
            {
                id: 'retail',
                name: 'Retail Support',
                description: 'Flexible retail staffing solutions for your store. Friendly, customer-focused support that represents your brand with professionalism and care.',
                icon: 'retail',
                enabled: true
            },
            {
                id: 'other',
                name: 'And More',
                description: 'Have a unique need? Let\'s talk! With three decades of diverse experience, we\'re adaptable and ready to tackle new challenges. Just ask.',
                icon: 'more',
                enabled: true
            }
        ],
        team: []
    };

    let settings = JSON.parse(JSON.stringify(defaultSettings));

    // ===== Initialize =====
    function init() {
        loadSettings();
        createWidget();
        applySettings();
        setupTextEditing();
        setupSecretAccess();
    }

    // ===== Secret Access Methods =====
    function setupSecretAccess() {
        // Method 1: Keyboard shortcut Ctrl + Shift + A
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                openPanel();
            }
        });

        // Method 2: Triple-click on footer logo
        let clickCount = 0;
        let clickTimer = null;
        
        // Wait for DOM to be ready, then attach listener
        const attachFooterListener = () => {
            const footerLogo = document.querySelector('footer [data-customizer="logo"]');
            if (footerLogo) {
                footerLogo.style.cursor = 'default'; // Don't hint it's clickable
                footerLogo.addEventListener('click', (e) => {
                    clickCount++;
                    
                    if (clickCount === 1) {
                        clickTimer = setTimeout(() => {
                            clickCount = 0;
                        }, 500); // Reset after 500ms
                    }
                    
                    if (clickCount >= 3) {
                        clearTimeout(clickTimer);
                        clickCount = 0;
                        openPanel();
                    }
                });
            }
        };

        // Try immediately, or wait for DOM
        if (document.readyState === 'complete') {
            attachFooterListener();
        } else {
            window.addEventListener('load', attachFooterListener);
        }
    }

    function openPanel() {
        if (!state.isOpen) {
            togglePanel();
        }
    }

    // ===== Storage Functions =====
    function loadSettings() {
        // First, check for embedded settings (from GitHub export)
        if (window.HBG_EMBEDDED_SETTINGS) {
            try {
                settings = deepMerge(defaultSettings, window.HBG_EMBEDDED_SETTINGS);
                console.log('Loaded embedded settings from GitHub export');
            } catch (e) {
                console.error('Failed to load embedded settings:', e);
            }
        }
        
        // Then, check localStorage for any local overrides (for admin editing)
        const saved = localStorage.getItem(CONFIG.storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                settings = deepMerge(defaultSettings, parsed);
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
    }

    function saveSettings() {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(settings));
        state.unsavedChanges = false;
        showNotification('Settings saved!', 'success');
    }

    function getPassword() {
        return localStorage.getItem(CONFIG.passwordKey) || CONFIG.defaultPassword;
    }

    function setPassword(newPassword) {
        localStorage.setItem(CONFIG.passwordKey, newPassword);
    }

    // ===== History (Undo/Redo) =====
    function saveToHistory() {
        // Remove any future states if we're not at the end
        state.history = state.history.slice(0, state.historyIndex + 1);
        
        // Add current state
        state.history.push(JSON.stringify(settings));
        
        // Limit history size
        if (state.history.length > CONFIG.maxHistorySteps) {
            state.history.shift();
        }
        
        state.historyIndex = state.history.length - 1;
        state.unsavedChanges = true;
        updateHistoryButtons();
    }

    function undo() {
        if (state.historyIndex > 0) {
            state.historyIndex--;
            settings = JSON.parse(state.history[state.historyIndex]);
            applySettings();
            updateHistoryButtons();
            renderCurrentTab();
        }
    }

    function redo() {
        if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            settings = JSON.parse(state.history[state.historyIndex]);
            applySettings();
            updateHistoryButtons();
            renderCurrentTab();
        }
    }

    function updateHistoryButtons() {
        const undoBtn = document.getElementById('customizer-undo');
        const redoBtn = document.getElementById('customizer-redo');
        if (undoBtn) undoBtn.disabled = state.historyIndex <= 0;
        if (redoBtn) redoBtn.disabled = state.historyIndex >= state.history.length - 1;
    }

    // ===== Create Widget UI =====
    function createWidget() {
        // Create floating button
        const floatBtn = document.createElement('button');
        floatBtn.id = 'customizer-float-btn';
        floatBtn.innerHTML = `
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>Customize</span>
        `;
        floatBtn.onclick = togglePanel;
        document.body.appendChild(floatBtn);

        // Create panel
        const panel = document.createElement('div');
        panel.id = 'customizer-panel';
        panel.innerHTML = getPanelHTML();
        document.body.appendChild(panel);

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'customizer-overlay';
        overlay.onclick = togglePanel;
        document.body.appendChild(overlay);

        // Create notification container
        const notifContainer = document.createElement('div');
        notifContainer.id = 'customizer-notifications';
        document.body.appendChild(notifContainer);

        // Add styles
        addStyles();

        // Setup event listeners
        setupEventListeners();

        // Initialize history
        saveToHistory();
    }

    function getPanelHTML() {
        return `
            <!-- Login Screen -->
            <div id="customizer-login" class="customizer-screen">
                <div class="customizer-login-box">
                    <div class="customizer-login-logo">
                        <span>HBG</span>
                    </div>
                    <h2>Website Customizer</h2>
                    <p>Enter password to continue</p>
                    <input type="password" id="customizer-password" placeholder="Password" autocomplete="off">
                    <button id="customizer-login-btn">Login</button>
                    <p class="customizer-hint">Default: hbg2024</p>
                </div>
            </div>

            <!-- Main Editor Screen -->
            <div id="customizer-editor" class="customizer-screen" style="display:none;">
                <!-- Header -->
                <div class="customizer-header">
                    <h3>🎨 Website Customizer</h3>
                    <button id="customizer-close" title="Close">&times;</button>
                </div>

                <!-- Toolbar -->
                <div class="customizer-toolbar">
                    <button id="customizer-undo" title="Undo" disabled>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                        </svg>
                    </button>
                    <button id="customizer-redo" title="Redo" disabled>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"/>
                        </svg>
                    </button>
                    <div class="customizer-toolbar-divider"></div>
                    <button id="customizer-edit-mode" title="Toggle Edit Mode">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                        </svg>
                        <span>Edit Mode</span>
                    </button>
                    <button id="customizer-preview" title="Preview">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        <span>Preview</span>
                    </button>
                </div>

                <!-- Tabs -->
                <div class="customizer-tabs">
                    <button class="customizer-tab active" data-tab="colors">🎨 Colors</button>
                    <button class="customizer-tab" data-tab="images">🖼️ Images</button>
                    <button class="customizer-tab" data-tab="text">📝 Text</button>
                    <button class="customizer-tab" data-tab="services">🛠️ Services</button>
                    <button class="customizer-tab" data-tab="team">👥 Team</button>
                    <button class="customizer-tab" data-tab="sections">📐 Sections</button>
                    <button class="customizer-tab" data-tab="crm">📊 CRM</button>
                    <button class="customizer-tab" data-tab="settings">⚙️ Settings</button>
                </div>

                <!-- Tab Content -->
                <div class="customizer-content" id="customizer-content">
                    <!-- Content rendered dynamically -->
                </div>

                <!-- Footer -->
                <div class="customizer-footer">
                    <button id="customizer-reset" class="customizer-btn-secondary">Reset All</button>
                    <button id="customizer-export" class="customizer-btn-secondary">Export</button>
                    <button id="customizer-save" class="customizer-btn-primary">💾 Save Changes</button>
                </div>
            </div>
        `;
    }

    // ===== Tab Content Renderers =====
    function renderCurrentTab() {
        const content = document.getElementById('customizer-content');
        if (!content) return;

        switch (state.currentTab) {
            case 'colors':
                content.innerHTML = renderColorsTab();
                break;
            case 'images':
                content.innerHTML = renderImagesTab();
                break;
            case 'text':
                content.innerHTML = renderTextTab();
                break;
            case 'services':
                content.innerHTML = renderServicesManagerTab();
                break;
            case 'team':
                content.innerHTML = renderTeamManagerTab();
                break;
            case 'sections':
                content.innerHTML = renderSectionsTab();
                break;
            case 'crm':
                content.innerHTML = renderCRMTab();
                break;
            case 'settings':
                content.innerHTML = renderSettingsTab();
                break;
        }

        setupTabEventListeners();
    }

    function renderColorsTab() {
        return `
            <div class="customizer-section">
                <h4>Brand Colors</h4>
                <p class="customizer-help">Click on a color to change it</p>
                
                <div class="customizer-color-grid">
                    <div class="customizer-color-item">
                        <label>Primary Dark (Outer Space)</label>
                        <div class="customizer-color-input">
                            <input type="color" id="color-outerSpace" value="${settings.colors.outerSpace}">
                            <input type="text" value="${settings.colors.outerSpace}" data-color="outerSpace">
                        </div>
                    </div>
                    
                    <div class="customizer-color-item">
                        <label>Light Background (Green White)</label>
                        <div class="customizer-color-input">
                            <input type="color" id="color-greenWhite" value="${settings.colors.greenWhite}">
                            <input type="text" value="${settings.colors.greenWhite}" data-color="greenWhite">
                        </div>
                    </div>
                    
                    <div class="customizer-color-item">
                        <label>Primary Accent (Shakespeare)</label>
                        <div class="customizer-color-input">
                            <input type="color" id="color-shakespeare" value="${settings.colors.shakespeare}">
                            <input type="text" value="${settings.colors.shakespeare}" data-color="shakespeare">
                        </div>
                    </div>
                    
                    <div class="customizer-color-item">
                        <label>Secondary Accent (Astral)</label>
                        <div class="customizer-color-input">
                            <input type="color" id="color-astral" value="${settings.colors.astral}">
                            <input type="text" value="${settings.colors.astral}" data-color="astral">
                        </div>
                    </div>
                </div>
            </div>

            <div class="customizer-section">
                <h4>Quick Presets</h4>
                <div class="customizer-presets">
                    <button class="customizer-preset" data-preset="default">
                        <span class="preset-colors">
                            <span style="background:#242e33"></span>
                            <span style="background:#e8ece3"></span>
                            <span style="background:#45b1d9"></span>
                            <span style="background:#347baa"></span>
                        </span>
                        Original
                    </button>
                    <button class="customizer-preset" data-preset="warm">
                        <span class="preset-colors">
                            <span style="background:#2d2a26"></span>
                            <span style="background:#f5f0e8"></span>
                            <span style="background:#e07b53"></span>
                            <span style="background:#c45d3a"></span>
                        </span>
                        Warm
                    </button>
                    <button class="customizer-preset" data-preset="forest">
                        <span class="preset-colors">
                            <span style="background:#1a2e1a"></span>
                            <span style="background:#e8efe8"></span>
                            <span style="background:#4a9c6d"></span>
                            <span style="background:#2d7a4a"></span>
                        </span>
                        Forest
                    </button>
                    <button class="customizer-preset" data-preset="purple">
                        <span class="preset-colors">
                            <span style="background:#2a2433"></span>
                            <span style="background:#f0e8f5"></span>
                            <span style="background:#9b59b6"></span>
                            <span style="background:#7d3c98"></span>
                        </span>
                        Purple
                    </button>
                </div>
            </div>
        `;
    }

    function renderImagesTab() {
        return `
            <div class="customizer-section">
                <h4>Logo</h4>
                <p class="customizer-help">Upload your company logo (recommended: PNG with transparent background)</p>
                
                <div class="customizer-image-upload">
                    <div class="customizer-image-preview" id="preview-logo">
                        ${settings.images.logo ? 
                            `<img src="${settings.images.logo}" alt="Logo">` : 
                            `<div class="customizer-logo-placeholder">HBG</div>`
                        }
                    </div>
                    <div class="customizer-image-actions">
                        <label class="customizer-upload-btn">
                            📁 Upload Logo
                            <input type="file" id="upload-logo" accept="image/*" hidden>
                        </label>
                        ${settings.images.logo ? 
                            `<button class="customizer-remove-btn" data-remove="logo">🗑️ Remove</button>` : 
                            ''
                        }
                    </div>
                </div>
            </div>

            <div class="customizer-section">
                <h4>Hero Section Image</h4>
                <p class="customizer-help">Add a background image for the hero section</p>
                
                <div class="customizer-image-upload">
                    <div class="customizer-image-preview large" id="preview-heroImage">
                        ${settings.images.heroImage ? 
                            `<img src="${settings.images.heroImage}" alt="Hero">` : 
                            `<span>No image set</span>`
                        }
                    </div>
                    <div class="customizer-image-actions">
                        <label class="customizer-upload-btn">
                            📁 Upload Image
                            <input type="file" id="upload-heroImage" accept="image/*" hidden>
                        </label>
                        ${settings.images.heroImage ? 
                            `<button class="customizer-remove-btn" data-remove="heroImage">🗑️ Remove</button>` : 
                            ''
                        }
                    </div>
                </div>
            </div>

            <div class="customizer-section">
                <h4>Favicon</h4>
                <p class="customizer-help">Upload a favicon (recommended: 32x32 PNG)</p>
                
                <div class="customizer-image-upload">
                    <div class="customizer-image-preview small" id="preview-favicon">
                        ${settings.images.favicon ? 
                            `<img src="${settings.images.favicon}" alt="Favicon">` : 
                            `<span>No favicon</span>`
                        }
                    </div>
                    <div class="customizer-image-actions">
                        <label class="customizer-upload-btn">
                            📁 Upload Favicon
                            <input type="file" id="upload-favicon" accept="image/*" hidden>
                        </label>
                        ${settings.images.favicon ? 
                            `<button class="customizer-remove-btn" data-remove="favicon">🗑️ Remove</button>` : 
                            ''
                        }
                    </div>
                </div>
            </div>
        `;
    }

    function renderTextTab() {
        return `
            <div class="customizer-section">
                <h4>Enable Click-to-Edit</h4>
                <p class="customizer-help">Turn on Edit Mode to click directly on any text in the page to edit it.</p>
                
                <button id="toggle-edit-mode-btn" class="customizer-btn-primary" style="width:100%">
                    ${state.isEditMode ? '✏️ Edit Mode: ON - Click any text to edit' : '✏️ Turn On Edit Mode'}
                </button>
            </div>

            <div class="customizer-section">
                <h4>Quick Text Editor</h4>
                <p class="customizer-help">Edit key text elements</p>
                
                <div class="customizer-form-group">
                    <label>Company Name</label>
                    <input type="text" id="text-companyName" value="${settings.text.companyName || 'HBG'}" placeholder="HBG">
                </div>
                
                <div class="customizer-form-group">
                    <label>Tagline</label>
                    <input type="text" id="text-tagline" value="${settings.text.tagline || 'He Be Giggin\' O!'}" placeholder="He Be Giggin' O!">
                </div>
                
                <div class="customizer-form-group">
                    <label>Hero Headline</label>
                    <textarea id="text-heroHeadline" rows="2" placeholder="Your Trusted Partner for Gig Work Done Right">${settings.text.heroHeadline || ''}</textarea>
                </div>
                
                <div class="customizer-form-group">
                    <label>Hero Subheadline</label>
                    <textarea id="text-heroSubheadline" rows="3" placeholder="With over 30 years of experience...">${settings.text.heroSubheadline || ''}</textarea>
                </div>

                <div class="customizer-form-group">
                    <label>Contact Email</label>
                    <input type="email" id="text-email" value="${settings.text.email || ''}" placeholder="contact@hbg.com">
                </div>

                <div class="customizer-form-group">
                    <label>Phone Number</label>
                    <input type="tel" id="text-phone" value="${settings.text.phone || ''}" placeholder="(555) 123-4567">
                </div>
            </div>
        `;
    }

    function renderSectionsTab() {
        // Default section order if not set
        const defaultOrder = ['home', 'about', 'services', 'careers', 'contact', 'team'];
        const sectionOrder = settings.sectionOrder || defaultOrder;
        
        const sectionLabels = {
            home: '🏠 Home / Hero Section',
            about: 'ℹ️ About Section',
            services: '🛠️ Services Section',
            careers: '💼 Careers Section',
            contact: '📞 Contact Section',
            team: '👥 Team Section'
        };

        return `
            <div class="customizer-section">
                <h4>🔀 Reorder & Show/Hide Sections</h4>
                <p class="customizer-help">Drag sections to reorder, or use arrows. Toggle visibility with checkboxes.</p>
                
                <div class="section-reorder-list" id="section-reorder-list">
                    ${sectionOrder.map((sectionId, index) => `
                        <div class="section-reorder-item" data-section="${sectionId}">
                            <div class="section-reorder-drag" title="Drag to reorder">⋮⋮</div>
                            <div class="section-reorder-arrows">
                                <button class="section-arrow-up" data-section="${sectionId}" ${index === 0 ? 'disabled' : ''} title="Move up">▲</button>
                                <button class="section-arrow-down" data-section="${sectionId}" ${index === sectionOrder.length - 1 ? 'disabled' : ''} title="Move down">▼</button>
                            </div>
                            <label class="section-reorder-label">
                                <input type="checkbox" id="section-${sectionId}" data-section="${sectionId}" ${settings.sections[sectionId] ? 'checked' : ''}>
                                <span>${sectionLabels[sectionId]}</span>
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="customizer-section">
                <h4>Section Backgrounds</h4>
                <p class="customizer-help">Change background styles for each section</p>
                
                <div class="customizer-form-group">
                    <label>🏠 Hero Background</label>
                    <select id="bg-home">
                        <option value="pattern" ${settings.backgrounds.home === 'pattern' ? 'selected' : ''}>Pattern (Light)</option>
                        <option value="solid-light" ${settings.backgrounds.home === 'solid-light' ? 'selected' : ''}>Solid Light</option>
                        <option value="solid-dark" ${settings.backgrounds.home === 'solid-dark' ? 'selected' : ''}>Solid Dark</option>
                        <option value="gradient" ${settings.backgrounds.home === 'gradient' ? 'selected' : ''}>Gradient</option>
                        <option value="image" ${settings.backgrounds.home === 'image' ? 'selected' : ''}>Custom Image</option>
                    </select>
                </div>
                
                <div class="customizer-form-group">
                    <label>ℹ️ About Background</label>
                    <select id="bg-about">
                        <option value="dark" ${settings.backgrounds.about === 'dark' ? 'selected' : ''}>Dark Pattern</option>
                        <option value="light" ${settings.backgrounds.about === 'light' ? 'selected' : ''}>Light Pattern</option>
                        <option value="solid-dark" ${settings.backgrounds.about === 'solid-dark' ? 'selected' : ''}>Solid Dark</option>
                        <option value="solid-light" ${settings.backgrounds.about === 'solid-light' ? 'selected' : ''}>Solid Light</option>
                        <option value="gradient" ${settings.backgrounds.about === 'gradient' ? 'selected' : ''}>Gradient</option>
                    </select>
                </div>
                
                <div class="customizer-form-group">
                    <label>🛠️ Services Background</label>
                    <select id="bg-services">
                        <option value="light" ${settings.backgrounds.services === 'light' ? 'selected' : ''}>Light</option>
                        <option value="dark" ${settings.backgrounds.services === 'dark' ? 'selected' : ''}>Dark</option>
                        <option value="solid-light" ${settings.backgrounds.services === 'solid-light' ? 'selected' : ''}>Solid Light</option>
                        <option value="gradient" ${settings.backgrounds.services === 'gradient' ? 'selected' : ''}>Gradient</option>
                    </select>
                </div>
                
                <div class="customizer-form-group">
                    <label>💼 Careers Background</label>
                    <select id="bg-careers">
                        <option value="dark" ${settings.backgrounds.careers === 'dark' ? 'selected' : ''}>Dark Pattern</option>
                        <option value="light" ${settings.backgrounds.careers === 'light' ? 'selected' : ''}>Light Pattern</option>
                        <option value="solid-dark" ${settings.backgrounds.careers === 'solid-dark' ? 'selected' : ''}>Solid Dark</option>
                        <option value="gradient" ${settings.backgrounds.careers === 'gradient' ? 'selected' : ''}>Gradient</option>
                    </select>
                </div>
                
                <div class="customizer-form-group">
                    <label>📞 Contact Background</label>
                    <select id="bg-contact">
                        <option value="light" ${settings.backgrounds.contact === 'light' ? 'selected' : ''}>Light</option>
                        <option value="dark" ${settings.backgrounds.contact === 'dark' ? 'selected' : ''}>Dark</option>
                        <option value="solid-light" ${settings.backgrounds.contact === 'solid-light' ? 'selected' : ''}>Solid Light</option>
                        <option value="gradient" ${settings.backgrounds.contact === 'gradient' ? 'selected' : ''}>Gradient</option>
                    </select>
                </div>
                
                <div class="customizer-form-group">
                    <label>👥 Team Background</label>
                    <select id="bg-team">
                        <option value="dark" ${settings.backgrounds.team === 'dark' ? 'selected' : ''}>Dark Pattern</option>
                        <option value="light" ${settings.backgrounds.team === 'light' ? 'selected' : ''}>Light Pattern</option>
                        <option value="solid-dark" ${settings.backgrounds.team === 'solid-dark' ? 'selected' : ''}>Solid Dark</option>
                        <option value="gradient" ${settings.backgrounds.team === 'gradient' ? 'selected' : ''}>Gradient</option>
                    </select>
                </div>
            </div>
        `;
    }

    function renderServicesManagerTab() {
        const services = settings.services || [];
        const iconOptions = [
            { value: 'truck', label: '🚚 Delivery/Truck' },
            { value: 'chat', label: '💬 Communication' },
            { value: 'warehouse', label: '🏭 Warehouse' },
            { value: 'car', label: '🚗 Driving' },
            { value: 'retail', label: '🛒 Retail' },
            { value: 'more', label: '⚙️ General/More' },
            { value: 'tools', label: '🔧 Tools/Repair' },
            { value: 'computer', label: '💻 Technology' },
            { value: 'clean', label: '🧹 Cleaning' },
            { value: 'food', label: '🍽️ Food Service' }
        ];

        return `
            <div class="customizer-section">
                <h4>🛠️ Services Manager</h4>
                <p class="customizer-help">Add, edit, or remove services. Changes sync to both the Services section AND the Contact form dropdown.</p>
                
                <button id="add-new-service" class="customizer-btn-primary" style="width:100%; margin-bottom:16px;">
                    ➕ Add New Service
                </button>
            </div>

            <div class="customizer-section">
                <h4>Your Services (${services.filter(s => s.enabled).length} active)</h4>
                <div id="services-list" class="services-manager-list">
                    ${services.map((service, index) => `
                        <div class="service-manager-card ${service.enabled ? '' : 'disabled'}" data-service-id="${service.id}">
                            <div class="service-manager-header">
                                <div class="service-manager-drag">⋮⋮</div>
                                <div class="service-manager-toggle">
                                    <input type="checkbox" id="service-enabled-${service.id}" ${service.enabled ? 'checked' : ''} data-service-id="${service.id}">
                                </div>
                                <div class="service-manager-icon">${getIconEmoji(service.icon)}</div>
                                <div class="service-manager-title">${service.name}</div>
                                <button class="service-manager-edit" data-service-id="${service.id}" title="Edit">✏️</button>
                                <button class="service-manager-delete" data-service-id="${service.id}" title="Delete">🗑️</button>
                            </div>
                            <div class="service-manager-preview">${service.description.substring(0, 80)}${service.description.length > 80 ? '...' : ''}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Edit Service Modal -->
            <div id="service-edit-modal" class="service-modal" style="display:none;">
                <div class="service-modal-content">
                    <h4 id="service-modal-title">Edit Service</h4>
                    <input type="hidden" id="edit-service-id">
                    
                    <div class="customizer-form-group">
                        <label>Service Name</label>
                        <input type="text" id="edit-service-name" placeholder="e.g., Delivery Services">
                    </div>
                    
                    <div class="customizer-form-group">
                        <label>Description</label>
                        <textarea id="edit-service-description" rows="4" placeholder="Describe this service..."></textarea>
                    </div>
                    
                    <div class="customizer-form-group">
                        <label>Icon</label>
                        <select id="edit-service-icon">
                            ${iconOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="service-modal-actions">
                        <button id="cancel-service-edit" class="customizer-btn-secondary">Cancel</button>
                        <button id="save-service-edit" class="customizer-btn-primary">💾 Save Service</button>
                    </div>
                </div>
            </div>
        `;
    }

    function getIconEmoji(iconName) {
        const icons = {
            truck: '🚚',
            chat: '💬',
            warehouse: '🏭',
            car: '🚗',
            retail: '🛒',
            more: '⚙️',
            tools: '🔧',
            computer: '💻',
            clean: '🧹',
            food: '🍽️'
        };
        return icons[iconName] || '📦';
    }

    function renderTeamManagerTab() {
        const team = settings.team || [];
        
        return `
            <div class="customizer-section">
                <h4>👥 Team Manager</h4>
                <p class="customizer-help">Add team members to help customers get to know the people behind HBG.</p>
                
                <button id="add-new-team-member" class="customizer-btn-primary" style="width:100%; margin-bottom:16px;">
                    ➕ Add Team Member
                </button>
            </div>

            <div class="customizer-section">
                <h4>Your Team (${team.filter(m => m.enabled).length} visible)</h4>
                <div id="team-list" class="team-manager-list">
                    ${team.length === 0 ? 
                        '<p class="team-empty">No team members yet. Click "Add Team Member" to get started!</p>' :
                        team.map((member, index) => `
                            <div class="team-manager-card ${member.enabled ? '' : 'disabled'}" data-member-id="${member.id}">
                                <div class="team-manager-header">
                                    <div class="team-manager-toggle">
                                        <input type="checkbox" id="member-enabled-${member.id}" ${member.enabled ? 'checked' : ''} data-member-id="${member.id}">
                                    </div>
                                    <div class="team-manager-avatar">
                                        ${member.photo ? 
                                            `<img src="${member.photo}" alt="${member.name}">` : 
                                            `<span>${member.name.charAt(0).toUpperCase()}</span>`
                                        }
                                    </div>
                                    <div class="team-manager-info">
                                        <div class="team-manager-name">${member.name}</div>
                                        <div class="team-manager-role">${member.role}</div>
                                    </div>
                                    <button class="team-manager-edit" data-member-id="${member.id}" title="Edit">✏️</button>
                                    <button class="team-manager-delete" data-member-id="${member.id}" title="Delete">🗑️</button>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>

            <!-- Edit Team Member Modal -->
            <div id="team-edit-modal" class="team-modal" style="display:none;">
                <div class="team-modal-content">
                    <h4 id="team-modal-title">Add Team Member</h4>
                    <input type="hidden" id="edit-member-id">
                    
                    <div class="team-photo-upload">
                        <div class="team-photo-preview" id="member-photo-preview">
                            <span>📷</span>
                        </div>
                        <label class="customizer-upload-btn">
                            📁 Upload Photo
                            <input type="file" id="upload-member-photo" accept="image/*" hidden>
                        </label>
                    </div>
                    
                    <div class="customizer-form-group">
                        <label>Name *</label>
                        <input type="text" id="edit-member-name" placeholder="e.g., John Smith">
                    </div>
                    
                    <div class="customizer-form-group">
                        <label>Role/Title *</label>
                        <input type="text" id="edit-member-role" placeholder="e.g., Lead Driver">
                    </div>
                    
                    <div class="customizer-form-group">
                        <label>Bio</label>
                        <textarea id="edit-member-bio" rows="3" placeholder="A short bio about this team member..."></textarea>
                    </div>
                    
                    <div class="customizer-form-group">
                        <label>Email (optional)</label>
                        <input type="email" id="edit-member-email" placeholder="john@hbg.com">
                    </div>
                    
                    <div class="customizer-form-group">
                        <label>Phone (optional)</label>
                        <input type="tel" id="edit-member-phone" placeholder="(555) 123-4567">
                    </div>
                    
                    <div class="customizer-form-group">
                        <label>LinkedIn URL (optional)</label>
                        <input type="url" id="edit-member-linkedin" placeholder="https://linkedin.com/in/username">
                    </div>
                    
                    <div class="team-modal-actions">
                        <button id="cancel-team-edit" class="customizer-btn-secondary">Cancel</button>
                        <button id="save-team-edit" class="customizer-btn-primary">💾 Save Member</button>
                    </div>
                </div>
            </div>
        `;
    }

    function applyTeam() {
        const team = settings.team || [];
        const enabledMembers = team.filter(m => m.enabled);
        
        const teamGrid = document.getElementById('team-grid');
        if (teamGrid) {
            if (enabledMembers.length === 0) {
                teamGrid.innerHTML = `
                    <div class="team-placeholder text-center text-gray-400 col-span-full py-12">
                        <p>Team members will appear here once added via the customizer.</p>
                    </div>
                `;
            } else {
                teamGrid.innerHTML = enabledMembers.map(member => `
                    <div class="team-card bg-outer-space-light rounded-2xl p-6 shadow-lg text-center">
                        <div class="team-avatar mx-auto mb-4">
                            ${member.photo ? 
                                `<img src="${member.photo}" alt="${member.name}" class="w-32 h-32 rounded-full object-cover mx-auto border-4 border-shakespeare">` : 
                                `<div class="w-32 h-32 rounded-full gradient-bg flex items-center justify-center mx-auto text-4xl text-white font-bold">${member.name.charAt(0).toUpperCase()}</div>`
                            }
                        </div>
                        <h3 class="text-xl font-bold text-white mb-1">${member.name}</h3>
                        <p class="text-shakespeare font-medium mb-3">${member.role}</p>
                        ${member.bio ? `<p class="text-gray-400 text-sm mb-4">${member.bio}</p>` : ''}
                        <div class="flex justify-center gap-3">
                            ${member.email ? `
                                <a href="mailto:${member.email}" class="w-10 h-10 rounded-full bg-outer-space flex items-center justify-center text-gray-400 hover:text-shakespeare hover:bg-outer-space-lighter transition" title="Email">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                </a>
                            ` : ''}
                            ${member.phone ? `
                                <a href="tel:${member.phone}" class="w-10 h-10 rounded-full bg-outer-space flex items-center justify-center text-gray-400 hover:text-shakespeare hover:bg-outer-space-lighter transition" title="Phone">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                    </svg>
                                </a>
                            ` : ''}
                            ${member.linkedin ? `
                                <a href="${member.linkedin}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-outer-space flex items-center justify-center text-gray-400 hover:text-shakespeare hover:bg-outer-space-lighter transition" title="LinkedIn">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                    </svg>
                                </a>
                            ` : ''}
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    function getIconSVG(iconName) {
        const icons = {
            truck: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>',
            chat: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>',
            warehouse: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>',
            car: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>',
            retail: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>',
            more: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>',
            tools: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>',
            computer: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>',
            clean: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>',
            food: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>'
        };
        return icons[iconName] || icons.more;
    }

    function applyServices() {
        const services = settings.services || [];
        const enabledServices = services.filter(s => s.enabled);

        // Update Services Section on the page
        const servicesGrid = document.getElementById('services-grid');
        if (servicesGrid) {
            servicesGrid.innerHTML = enabledServices.map(service => `
                <div class="service-card bg-green-white rounded-2xl p-8 shadow-lg hover:shadow-xl">
                    <div class="service-icon w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mb-6">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${getIconSVG(service.icon)}
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold mb-3 text-outer-space">${service.name}</h3>
                    <p class="text-gray-600 leading-relaxed">${service.description}</p>
                </div>
            `).join('');
        }

        // Update Contact Form Dropdown
        const serviceDropdown = document.getElementById('service');
        if (serviceDropdown) {
            const currentValue = serviceDropdown.value;
            serviceDropdown.innerHTML = '<option value="">Select a service</option>' + 
                enabledServices.map(service => 
                    `<option value="${service.name}" ${currentValue === service.name ? 'selected' : ''}>${service.name}</option>`
                ).join('');
        }
    }

    function renderSettingsTab() {
        return `
            <div class="customizer-section">
                <h4>🚀 Publish to GitHub</h4>
                <p class="customizer-help">Download updated files with your changes baked in, then upload to GitHub.</p>
                
                <button id="export-for-github" class="customizer-btn-primary" style="width:100%; margin-bottom:10px;">
                    📦 Download Files for GitHub
                </button>
                <p class="customizer-help" style="font-size:11px; color:#888;">
                    This downloads a ZIP with your customized index.html, CSS, and JS files. Upload these to your GitHub repository to make changes live for everyone.
                </p>
            </div>

            <div class="customizer-section">
                <h4>🔐 Change Password</h4>
                <p class="customizer-help">Update your customizer password</p>
                
                <div class="customizer-form-group">
                    <label>Current Password</label>
                    <input type="password" id="current-password" placeholder="Enter current password">
                </div>
                
                <div class="customizer-form-group">
                    <label>New Password</label>
                    <input type="password" id="new-password" placeholder="Enter new password">
                </div>
                
                <div class="customizer-form-group">
                    <label>Confirm New Password</label>
                    <input type="password" id="confirm-password" placeholder="Confirm new password">
                </div>
                
                <button id="change-password-btn" class="customizer-btn-primary" style="width:100%">Update Password</button>
            </div>

            <div class="customizer-section">
                <h4>📦 Backup & Restore</h4>
                <p class="customizer-help">Export your settings or restore from a backup</p>
                
                <div class="customizer-backup-actions">
                    <button id="export-backup" class="customizer-btn-secondary">
                        📤 Export Backup
                    </button>
                    <label class="customizer-btn-secondary" style="cursor:pointer">
                        📥 Import Backup
                        <input type="file" id="import-backup" accept=".json" hidden>
                    </label>
                </div>
            </div>

            <div class="customizer-section">
                <h4>🔄 Reset Options</h4>
                <p class="customizer-help">Reset various settings to defaults</p>
                
                <div class="customizer-reset-options">
                    <button id="reset-colors" class="customizer-btn-danger-outline">Reset Colors</button>
                    <button id="reset-images" class="customizer-btn-danger-outline">Reset Images</button>
                    <button id="reset-text" class="customizer-btn-danger-outline">Reset Text</button>
                    <button id="reset-all" class="customizer-btn-danger">⚠️ Reset Everything</button>
                </div>
            </div>

            <div class="customizer-section">
                <h4>ℹ️ About</h4>
                <p class="customizer-help">HBG Website Customizer v1.0</p>
                <p class="customizer-help">Made with ❤️ for easy website editing</p>
            </div>
        `;
    }

    function renderCRMTab() {
        const leads = window.HBG_CRM ? window.HBG_CRM.getLeads() : [];
        const clients = leads.filter(l => l.leadType === 'Client');
        const workers = leads.filter(l => l.leadType === 'Worker');
        const unassigned = leads.filter(l => l.leadType === 'Unassigned');
        const newLeads = leads.filter(l => l.status === 'New');
        
        return `
            <div class="customizer-section">
                <h4>📊 Lead Dashboard</h4>
                <div class="crm-stats">
                    <div class="crm-stat">
                        <span class="crm-stat-number">${leads.length}</span>
                        <span class="crm-stat-label">Total</span>
                    </div>
                    <div class="crm-stat">
                        <span class="crm-stat-number">${clients.length}</span>
                        <span class="crm-stat-label">Clients</span>
                    </div>
                    <div class="crm-stat">
                        <span class="crm-stat-number">${workers.length}</span>
                        <span class="crm-stat-label">Workers</span>
                    </div>
                    <div class="crm-stat ${unassigned.length > 0 ? 'unassigned' : ''}">
                        <span class="crm-stat-number">${unassigned.length}</span>
                        <span class="crm-stat-label">Unassigned</span>
                    </div>
                    <div class="crm-stat new">
                        <span class="crm-stat-number">${newLeads.length}</span>
                        <span class="crm-stat-label">New</span>
                    </div>
                </div>
            </div>

            <div class="customizer-section">
                <h4>🔍 Filter & Export</h4>
                <div class="crm-filters">
                    <select id="crm-filter-type" class="crm-select">
                        <option value="all">All Types</option>
                        <option value="Client">Clients Only</option>
                        <option value="Worker">Workers Only</option>
                        <option value="Unassigned">Unassigned</option>
                    </select>
                    <select id="crm-filter-status" class="crm-select">
                        <option value="all">All Status</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Converted">Converted</option>
                        <option value="Lost">Lost</option>
                    </select>
                </div>
                <div class="crm-export-buttons">
                    <button id="crm-export-obsidian" class="customizer-btn-primary">
                        📥 Export to Obsidian
                    </button>
                    <button id="crm-export-csv" class="customizer-btn-secondary">
                        📄 Export CSV
                    </button>
                </div>
            </div>

            <div class="customizer-section">
                <h4>📋 Leads (${leads.length})</h4>
                <div id="crm-leads-list" class="crm-leads-list">
                    ${leads.length === 0 ? 
                        '<p class="crm-empty">No leads yet. Form submissions will appear here.</p>' :
                        leads.map(lead => renderLeadCard(lead)).join('')
                    }
                </div>
            </div>
        `;
    }

    function renderLeadCard(lead) {
        const statusColors = {
            'New': '#45b1d9',
            'Contacted': '#f39c12',
            'Qualified': '#9b59b6',
            'Converted': '#27ae60',
            'Lost': '#e74c3c'
        };
        const statusColor = statusColors[lead.status] || '#888';
        
        return `
            <div class="crm-lead-card" data-lead-id="${lead.id}">
                <div class="crm-lead-header">
                    <div class="crm-lead-info">
                        <span class="crm-lead-name">${lead.name}</span>
                        <span class="crm-lead-type ${lead.leadType.toLowerCase()}">${lead.leadType}</span>
                    </div>
                    <span class="crm-lead-status" style="background:${statusColor}">${lead.status}</span>
                </div>
                <div class="crm-lead-details">
                    <p>📧 ${lead.email}</p>
                    ${lead.phone ? `<p>📞 ${lead.phone}</p>` : ''}
                    <p>🛠️ ${lead.service || 'Not specified'}</p>
                    <p>📅 ${lead.dateSubmitted}</p>
                </div>
                ${lead.message ? `<div class="crm-lead-message">"${lead.message.substring(0, 100)}${lead.message.length > 100 ? '...' : ''}"</div>` : ''}
                <div class="crm-lead-actions">
                    <select class="crm-type-select" data-lead-id="${lead.id}" title="Lead Type">
                        <option value="Unassigned" ${lead.leadType === 'Unassigned' ? 'selected' : ''}>❓ Unassigned</option>
                        <option value="Client" ${lead.leadType === 'Client' ? 'selected' : ''}>💼 Client</option>
                        <option value="Worker" ${lead.leadType === 'Worker' ? 'selected' : ''}>👷 Worker</option>
                    </select>
                    <select class="crm-status-select" data-lead-id="${lead.id}" title="Status">
                        <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
                        <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="Qualified" ${lead.status === 'Qualified' ? 'selected' : ''}>Qualified</option>
                        <option value="Converted" ${lead.status === 'Converted' ? 'selected' : ''}>Converted</option>
                        <option value="Lost" ${lead.status === 'Lost' ? 'selected' : ''}>Lost</option>
                    </select>
                    <button class="crm-btn-export" data-lead-id="${lead.id}" title="Export to Obsidian">📥</button>
                    <button class="crm-btn-delete" data-lead-id="${lead.id}" title="Delete">🗑️</button>
                </div>
            </div>
        `;
    }

    // ===== Event Listeners =====
    function setupEventListeners() {
        // Login
        document.getElementById('customizer-login-btn').onclick = handleLogin;
        document.getElementById('customizer-password').onkeypress = (e) => {
            if (e.key === 'Enter') handleLogin();
        };

        // Close
        document.getElementById('customizer-close').onclick = togglePanel;

        // Tabs
        document.querySelectorAll('.customizer-tab').forEach(tab => {
            tab.onclick = () => switchTab(tab.dataset.tab);
        });

        // Toolbar
        document.getElementById('customizer-undo').onclick = undo;
        document.getElementById('customizer-redo').onclick = redo;
        document.getElementById('customizer-edit-mode').onclick = toggleEditMode;
        document.getElementById('customizer-preview').onclick = previewSite;

        // Footer
        document.getElementById('customizer-save').onclick = saveSettings;
        document.getElementById('customizer-export').onclick = exportSettings;
        document.getElementById('customizer-reset').onclick = () => {
            if (confirm('Are you sure you want to reset ALL settings to defaults?')) {
                resetAll();
            }
        };

        // Initial render
        renderCurrentTab();
    }

    function setupTabEventListeners() {
        // Color inputs
        document.querySelectorAll('#customizer-content input[type="color"]').forEach(input => {
            input.oninput = (e) => {
                const colorName = e.target.id.replace('color-', '');
                settings.colors[colorName] = e.target.value;
                // Update text input
                const textInput = document.querySelector(`input[data-color="${colorName}"]`);
                if (textInput) textInput.value = e.target.value;
                applySettings();
            };
            input.onchange = saveToHistory;
        });

        // Color text inputs
        document.querySelectorAll('#customizer-content input[data-color]').forEach(input => {
            input.oninput = (e) => {
                const colorName = e.target.dataset.color;
                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    settings.colors[colorName] = e.target.value;
                    // Update color picker
                    const colorInput = document.getElementById(`color-${colorName}`);
                    if (colorInput) colorInput.value = e.target.value;
                    applySettings();
                }
            };
            input.onchange = saveToHistory;
        });

        // Color presets
        document.querySelectorAll('.customizer-preset').forEach(btn => {
            btn.onclick = () => applyPreset(btn.dataset.preset);
        });

        // Image uploads
        ['logo', 'heroImage', 'favicon'].forEach(type => {
            const input = document.getElementById(`upload-${type}`);
            if (input) {
                input.onchange = (e) => handleImageUpload(e, type);
            }
        });

        // Image remove buttons
        document.querySelectorAll('.customizer-remove-btn[data-remove]').forEach(btn => {
            btn.onclick = () => {
                const type = btn.dataset.remove;
                settings.images[type] = null;
                saveToHistory();
                applySettings();
                renderCurrentTab();
            };
        });

        // Text inputs
        document.querySelectorAll('#customizer-content input[id^="text-"], #customizer-content textarea[id^="text-"]').forEach(input => {
            input.oninput = (e) => {
                const key = e.target.id.replace('text-', '');
                settings.text[key] = e.target.value;
                applyTextSettings();
            };
            input.onchange = saveToHistory;
        });

        // Edit mode toggle
        const editModeBtn = document.getElementById('toggle-edit-mode-btn');
        if (editModeBtn) {
            editModeBtn.onclick = toggleEditMode;
        }

        // Section toggles
        document.querySelectorAll('#customizer-content input[id^="section-"]').forEach(input => {
            input.onchange = (e) => {
                const section = e.target.dataset.section || e.target.id.replace('section-', '');
                settings.sections[section] = e.target.checked;
                saveToHistory();
                applySectionVisibility();
            };
        });

        // Section reorder arrows
        document.querySelectorAll('.section-arrow-up').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const sectionId = e.target.dataset.section;
                moveSectionUp(sectionId);
            };
        });

        document.querySelectorAll('.section-arrow-down').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const sectionId = e.target.dataset.section;
                moveSectionDown(sectionId);
            };
        });

        // Drag and drop for sections
        setupSectionDragAndDrop();

        // Background selects
        document.querySelectorAll('#customizer-content select[id^="bg-"]').forEach(select => {
            select.onchange = (e) => {
                const section = e.target.id.replace('bg-', '');
                settings.backgrounds[section] = e.target.value;
                saveToHistory();
                applyBackgrounds();
            };
        });

        // Password change
        const changePwdBtn = document.getElementById('change-password-btn');
        if (changePwdBtn) {
            changePwdBtn.onclick = handlePasswordChange;
        }

        // Backup/Restore
        const exportBackupBtn = document.getElementById('export-backup');
        if (exportBackupBtn) {
            exportBackupBtn.onclick = exportBackup;
        }

        const importBackupInput = document.getElementById('import-backup');
        if (importBackupInput) {
            importBackupInput.onchange = importBackup;
        }

        // Reset buttons
        const resetColorsBtn = document.getElementById('reset-colors');
        if (resetColorsBtn) {
            resetColorsBtn.onclick = () => {
                settings.colors = JSON.parse(JSON.stringify(defaultSettings.colors));
                saveToHistory();
                applySettings();
                renderCurrentTab();
                showNotification('Colors reset to defaults', 'success');
            };
        }

        const resetImagesBtn = document.getElementById('reset-images');
        if (resetImagesBtn) {
            resetImagesBtn.onclick = () => {
                settings.images = JSON.parse(JSON.stringify(defaultSettings.images));
                saveToHistory();
                applySettings();
                renderCurrentTab();
                showNotification('Images reset to defaults', 'success');
            };
        }

        const resetTextBtn = document.getElementById('reset-text');
        if (resetTextBtn) {
            resetTextBtn.onclick = () => {
                settings.text = {};
                saveToHistory();
                applySettings();
                renderCurrentTab();
                showNotification('Text reset to defaults', 'success');
            };
        }

        const resetAllBtn = document.getElementById('reset-all');
        if (resetAllBtn) {
            resetAllBtn.onclick = () => {
                if (confirm('Are you sure? This will reset EVERYTHING including your password!')) {
                    resetAll();
                }
            };
        }

        // Export for GitHub button
        const exportGitHubBtn = document.getElementById('export-for-github');
        if (exportGitHubBtn) {
            exportGitHubBtn.onclick = exportForGitHub;
        }

        // CRM Event Listeners
        setupCRMEventListeners();

        // Services Manager Event Listeners
        setupServicesEventListeners();

        // Team Manager Event Listeners
        setupTeamEventListeners();
    }

    // Temporary variable to store uploaded photo
    let tempMemberPhoto = null;

    function setupTeamEventListeners() {
        // Add new team member button
        const addBtn = document.getElementById('add-new-team-member');
        if (addBtn) {
            addBtn.onclick = () => openTeamModal(null);
        }

        // Edit team member buttons
        document.querySelectorAll('.team-manager-edit').forEach(btn => {
            btn.onclick = (e) => {
                const memberId = e.target.dataset.memberId;
                const member = settings.team.find(m => m.id === memberId);
                if (member) openTeamModal(member);
            };
        });

        // Delete team member buttons
        document.querySelectorAll('.team-manager-delete').forEach(btn => {
            btn.onclick = (e) => {
                const memberId = e.target.dataset.memberId;
                if (confirm('Are you sure you want to remove this team member?')) {
                    settings.team = settings.team.filter(m => m.id !== memberId);
                    saveToHistory();
                    applyTeam();
                    renderCurrentTab();
                    showNotification('Team member removed', 'info');
                }
            };
        });

        // Toggle team member enabled
        document.querySelectorAll('.team-manager-toggle input').forEach(input => {
            input.onchange = (e) => {
                const memberId = e.target.dataset.memberId;
                const member = settings.team.find(m => m.id === memberId);
                if (member) {
                    member.enabled = e.target.checked;
                    saveToHistory();
                    applyTeam();
                    renderCurrentTab();
                    showNotification(member.enabled ? 'Team member visible' : 'Team member hidden', 'success');
                }
            };
        });

        // Modal buttons
        const cancelBtn = document.getElementById('cancel-team-edit');
        if (cancelBtn) {
            cancelBtn.onclick = closeTeamModal;
        }

        const saveBtn = document.getElementById('save-team-edit');
        if (saveBtn) {
            saveBtn.onclick = saveTeamEdit;
        }

        // Photo upload
        const photoInput = document.getElementById('upload-member-photo');
        if (photoInput) {
            photoInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (file.size > 2 * 1024 * 1024) {
                    showNotification('Image too large. Max size is 2MB.', 'error');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    tempMemberPhoto = event.target.result;
                    const preview = document.getElementById('member-photo-preview');
                    if (preview) {
                        preview.innerHTML = `<img src="${tempMemberPhoto}" alt="Preview">`;
                    }
                };
                reader.readAsDataURL(file);
            };
        }
    }

    function openTeamModal(member) {
        const modal = document.getElementById('team-edit-modal');
        const title = document.getElementById('team-modal-title');
        const idInput = document.getElementById('edit-member-id');
        const nameInput = document.getElementById('edit-member-name');
        const roleInput = document.getElementById('edit-member-role');
        const bioInput = document.getElementById('edit-member-bio');
        const emailInput = document.getElementById('edit-member-email');
        const phoneInput = document.getElementById('edit-member-phone');
        const linkedinInput = document.getElementById('edit-member-linkedin');
        const photoPreview = document.getElementById('member-photo-preview');

        tempMemberPhoto = null;

        if (member) {
            // Editing existing member
            title.textContent = 'Edit Team Member';
            idInput.value = member.id;
            nameInput.value = member.name;
            roleInput.value = member.role;
            bioInput.value = member.bio || '';
            emailInput.value = member.email || '';
            phoneInput.value = member.phone || '';
            linkedinInput.value = member.linkedin || '';
            
            if (member.photo) {
                tempMemberPhoto = member.photo;
                photoPreview.innerHTML = `<img src="${member.photo}" alt="${member.name}">`;
            } else {
                photoPreview.innerHTML = '<span>📷</span>';
            }
        } else {
            // Adding new member
            title.textContent = 'Add Team Member';
            idInput.value = '';
            nameInput.value = '';
            roleInput.value = '';
            bioInput.value = '';
            emailInput.value = '';
            phoneInput.value = '';
            linkedinInput.value = '';
            photoPreview.innerHTML = '<span>📷</span>';
        }

        modal.style.display = 'flex';
    }

    function closeTeamModal() {
        const modal = document.getElementById('team-edit-modal');
        modal.style.display = 'none';
        tempMemberPhoto = null;
    }

    function saveTeamEdit() {
        const idInput = document.getElementById('edit-member-id');
        const nameInput = document.getElementById('edit-member-name');
        const roleInput = document.getElementById('edit-member-role');
        const bioInput = document.getElementById('edit-member-bio');
        const emailInput = document.getElementById('edit-member-email');
        const phoneInput = document.getElementById('edit-member-phone');
        const linkedinInput = document.getElementById('edit-member-linkedin');

        const name = nameInput.value.trim();
        const role = roleInput.value.trim();
        const bio = bioInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const linkedin = linkedinInput.value.trim();

        if (!name) {
            showNotification('Please enter a name', 'error');
            return;
        }

        if (!role) {
            showNotification('Please enter a role/title', 'error');
            return;
        }

        if (idInput.value) {
            // Update existing member
            const member = settings.team.find(m => m.id === idInput.value);
            if (member) {
                member.name = name;
                member.role = role;
                member.bio = bio;
                member.email = email;
                member.phone = phone;
                member.linkedin = linkedin;
                if (tempMemberPhoto) {
                    member.photo = tempMemberPhoto;
                }
                showNotification('Team member updated!', 'success');
            }
        } else {
            // Add new member
            const newId = 'member_' + Date.now();
            settings.team.push({
                id: newId,
                name: name,
                role: role,
                bio: bio,
                email: email,
                phone: phone,
                linkedin: linkedin,
                photo: tempMemberPhoto,
                enabled: true
            });
            showNotification('Team member added!', 'success');
        }

        saveToHistory();
        applyTeam();
        closeTeamModal();
        renderCurrentTab();
    }

    function setupServicesEventListeners() {
        // Add new service button
        const addBtn = document.getElementById('add-new-service');
        if (addBtn) {
            addBtn.onclick = () => openServiceModal(null);
        }

        // Edit service buttons
        document.querySelectorAll('.service-manager-edit').forEach(btn => {
            btn.onclick = (e) => {
                const serviceId = e.target.dataset.serviceId;
                const service = settings.services.find(s => s.id === serviceId);
                if (service) openServiceModal(service);
            };
        });

        // Delete service buttons
        document.querySelectorAll('.service-manager-delete').forEach(btn => {
            btn.onclick = (e) => {
                const serviceId = e.target.dataset.serviceId;
                if (confirm('Are you sure you want to delete this service?')) {
                    settings.services = settings.services.filter(s => s.id !== serviceId);
                    saveToHistory();
                    applyServices();
                    renderCurrentTab();
                    showNotification('Service deleted', 'info');
                }
            };
        });

        // Toggle service enabled
        document.querySelectorAll('.service-manager-toggle input').forEach(input => {
            input.onchange = (e) => {
                const serviceId = e.target.dataset.serviceId;
                const service = settings.services.find(s => s.id === serviceId);
                if (service) {
                    service.enabled = e.target.checked;
                    saveToHistory();
                    applyServices();
                    renderCurrentTab();
                    showNotification(service.enabled ? 'Service enabled' : 'Service disabled', 'success');
                }
            };
        });

        // Modal buttons
        const cancelBtn = document.getElementById('cancel-service-edit');
        if (cancelBtn) {
            cancelBtn.onclick = closeServiceModal;
        }

        const saveBtn = document.getElementById('save-service-edit');
        if (saveBtn) {
            saveBtn.onclick = saveServiceEdit;
        }
    }

    function openServiceModal(service) {
        const modal = document.getElementById('service-edit-modal');
        const title = document.getElementById('service-modal-title');
        const idInput = document.getElementById('edit-service-id');
        const nameInput = document.getElementById('edit-service-name');
        const descInput = document.getElementById('edit-service-description');
        const iconSelect = document.getElementById('edit-service-icon');

        if (service) {
            // Editing existing service
            title.textContent = 'Edit Service';
            idInput.value = service.id;
            nameInput.value = service.name;
            descInput.value = service.description;
            iconSelect.value = service.icon;
        } else {
            // Adding new service
            title.textContent = 'Add New Service';
            idInput.value = '';
            nameInput.value = '';
            descInput.value = '';
            iconSelect.value = 'more';
        }

        modal.style.display = 'flex';
    }

    function closeServiceModal() {
        const modal = document.getElementById('service-edit-modal');
        modal.style.display = 'none';
    }

    function saveServiceEdit() {
        const idInput = document.getElementById('edit-service-id');
        const nameInput = document.getElementById('edit-service-name');
        const descInput = document.getElementById('edit-service-description');
        const iconSelect = document.getElementById('edit-service-icon');

        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        const icon = iconSelect.value;

        if (!name) {
            showNotification('Please enter a service name', 'error');
            return;
        }

        if (!description) {
            showNotification('Please enter a description', 'error');
            return;
        }

        if (idInput.value) {
            // Update existing service
            const service = settings.services.find(s => s.id === idInput.value);
            if (service) {
                service.name = name;
                service.description = description;
                service.icon = icon;
                showNotification('Service updated!', 'success');
            }
        } else {
            // Add new service
            const newId = 'service_' + Date.now();
            settings.services.push({
                id: newId,
                name: name,
                description: description,
                icon: icon,
                enabled: true
            });
            showNotification('Service added!', 'success');
        }

        saveToHistory();
        applyServices();
        closeServiceModal();
        renderCurrentTab();
    }

    function setupCRMEventListeners() {
        // Export to Obsidian (all leads)
        const exportObsidianBtn = document.getElementById('crm-export-obsidian');
        if (exportObsidianBtn) {
            exportObsidianBtn.onclick = exportAllToObsidian;
        }

        // Export to CSV
        const exportCSVBtn = document.getElementById('crm-export-csv');
        if (exportCSVBtn) {
            exportCSVBtn.onclick = exportToCSV;
        }

        // Filter changes
        const filterType = document.getElementById('crm-filter-type');
        const filterStatus = document.getElementById('crm-filter-status');
        if (filterType) filterType.onchange = filterLeads;
        if (filterStatus) filterStatus.onchange = filterLeads;

        // Lead type change dropdowns
        document.querySelectorAll('.crm-type-select').forEach(select => {
            select.onchange = (e) => {
                const leadId = e.target.dataset.leadId;
                const newType = e.target.value;
                
                window.HBG_CRM.updateLead(leadId, { leadType: newType });
                showNotification(`Lead type updated to ${newType}`, 'success');
                renderCurrentTab(); // Refresh to update stats
            };
        });

        // Status change dropdowns
        document.querySelectorAll('.crm-status-select').forEach(select => {
            select.onchange = (e) => {
                const leadId = e.target.dataset.leadId;
                const newStatus = e.target.value;
                const updates = { status: newStatus };
                
                // If changing to Contacted, set the date
                if (newStatus === 'Contacted') {
                    updates.dateContacted = new Date().toISOString().split('T')[0];
                }
                
                window.HBG_CRM.updateLead(leadId, updates);
                showNotification(`Status updated to ${newStatus}`, 'success');
                renderCurrentTab(); // Refresh to update stats
            };
        });

        // Individual export buttons
        document.querySelectorAll('.crm-btn-export').forEach(btn => {
            btn.onclick = (e) => {
                const leadId = e.target.dataset.leadId;
                const leads = window.HBG_CRM.getLeads();
                const lead = leads.find(l => l.id === leadId);
                if (lead) {
                    downloadObsidianFile(lead);
                }
            };
        });

        // Delete buttons
        document.querySelectorAll('.crm-btn-delete').forEach(btn => {
            btn.onclick = (e) => {
                const leadId = e.target.dataset.leadId;
                if (confirm('Are you sure you want to delete this lead?')) {
                    window.HBG_CRM.deleteLead(leadId);
                    showNotification('Lead deleted', 'info');
                    renderCurrentTab();
                }
            };
        });
    }

    function filterLeads() {
        const typeFilter = document.getElementById('crm-filter-type').value;
        const statusFilter = document.getElementById('crm-filter-status').value;
        
        let leads = window.HBG_CRM.getLeads();
        
        if (typeFilter !== 'all') {
            leads = leads.filter(l => l.leadType === typeFilter);
        }
        if (statusFilter !== 'all') {
            leads = leads.filter(l => l.status === statusFilter);
        }
        
        const listContainer = document.getElementById('crm-leads-list');
        if (listContainer) {
            listContainer.innerHTML = leads.length === 0 ?
                '<p class="crm-empty">No leads match the current filter.</p>' :
                leads.map(lead => renderLeadCard(lead)).join('');
            
            // Re-attach event listeners for new elements
            setupCRMEventListeners();
        }
    }

    function downloadObsidianFile(lead) {
        const content = window.HBG_CRM.exportLeadToObsidian(lead);
        const filename = `${lead.dateSubmitted}-${lead.name.replace(/[^a-zA-Z0-9]/g, '-')}.md`;
        
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        showNotification(`Exported: ${filename}`, 'success');
    }

    function exportAllToObsidian() {
        const leads = window.HBG_CRM.getLeads();
        if (leads.length === 0) {
            showNotification('No leads to export', 'error');
            return;
        }

        // Create a zip-like download (multiple files)
        // For simplicity, we'll create a combined markdown file or download individually
        if (leads.length === 1) {
            downloadObsidianFile(leads[0]);
        } else {
            // Create a folder structure as a single markdown with all leads
            // Or download as individual files
            const confirmBulk = confirm(`Export ${leads.length} leads as individual .md files?\n\nClick OK to download all files.\nClick Cancel to download as a single combined file.`);
            
            if (confirmBulk) {
                // Download each file (with small delay to prevent browser blocking)
                leads.forEach((lead, index) => {
                    setTimeout(() => downloadObsidianFile(lead), index * 200);
                });
            } else {
                // Combined file
                let combined = `---
type: leads_export
export_date: ${new Date().toISOString().split('T')[0]}
total_leads: ${leads.length}
---

# HBG Leads Export

Exported on ${new Date().toLocaleDateString()}

---

`;
                leads.forEach(lead => {
                    combined += window.HBG_CRM.exportLeadToObsidian(lead);
                    combined += '\n---\n\n';
                });

                const blob = new Blob([combined], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `hbg-leads-export-${new Date().toISOString().split('T')[0]}.md`;
                a.click();
                URL.revokeObjectURL(url);
                
                showNotification(`Exported ${leads.length} leads`, 'success');
            }
        }
    }

    function exportToCSV() {
        const leads = window.HBG_CRM.getLeads();
        if (leads.length === 0) {
            showNotification('No leads to export', 'error');
            return;
        }

        const headers = ['Name', 'Email', 'Phone', 'Service', 'Lead Type', 'Status', 'Date Submitted', 'Date Contacted', 'Message', 'Notes'];
        const rows = leads.map(lead => [
            lead.name,
            lead.email,
            lead.phone,
            lead.service,
            lead.leadType,
            lead.status,
            lead.dateSubmitted,
            lead.dateContacted,
            lead.message ? `"${lead.message.replace(/"/g, '""')}"` : '',
            lead.notes ? `"${lead.notes.replace(/"/g, '""')}"` : ''
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hbg-leads-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        showNotification(`Exported ${leads.length} leads to CSV`, 'success');
    }

    // ===== Action Handlers =====
    function handleLogin() {
        const input = document.getElementById('customizer-password');
        const password = input.value;
        
        if (password === getPassword()) {
            state.isLoggedIn = true;
            document.getElementById('customizer-login').style.display = 'none';
            document.getElementById('customizer-editor').style.display = 'flex';
            renderCurrentTab();
            showNotification('Welcome back!', 'success');
        } else {
            input.classList.add('error');
            showNotification('Incorrect password', 'error');
            setTimeout(() => input.classList.remove('error'), 500);
        }
        input.value = '';
    }

    function togglePanel() {
        state.isOpen = !state.isOpen;
        const panel = document.getElementById('customizer-panel');
        const overlay = document.getElementById('customizer-overlay');
        const floatBtn = document.getElementById('customizer-float-btn');
        
        if (state.isOpen) {
            panel.classList.add('open');
            overlay.classList.add('open');
            floatBtn.classList.add('hidden');
        } else {
            panel.classList.remove('open');
            overlay.classList.remove('open');
            floatBtn.classList.remove('hidden');
            // Reset to login if not saved
            if (!state.isLoggedIn) {
                document.getElementById('customizer-login').style.display = 'flex';
                document.getElementById('customizer-editor').style.display = 'none';
            }
        }
    }

    function switchTab(tabName) {
        state.currentTab = tabName;
        document.querySelectorAll('.customizer-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        renderCurrentTab();
    }

    function toggleEditMode() {
        state.isEditMode = !state.isEditMode;
        document.body.classList.toggle('customizer-edit-mode', state.isEditMode);
        
        const btn = document.getElementById('customizer-edit-mode');
        btn.classList.toggle('active', state.isEditMode);
        
        // Update text tab button if visible
        const textTabBtn = document.getElementById('toggle-edit-mode-btn');
        if (textTabBtn) {
            textTabBtn.textContent = state.isEditMode ? '✏️ Edit Mode: ON - Click any text to edit' : '✏️ Turn On Edit Mode';
        }
        
        if (state.isEditMode) {
            showNotification('Edit Mode ON: Click any text to edit', 'info');
        } else {
            showNotification('Edit Mode OFF', 'info');
        }
    }

    function previewSite() {
        togglePanel();
        if (state.isEditMode) {
            toggleEditMode();
        }
        showNotification('Preview mode - Click Customize to continue editing', 'info');
    }

    function handleImageUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showNotification('Image too large. Max size is 2MB.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            settings.images[type] = e.target.result;
            saveToHistory();
            applySettings();
            renderCurrentTab();
            showNotification('Image uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }

    function handlePasswordChange() {
        const current = document.getElementById('current-password').value;
        const newPwd = document.getElementById('new-password').value;
        const confirm = document.getElementById('confirm-password').value;

        if (current !== getPassword()) {
            showNotification('Current password is incorrect', 'error');
            return;
        }

        if (newPwd.length < 4) {
            showNotification('New password must be at least 4 characters', 'error');
            return;
        }

        if (newPwd !== confirm) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        setPassword(newPwd);
        showNotification('Password updated successfully!', 'success');
        
        // Clear inputs
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    }

    function applyPreset(presetName) {
        const presets = {
            default: {
                outerSpace: '#242e33',
                greenWhite: '#e8ece3',
                shakespeare: '#45b1d9',
                astral: '#347baa'
            },
            warm: {
                outerSpace: '#2d2a26',
                greenWhite: '#f5f0e8',
                shakespeare: '#e07b53',
                astral: '#c45d3a'
            },
            forest: {
                outerSpace: '#1a2e1a',
                greenWhite: '#e8efe8',
                shakespeare: '#4a9c6d',
                astral: '#2d7a4a'
            },
            purple: {
                outerSpace: '#2a2433',
                greenWhite: '#f0e8f5',
                shakespeare: '#9b59b6',
                astral: '#7d3c98'
            }
        };

        if (presets[presetName]) {
            settings.colors = { ...presets[presetName] };
            saveToHistory();
            applySettings();
            renderCurrentTab();
            showNotification(`Applied ${presetName} preset`, 'success');
        }
    }

    function exportSettings() {
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hbg-website-settings.json';
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Settings exported!', 'success');
    }

    function exportBackup() {
        const backup = {
            settings: settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hbg-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Backup exported!', 'success');
    }

    function importBackup(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                if (backup.settings) {
                    settings = deepMerge(defaultSettings, backup.settings);
                    saveToHistory();
                    applySettings();
                    renderCurrentTab();
                    showNotification('Backup restored successfully!', 'success');
                } else {
                    throw new Error('Invalid backup file');
                }
            } catch (err) {
                showNotification('Failed to import backup. Invalid file.', 'error');
            }
        };
        reader.readAsText(file);
    }

    // ===== Export for GitHub =====
    function exportForGitHub() {
        showNotification('Generating files...', 'info');
        
        // Separate images from settings to keep files manageable
        const settingsWithoutImages = JSON.parse(JSON.stringify(settings));
        const images = {
            logo: settings.images.logo,
            heroImage: settings.images.heroImage,
            favicon: settings.images.favicon,
            teamPhotos: {}
        };
        
        // Extract team photos
        if (settings.team && settings.team.length > 0) {
            settings.team.forEach((member, index) => {
                if (member.photo) {
                    images.teamPhotos[member.id] = member.photo;
                    settingsWithoutImages.team[index].photo = `__TEAM_PHOTO_${member.id}__`;
                }
            });
        }
        
        // Clear large base64 from main settings, use placeholders
        settingsWithoutImages.images.logo = settings.images.logo ? '__LOGO__' : null;
        settingsWithoutImages.images.heroImage = settings.images.heroImage ? '__HERO_IMAGE__' : null;
        settingsWithoutImages.images.favicon = settings.images.favicon ? '__FAVICON__' : null;

        // Generate settings.js file content (formatted nicely)
        const settingsFileContent = `/**
 * HBG Website Settings
 * Generated: ${new Date().toISOString()}
 * 
 * This file contains your website customization settings.
 * Edit carefully or use the Website Customizer to make changes.
 */

window.HBG_EMBEDDED_SETTINGS = {
    // === COLORS ===
    colors: {
        outerSpace: "${settings.colors.outerSpace}",
        greenWhite: "${settings.colors.greenWhite}",
        shakespeare: "${settings.colors.shakespeare}",
        astral: "${settings.colors.astral}"
    },

    // === FONTS ===
    fonts: ${JSON.stringify(settings.fonts, null, 8).replace(/^/gm, '    ').trim()},

    // === SECTIONS VISIBILITY ===
    sections: {
        home: ${settings.sections.home},
        about: ${settings.sections.about},
        services: ${settings.sections.services},
        careers: ${settings.sections.careers},
        contact: ${settings.sections.contact},
        team: ${settings.sections.team}
    },

    // === SECTION ORDER ===
    sectionOrder: ${JSON.stringify(settings.sectionOrder)},

    // === SECTION BACKGROUNDS ===
    backgrounds: {
        home: "${settings.backgrounds.home}",
        about: "${settings.backgrounds.about}",
        services: "${settings.backgrounds.services}",
        careers: "${settings.backgrounds.careers}",
        contact: "${settings.backgrounds.contact}",
        team: "${settings.backgrounds.team}"
    },

    // === TEXT CONTENT ===
    text: ${JSON.stringify(settings.text, null, 8).replace(/^/gm, '    ').trim()},

    // === SERVICES ===
    services: [
${settings.services.map(service => `        {
            id: "${service.id}",
            name: "${service.name.replace(/"/g, '\\"')}",
            description: "${service.description.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
            icon: "${service.icon}",
            enabled: ${service.enabled}
        }`).join(',\n')}
    ],

    // === TEAM MEMBERS ===
    team: [
${settings.team.map(member => `        {
            id: "${member.id}",
            name: "${member.name.replace(/"/g, '\\"')}",
            role: "${member.role.replace(/"/g, '\\"')}",
            bio: "${(member.bio || '').replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
            email: "${member.email || ''}",
            phone: "${member.phone || ''}",
            linkedin: "${member.linkedin || ''}",
            photo: null,
            enabled: ${member.enabled}
        }`).join(',\n')}
    ],

    // === IMAGES ===
    // Images are stored in js/images.js to keep this file manageable
    images: {
        logo: null,
        heroImage: null,
        favicon: null
    }
};

// Load images from separate file if available
if (window.HBG_IMAGES) {
    window.HBG_EMBEDDED_SETTINGS.images = window.HBG_IMAGES.images || window.HBG_EMBEDDED_SETTINGS.images;
    
    // Restore team photos
    if (window.HBG_IMAGES.teamPhotos && window.HBG_EMBEDDED_SETTINGS.team) {
        window.HBG_EMBEDDED_SETTINGS.team.forEach(member => {
            if (window.HBG_IMAGES.teamPhotos[member.id]) {
                member.photo = window.HBG_IMAGES.teamPhotos[member.id];
            }
        });
    }
}
`;

        // Generate images.js file content
        const imagesFileContent = `/**
 * HBG Website Images
 * Generated: ${new Date().toISOString()}
 * 
 * This file contains base64-encoded images.
 * Note: These are long strings - this is normal for base64 images.
 */

window.HBG_IMAGES = {
    images: {
        logo: ${images.logo ? `"${images.logo}"` : 'null'},
        heroImage: ${images.heroImage ? `"${images.heroImage}"` : 'null'},
        favicon: ${images.favicon ? `"${images.favicon}"` : 'null'}
    },
    teamPhotos: {
${Object.entries(images.teamPhotos).map(([id, photo]) => `        "${id}": "${photo}"`).join(',\n')}
    }
};
`;

        // Generate updated index.html that loads the settings files
        const indexHtmlAdditions = `
    <!-- HBG Website Settings - Load before customizer.js -->
    <script src="js/images.js"><\/script>
    <script src="js/settings.js"><\/script>`;

        // Create downloadable files
        const files = [
            { 
                name: 'js/settings.js', 
                content: settingsFileContent,
                description: 'Your website settings (colors, text, services, team)'
            },
            { 
                name: 'js/images.js', 
                content: imagesFileContent,
                description: 'Your uploaded images (logo, hero, team photos)'
            },
            { 
                name: 'settings-backup.json', 
                content: JSON.stringify({ 
                    settings, 
                    exportDate: new Date().toISOString(), 
                    version: '1.0' 
                }, null, 2),
                description: 'Complete backup file (for importing later)'
            }
        ];
        
        // Download each file with a delay
        files.forEach((file, index) => {
            setTimeout(() => {
                const blob = new Blob([file.content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                // Remove folder prefix for download
                a.download = file.name.replace('js/', '');
                a.click();
                URL.revokeObjectURL(url);
                
                if (index === files.length - 1) {
                    showNotification('Files downloaded! See instructions below.', 'success');
                    showExportInstructions();
                }
            }, index * 500);
        });
    }

    function showExportInstructions() {
        const modal = document.createElement('div');
        modal.id = 'export-instructions-modal';
        modal.innerHTML = `
            <div class="export-modal-backdrop"></div>
            <div class="export-modal-content">
                <h3>📦 Files Downloaded!</h3>
                <p>Upload these files to your GitHub repository:</p>
                <ol>
                    <li><strong>settings.js</strong> → Upload to <code>js/</code> folder</li>
                    <li><strong>images.js</strong> → Upload to <code>js/</code> folder</li>
                    <li><strong>settings-backup.json</strong> → Keep as backup (optional upload)</li>
                </ol>
                <p>⚠️ <strong>Important:</strong> Make sure your index.html includes these lines before the customizer.js script:</p>
                <pre>&lt;script src="js/images.js"&gt;&lt;/script&gt;
&lt;script src="js/settings.js"&gt;&lt;/script&gt;</pre>
                <button onclick="this.closest('#export-instructions-modal').remove()">Got it!</button>
            </div>
        `;
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:10003;display:flex;align-items:center;justify-content:center;';
        modal.querySelector('.export-modal-backdrop').style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);';
        modal.querySelector('.export-modal-content').style.cssText = 'position:relative;background:#1a1f23;padding:24px;border-radius:16px;max-width:500px;margin:20px;color:#fff;font-family:Poppins,sans-serif;';
        modal.querySelector('h3').style.cssText = 'margin:0 0 16px 0;font-size:20px;';
        modal.querySelector('ol').style.cssText = 'margin:16px 0;padding-left:20px;line-height:1.8;';
        modal.querySelector('pre').style.cssText = 'background:#242e33;padding:12px;border-radius:8px;overflow-x:auto;font-size:12px;margin:12px 0;';
        modal.querySelector('code').style.cssText = 'background:#242e33;padding:2px 6px;border-radius:4px;font-size:12px;';
        modal.querySelector('button').style.cssText = 'width:100%;padding:12px;background:linear-gradient(135deg,#45b1d9,#347baa);border:none;border-radius:8px;color:#fff;font-size:16px;font-weight:600;cursor:pointer;margin-top:16px;';
        document.body.appendChild(modal);
    }

    function generateFilesManually() {
        // Fallback - just export the settings backup
        const backup = { settings, exportDate: new Date().toISOString(), version: '1.0' };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hbg-settings-backup.json';
        a.click();
        URL.revokeObjectURL(url);
        
        showNotification('Backup exported! Import this file on another device to restore.', 'success');
    }

    function resetAll() {
        localStorage.removeItem(CONFIG.storageKey);
        localStorage.removeItem(CONFIG.passwordKey);
        settings = JSON.parse(JSON.stringify(defaultSettings));
        state.history = [];
        state.historyIndex = -1;
        saveToHistory();
        applySettings();
        renderCurrentTab();
        showNotification('All settings reset to defaults', 'success');
    }

    // ===== Section Reordering Functions =====
    function moveSectionUp(sectionId) {
        const order = settings.sectionOrder || ['home', 'about', 'services', 'careers', 'contact', 'team'];
        const index = order.indexOf(sectionId);
        if (index > 0) {
            [order[index - 1], order[index]] = [order[index], order[index - 1]];
            settings.sectionOrder = order;
            saveToHistory();
            applySectionOrder();
            renderCurrentTab();
        }
    }

    function moveSectionDown(sectionId) {
        const order = settings.sectionOrder || ['home', 'about', 'services', 'careers', 'contact', 'team'];
        const index = order.indexOf(sectionId);
        if (index < order.length - 1) {
            [order[index], order[index + 1]] = [order[index + 1], order[index]];
            settings.sectionOrder = order;
            saveToHistory();
            applySectionOrder();
            renderCurrentTab();
        }
    }

    function setupSectionDragAndDrop() {
        const list = document.getElementById('section-reorder-list');
        if (!list) return;

        let draggedItem = null;

        list.querySelectorAll('.section-reorder-item').forEach(item => {
            item.draggable = true;

            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                draggedItem = null;
                // Update order from DOM
                updateSectionOrderFromDOM();
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                const rect = item.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                if (e.clientY < midpoint) {
                    item.classList.add('drag-over-top');
                    item.classList.remove('drag-over-bottom');
                } else {
                    item.classList.add('drag-over-bottom');
                    item.classList.remove('drag-over-top');
                }
            });

            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over-top', 'drag-over-bottom');
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over-top', 'drag-over-bottom');
                if (draggedItem && draggedItem !== item) {
                    const rect = item.getBoundingClientRect();
                    const midpoint = rect.top + rect.height / 2;
                    if (e.clientY < midpoint) {
                        list.insertBefore(draggedItem, item);
                    } else {
                        list.insertBefore(draggedItem, item.nextSibling);
                    }
                }
            });
        });
    }

    function updateSectionOrderFromDOM() {
        const list = document.getElementById('section-reorder-list');
        if (!list) return;

        const newOrder = [];
        list.querySelectorAll('.section-reorder-item').forEach(item => {
            newOrder.push(item.dataset.section);
        });

        settings.sectionOrder = newOrder;
        saveToHistory();
        applySectionOrder();
        showNotification('Section order updated', 'success');
    }

    function applySectionOrder() {
        const order = settings.sectionOrder || ['home', 'about', 'services', 'careers', 'contact', 'team'];
        const main = document.querySelector('body');
        
        // Get all sections
        const sections = {};
        order.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                sections[sectionId] = section;
            }
        });

        // Find the container (after nav and before footer)
        const nav = document.querySelector('nav');
        const footer = document.querySelector('footer');
        
        if (nav && footer) {
            // Reinsert sections in the correct order
            order.forEach(sectionId => {
                if (sections[sectionId]) {
                    footer.parentNode.insertBefore(sections[sectionId], footer);
                }
            });
        }
    }

    // ===== Apply Settings to Page =====
    function applySettings() {
        applyColors();
        applyImages();
        applyTextSettings();
        applySectionOrder();
        applySectionVisibility();
        applyBackgrounds();
        applyServices();
        applyTeam();
    }

    function applyColors() {
        const root = document.documentElement;
        root.style.setProperty('--outer-space', settings.colors.outerSpace);
        root.style.setProperty('--green-white', settings.colors.greenWhite);
        root.style.setProperty('--shakespeare', settings.colors.shakespeare);
        root.style.setProperty('--astral', settings.colors.astral);

        // Update gradient backgrounds dynamically
        document.querySelectorAll('.gradient-bg').forEach(el => {
            el.style.background = `linear-gradient(135deg, ${settings.colors.shakespeare} 0%, ${settings.colors.astral} 100%)`;
        });

        document.querySelectorAll('.gradient-horizontal').forEach(el => {
            el.style.background = `linear-gradient(to right, ${settings.colors.shakespeare}, ${settings.colors.astral})`;
        });

        document.querySelectorAll('.gradient-diagonal').forEach(el => {
            el.style.background = `linear-gradient(to bottom right, ${settings.colors.shakespeare}, ${settings.colors.astral})`;
        });
    }

    function applyImages() {
        // Logo
        if (settings.images.logo) {
            document.querySelectorAll('[data-customizer="logo"]').forEach(el => {
                if (el.tagName === 'IMG') {
                    el.src = settings.images.logo;
                } else {
                    el.innerHTML = `<img src="${settings.images.logo}" alt="Logo" style="max-width:100%;max-height:100%;">`;
                }
            });
        }

        // Hero background image
        if (settings.images.heroImage && settings.backgrounds.home === 'image') {
            const hero = document.getElementById('home');
            if (hero) {
                hero.style.backgroundImage = `url(${settings.images.heroImage})`;
                hero.style.backgroundSize = 'cover';
                hero.style.backgroundPosition = 'center';
            }
        }

        // Favicon
        if (settings.images.favicon) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = settings.images.favicon;
        }
    }

    function applyTextSettings() {
        if (settings.text.companyName) {
            document.querySelectorAll('[data-customizer="companyName"]').forEach(el => {
                el.textContent = settings.text.companyName;
            });
        }

        if (settings.text.tagline) {
            document.querySelectorAll('[data-customizer="tagline"]').forEach(el => {
                el.textContent = settings.text.tagline;
            });
        }

        // Apply other text settings as needed
        Object.keys(settings.text).forEach(key => {
            document.querySelectorAll(`[data-customizer="${key}"]`).forEach(el => {
                if (settings.text[key]) {
                    el.textContent = settings.text[key];
                }
            });
        });
    }

    function applySectionVisibility() {
        Object.keys(settings.sections).forEach(section => {
            const el = document.getElementById(section);
            if (el) {
                el.style.display = settings.sections[section] ? '' : 'none';
            }
        });

        // Also hide corresponding nav links
        document.querySelectorAll('nav a[href^="#"]').forEach(link => {
            const section = link.getAttribute('href').replace('#', '');
            if (settings.sections.hasOwnProperty(section)) {
                link.style.display = settings.sections[section] ? '' : 'none';
            }
        });
    }

    function applyBackgrounds() {
        // Helper function to apply background to a section
        function applyBgToSection(sectionId, bgType) {
            const section = document.getElementById(sectionId);
            if (!section) return;
            
            // Remove all background classes
            section.classList.remove('hero-pattern', 'hero-pattern-dark', 'bg-green-white', 'bg-outer-space', 'gradient-horizontal', 'gradient-diagonal');
            section.style.backgroundImage = '';
            section.style.background = '';
            
            switch (bgType) {
                case 'pattern':
                    section.classList.add('hero-pattern');
                    break;
                case 'light':
                    section.classList.add('hero-pattern');
                    break;
                case 'dark':
                    section.classList.add('hero-pattern-dark');
                    break;
                case 'solid-light':
                    section.classList.add('bg-green-white');
                    break;
                case 'solid-dark':
                    section.classList.add('bg-outer-space');
                    break;
                case 'gradient':
                    section.style.background = `linear-gradient(135deg, ${settings.colors.shakespeare} 0%, ${settings.colors.astral} 100%)`;
                    break;
                case 'image':
                    if (settings.images.heroImage) {
                        section.style.backgroundImage = `url(${settings.images.heroImage})`;
                        section.style.backgroundSize = 'cover';
                        section.style.backgroundPosition = 'center';
                    }
                    break;
            }
        }
        
        // Apply to all sections
        applyBgToSection('home', settings.backgrounds.home);
        applyBgToSection('about', settings.backgrounds.about);
        applyBgToSection('services', settings.backgrounds.services);
        applyBgToSection('careers', settings.backgrounds.careers);
        applyBgToSection('contact', settings.backgrounds.contact);
        applyBgToSection('team', settings.backgrounds.team);
    }

    // ===== Text Editing =====
    function setupTextEditing() {
        document.addEventListener('click', (e) => {
            if (!state.isEditMode) return;
            
            const target = e.target;
            const editableTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'LI', 'LABEL'];
            
            // Don't edit inside customizer panel
            if (target.closest('#customizer-panel') || target.closest('#customizer-float-btn')) {
                return;
            }

            if (editableTags.includes(target.tagName) && !target.querySelector('*:not(strong):not(em):not(br)')) {
                e.preventDefault();
                makeEditable(target);
            }
        });
    }

    function makeEditable(element) {
        const originalText = element.innerHTML;
        element.contentEditable = true;
        element.classList.add('customizer-editing');
        element.focus();

        // Select all text
        const range = document.createRange();
        range.selectNodeContents(element);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        const finishEditing = () => {
            element.contentEditable = false;
            element.classList.remove('customizer-editing');
            
            if (element.innerHTML !== originalText) {
                // Save to settings if it has a data-customizer attribute
                const key = element.dataset.customizer;
                if (key) {
                    settings.text[key] = element.innerHTML;
                }
                saveToHistory();
                showNotification('Text updated', 'success');
            }
        };

        element.onblur = finishEditing;
        element.onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                element.blur();
            }
            if (e.key === 'Escape') {
                element.innerHTML = originalText;
                element.blur();
            }
        };
    }

    // ===== Notifications =====
    function showNotification(message, type = 'info') {
        const container = document.getElementById('customizer-notifications');
        const notif = document.createElement('div');
        notif.className = `customizer-notification ${type}`;
        notif.textContent = message;
        container.appendChild(notif);

        setTimeout(() => notif.classList.add('show'), 10);
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }

    // ===== Utility Functions =====
    function deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    // ===== Styles =====
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Customizer Float Button - Hidden by default */
            #customizer-float-btn {
                display: none !important;
                visibility: hidden;
                pointer-events: none;
            }

            /* Overlay */
            #customizer-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 9998;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            #customizer-overlay.open {
                opacity: 1;
                visibility: visible;
            }

            /* Panel */
            #customizer-panel {
                position: fixed;
                top: 0;
                right: -420px;
                width: 400px;
                max-width: 100vw;
                height: 100vh;
                background: #1a1f23;
                z-index: 9999;
                transition: right 0.3s ease;
                display: flex;
                flex-direction: column;
                font-family: 'Poppins', sans-serif;
                color: #fff;
            }
            #customizer-panel.open {
                right: 0;
            }

            /* Screens */
            .customizer-screen {
                display: flex;
                flex-direction: column;
                height: 100%;
            }

            /* Login Screen */
            #customizer-login {
                justify-content: center;
                align-items: center;
                padding: 40px;
                background: linear-gradient(135deg, #1a1f23 0%, #242e33 100%);
            }
            .customizer-login-box {
                text-align: center;
                width: 100%;
                max-width: 280px;
            }
            .customizer-login-logo {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, var(--shakespeare) 0%, var(--astral) 100%);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
                font-size: 28px;
                font-weight: 800;
            }
            .customizer-login-box h2 {
                font-size: 24px;
                margin-bottom: 8px;
            }
            .customizer-login-box > p {
                color: #888;
                margin-bottom: 24px;
            }
            #customizer-password {
                width: 100%;
                padding: 14px 18px;
                border: 2px solid #333;
                border-radius: 10px;
                background: #242e33;
                color: #fff;
                font-size: 16px;
                margin-bottom: 16px;
                transition: border-color 0.3s;
            }
            #customizer-password:focus {
                outline: none;
                border-color: var(--shakespeare);
            }
            #customizer-password.error {
                border-color: #e74c3c;
                animation: shake 0.3s;
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            #customizer-login-btn {
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, var(--shakespeare) 0%, var(--astral) 100%);
                border: none;
                border-radius: 10px;
                color: white;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.3s;
            }
            #customizer-login-btn:hover {
                opacity: 0.9;
            }
            .customizer-hint {
                margin-top: 16px;
                font-size: 12px;
                color: #666;
            }

            /* Editor Header */
            .customizer-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid #333;
                background: #242e33;
            }
            .customizer-header h3 {
                font-size: 18px;
                font-weight: 700;
                margin: 0;
            }
            #customizer-close {
                background: none;
                border: none;
                color: #888;
                font-size: 28px;
                cursor: pointer;
                padding: 0;
                line-height: 1;
                transition: color 0.3s;
            }
            #customizer-close:hover {
                color: #fff;
            }

            /* Toolbar */
            .customizer-toolbar {
                display: flex;
                gap: 8px;
                padding: 12px 20px;
                border-bottom: 1px solid #333;
                background: #1e2428;
            }
            .customizer-toolbar button {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                background: #2d3a40;
                border: none;
                border-radius: 6px;
                color: #ccc;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s;
            }
            .customizer-toolbar button:hover:not(:disabled) {
                background: #3d4a50;
                color: #fff;
            }
            .customizer-toolbar button:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }
            .customizer-toolbar button.active {
                background: var(--shakespeare);
                color: white;
            }
            .customizer-toolbar-divider {
                width: 1px;
                background: #333;
                margin: 0 4px;
            }

            /* Tabs */
            .customizer-tabs {
                display: flex;
                overflow-x: auto;
                border-bottom: 1px solid #333;
                background: #1e2428;
            }
            .customizer-tab {
                flex: 1;
                padding: 12px 8px;
                background: none;
                border: none;
                border-bottom: 2px solid transparent;
                color: #888;
                font-size: 11px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
                white-space: nowrap;
            }
            .customizer-tab:hover {
                color: #fff;
            }
            .customizer-tab.active {
                color: var(--shakespeare);
                border-bottom-color: var(--shakespeare);
            }

            /* Content */
            .customizer-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }
            .customizer-section {
                margin-bottom: 28px;
            }
            .customizer-section h4 {
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 8px;
                color: #fff;
            }
            .customizer-help {
                font-size: 12px;
                color: #666;
                margin-bottom: 16px;
            }

            /* Color Grid */
            .customizer-color-grid {
                display: grid;
                gap: 16px;
            }
            .customizer-color-item label {
                display: block;
                font-size: 12px;
                color: #aaa;
                margin-bottom: 8px;
            }
            .customizer-color-input {
                display: flex;
                gap: 8px;
            }
            .customizer-color-input input[type="color"] {
                width: 48px;
                height: 40px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                background: none;
            }
            .customizer-color-input input[type="text"] {
                flex: 1;
                padding: 10px 12px;
                background: #2d3a40;
                border: 1px solid #3d4a50;
                border-radius: 8px;
                color: #fff;
                font-size: 13px;
                font-family: monospace;
            }
            .customizer-color-input input[type="text"]:focus {
                outline: none;
                border-color: var(--shakespeare);
            }

            /* Presets */
            .customizer-presets {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
            .customizer-preset {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 12px;
                background: #2d3a40;
                border: 2px solid transparent;
                border-radius: 10px;
                color: #fff;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s;
            }
            .customizer-preset:hover {
                border-color: var(--shakespeare);
            }
            .preset-colors {
                display: flex;
                gap: 4px;
            }
            .preset-colors span {
                width: 20px;
                height: 20px;
                border-radius: 4px;
            }

            /* Image Upload */
            .customizer-image-upload {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .customizer-image-preview {
                width: 100%;
                height: 80px;
                background: #2d3a40;
                border: 2px dashed #3d4a50;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            .customizer-image-preview.large {
                height: 120px;
            }
            .customizer-image-preview.small {
                width: 64px;
                height: 64px;
            }
            .customizer-image-preview img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
            .customizer-image-preview span {
                color: #666;
                font-size: 12px;
            }
            .customizer-logo-placeholder {
                font-size: 24px;
                font-weight: 800;
                color: var(--shakespeare);
            }
            .customizer-image-actions {
                display: flex;
                gap: 10px;
            }
            .customizer-upload-btn,
            .customizer-remove-btn {
                padding: 10px 16px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
            }
            .customizer-upload-btn {
                background: var(--shakespeare);
                color: white;
                border: none;
            }
            .customizer-upload-btn:hover {
                opacity: 0.9;
            }
            .customizer-remove-btn {
                background: none;
                border: 1px solid #666;
                color: #888;
            }
            .customizer-remove-btn:hover {
                border-color: #e74c3c;
                color: #e74c3c;
            }

            /* Form Groups */
            .customizer-form-group {
                margin-bottom: 16px;
            }
            .customizer-form-group label {
                display: block;
                font-size: 12px;
                color: #aaa;
                margin-bottom: 6px;
            }
            .customizer-form-group input,
            .customizer-form-group textarea,
            .customizer-form-group select {
                width: 100%;
                padding: 12px 14px;
                background: #2d3a40;
                border: 1px solid #3d4a50;
                border-radius: 8px;
                color: #fff;
                font-size: 14px;
                font-family: 'Poppins', sans-serif;
            }
            .customizer-form-group input:focus,
            .customizer-form-group textarea:focus,
            .customizer-form-group select:focus {
                outline: none;
                border-color: var(--shakespeare);
            }
            .customizer-form-group textarea {
                resize: vertical;
                min-height: 60px;
            }
            .customizer-form-group select {
                cursor: pointer;
            }

            /* Toggle List */
            .customizer-toggle-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .customizer-toggle-item label {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                background: #2d3a40;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.3s;
            }
            .customizer-toggle-item label:hover {
                background: #3d4a50;
            }
            .customizer-toggle-item input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: var(--shakespeare);
            }
            .customizer-toggle-item span {
                font-size: 13px;
            }

            /* Backup Actions */
            .customizer-backup-actions {
                display: flex;
                gap: 10px;
            }

            /* Reset Options */
            .customizer-reset-options {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            /* Buttons */
            .customizer-btn-primary {
                padding: 12px 20px;
                background: linear-gradient(135deg, var(--shakespeare) 0%, var(--astral) 100%);
                border: none;
                border-radius: 8px;
                color: white;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.3s;
            }
            .customizer-btn-primary:hover {
                opacity: 0.9;
            }
            .customizer-btn-secondary {
                padding: 10px 16px;
                background: #2d3a40;
                border: 1px solid #3d4a50;
                border-radius: 8px;
                color: #fff;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
            }
            .customizer-btn-secondary:hover {
                background: #3d4a50;
            }
            .customizer-btn-danger {
                padding: 10px 16px;
                background: #e74c3c;
                border: none;
                border-radius: 8px;
                color: white;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: opacity 0.3s;
            }
            .customizer-btn-danger:hover {
                opacity: 0.9;
            }
            .customizer-btn-danger-outline {
                padding: 10px 16px;
                background: none;
                border: 1px solid #e74c3c;
                border-radius: 8px;
                color: #e74c3c;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
            }
            .customizer-btn-danger-outline:hover {
                background: #e74c3c;
                color: white;
            }

            /* Footer */
            .customizer-footer {
                display: flex;
                gap: 10px;
                padding: 16px 20px;
                border-top: 1px solid #333;
                background: #242e33;
            }
            .customizer-footer .customizer-btn-primary {
                flex: 1;
            }

            /* Notifications */
            #customizer-notifications {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10001;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .customizer-notification {
                padding: 14px 20px;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 500;
                font-family: 'Poppins', sans-serif;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                transform: translateX(120%);
                transition: transform 0.3s ease;
            }
            .customizer-notification.show {
                transform: translateX(0);
            }
            .customizer-notification.success {
                background: #27ae60;
                color: white;
            }
            .customizer-notification.error {
                background: #e74c3c;
                color: white;
            }
            .customizer-notification.info {
                background: var(--shakespeare);
                color: white;
            }

            /* Edit Mode */
            body.customizer-edit-mode *[data-customizer]:hover,
            body.customizer-edit-mode h1:hover,
            body.customizer-edit-mode h2:hover,
            body.customizer-edit-mode h3:hover,
            body.customizer-edit-mode h4:hover,
            body.customizer-edit-mode p:hover,
            body.customizer-edit-mode span:hover,
            body.customizer-edit-mode li:hover {
                outline: 2px dashed var(--shakespeare);
                outline-offset: 2px;
                cursor: text;
            }
            .customizer-editing {
                outline: 2px solid var(--shakespeare) !important;
                background: rgba(69, 177, 217, 0.1) !important;
            }

            /* Responsive */
            @media (max-width: 480px) {
                #customizer-panel {
                    width: 100%;
                    right: -100%;
                }
                #customizer-float-btn span {
                    display: none;
                }
                #customizer-float-btn {
                    padding: 14px;
                    border-radius: 50%;
                }
            }

            /* CRM Styles */
            .crm-stats {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;
            }
            .crm-stat {
                background: #2d3a40;
                border-radius: 10px;
                padding: 12px 8px;
                text-align: center;
            }
            .crm-stat.new {
                background: linear-gradient(135deg, var(--shakespeare) 0%, var(--astral) 100%);
            }
            .crm-stat-number {
                display: block;
                font-size: 24px;
                font-weight: 700;
                color: #fff;
            }
            .crm-stat-label {
                font-size: 10px;
                color: #aaa;
                text-transform: uppercase;
            }
            .crm-stat.new .crm-stat-label {
                color: rgba(255,255,255,0.8);
            }

            .crm-filters {
                display: flex;
                gap: 10px;
                margin-bottom: 12px;
            }
            .crm-select {
                flex: 1;
                padding: 10px 12px;
                background: #2d3a40;
                border: 1px solid #3d4a50;
                border-radius: 8px;
                color: #fff;
                font-size: 13px;
                cursor: pointer;
            }
            .crm-select:focus {
                outline: none;
                border-color: var(--shakespeare);
            }

            .crm-export-buttons {
                display: flex;
                gap: 10px;
            }
            .crm-export-buttons button {
                flex: 1;
            }

            .crm-leads-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-height: 400px;
                overflow-y: auto;
            }
            .crm-empty {
                text-align: center;
                color: #666;
                padding: 30px;
                background: #2d3a40;
                border-radius: 10px;
            }

            .crm-lead-card {
                background: #2d3a40;
                border-radius: 10px;
                padding: 14px;
                border-left: 4px solid var(--shakespeare);
            }
            .crm-lead-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 10px;
            }
            .crm-lead-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .crm-lead-name {
                font-weight: 600;
                font-size: 15px;
                color: #fff;
            }
            .crm-lead-type {
                font-size: 10px;
                padding: 2px 8px;
                border-radius: 20px;
                text-transform: uppercase;
                font-weight: 600;
                display: inline-block;
                width: fit-content;
            }
            .crm-lead-type.client {
                background: rgba(39, 174, 96, 0.2);
                color: #27ae60;
            }
            .crm-lead-type.worker {
                background: rgba(155, 89, 182, 0.2);
                color: #9b59b6;
            }
            .crm-lead-type.unassigned {
                background: rgba(149, 165, 166, 0.2);
                color: #95a5a6;
            }
            .crm-stat.unassigned {
                background: rgba(241, 196, 15, 0.2);
                border: 1px solid rgba(241, 196, 15, 0.3);
            }
            .crm-type-select {
                padding: 8px 10px;
                background: #1a1f23;
                border: 1px solid #3d4a50;
                border-radius: 6px;
                color: #fff;
                font-size: 11px;
                cursor: pointer;
            }
            .crm-lead-status {
                font-size: 10px;
                padding: 4px 10px;
                border-radius: 20px;
                color: #fff;
                font-weight: 600;
                text-transform: uppercase;
            }
            .crm-lead-details {
                font-size: 12px;
                color: #aaa;
            }
            .crm-lead-details p {
                margin: 3px 0;
            }
            .crm-lead-message {
                font-size: 12px;
                color: #888;
                font-style: italic;
                margin-top: 8px;
                padding: 8px;
                background: #1a1f23;
                border-radius: 6px;
            }
            .crm-lead-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid #3d4a50;
            }
            .crm-status-select {
                flex: 1;
                padding: 8px 10px;
                background: #1a1f23;
                border: 1px solid #3d4a50;
                border-radius: 6px;
                color: #fff;
                font-size: 12px;
                cursor: pointer;
            }
            .crm-btn-export,
            .crm-btn-delete {
                padding: 8px 12px;
                background: #1a1f23;
                border: 1px solid #3d4a50;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s;
            }
            .crm-btn-export:hover {
                background: var(--shakespeare);
                border-color: var(--shakespeare);
            }
            .crm-btn-delete:hover {
                background: #e74c3c;
                border-color: #e74c3c;
            }

            /* Services Manager Styles */
            .services-manager-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .service-manager-card {
                background: #2d3a40;
                border-radius: 10px;
                padding: 12px;
                border-left: 4px solid var(--shakespeare);
                transition: all 0.3s;
            }
            .service-manager-card.disabled {
                opacity: 0.5;
                border-left-color: #666;
            }
            .service-manager-header {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .service-manager-drag {
                cursor: grab;
                color: #666;
                font-size: 14px;
            }
            .service-manager-toggle input {
                width: 16px;
                height: 16px;
                accent-color: var(--shakespeare);
            }
            .service-manager-icon {
                font-size: 20px;
            }
            .service-manager-title {
                flex: 1;
                font-weight: 600;
                font-size: 14px;
                color: #fff;
            }
            .service-manager-edit,
            .service-manager-delete {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 14px;
                padding: 4px 8px;
                border-radius: 4px;
                transition: background 0.3s;
            }
            .service-manager-edit:hover {
                background: rgba(69, 177, 217, 0.2);
            }
            .service-manager-delete:hover {
                background: rgba(231, 76, 60, 0.2);
            }
            .service-manager-preview {
                font-size: 11px;
                color: #888;
                margin-top: 8px;
                padding-left: 80px;
            }

            /* Service Edit Modal */
            .service-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10002;
            }
            .service-modal-content {
                background: #1a1f23;
                border-radius: 16px;
                padding: 24px;
                width: 90%;
                max-width: 400px;
                max-height: 80vh;
                overflow-y: auto;
            }
            .service-modal-content h4 {
                margin-bottom: 20px;
                font-size: 18px;
            }
            .service-modal-actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }
            .service-modal-actions button {
                flex: 1;
            }

            /* Team Manager Styles */
            .team-manager-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .team-empty {
                text-align: center;
                color: #666;
                padding: 30px;
                background: #2d3a40;
                border-radius: 10px;
            }
            .team-manager-card {
                background: #2d3a40;
                border-radius: 10px;
                padding: 12px;
                border-left: 4px solid var(--shakespeare);
                transition: all 0.3s;
            }
            .team-manager-card.disabled {
                opacity: 0.5;
                border-left-color: #666;
            }
            .team-manager-header {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .team-manager-toggle input {
                width: 16px;
                height: 16px;
                accent-color: var(--shakespeare);
            }
            .team-manager-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--shakespeare), var(--astral));
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                flex-shrink: 0;
            }
            .team-manager-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .team-manager-avatar span {
                color: white;
                font-weight: 700;
                font-size: 16px;
            }
            .team-manager-info {
                flex: 1;
                min-width: 0;
            }
            .team-manager-name {
                font-weight: 600;
                font-size: 14px;
                color: #fff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .team-manager-role {
                font-size: 11px;
                color: var(--shakespeare);
            }
            .team-manager-edit,
            .team-manager-delete {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 14px;
                padding: 4px 8px;
                border-radius: 4px;
                transition: background 0.3s;
            }
            .team-manager-edit:hover {
                background: rgba(69, 177, 217, 0.2);
            }
            .team-manager-delete:hover {
                background: rgba(231, 76, 60, 0.2);
            }

            /* Section Reorder Styles */
            .section-reorder-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .section-reorder-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px;
                background: #2d3a40;
                border-radius: 8px;
                border: 2px solid transparent;
                transition: all 0.2s;
                cursor: grab;
            }
            .section-reorder-item:hover {
                background: #3d4a50;
            }
            .section-reorder-item.dragging {
                opacity: 0.5;
                cursor: grabbing;
            }
            .section-reorder-item.drag-over-top {
                border-top-color: var(--shakespeare);
            }
            .section-reorder-item.drag-over-bottom {
                border-bottom-color: var(--shakespeare);
            }
            .section-reorder-drag {
                color: #666;
                font-size: 16px;
                cursor: grab;
                padding: 0 4px;
            }
            .section-reorder-drag:hover {
                color: var(--shakespeare);
            }
            .section-reorder-arrows {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .section-arrow-up,
            .section-arrow-down {
                background: #1a1f23;
                border: 1px solid #3d4a50;
                color: #888;
                padding: 2px 6px;
                font-size: 10px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .section-arrow-up:hover:not(:disabled),
            .section-arrow-down:hover:not(:disabled) {
                background: var(--shakespeare);
                border-color: var(--shakespeare);
                color: white;
            }
            .section-arrow-up:disabled,
            .section-arrow-down:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }
            .section-reorder-label {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
                cursor: pointer;
            }
            .section-reorder-label input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: var(--shakespeare);
            }
            .section-reorder-label span {
                font-size: 13px;
                color: #fff;
            }

            /* Team Edit Modal */
            .team-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10002;
            }
            .team-modal-content {
                background: #1a1f23;
                border-radius: 16px;
                padding: 24px;
                width: 90%;
                max-width: 400px;
                max-height: 80vh;
                overflow-y: auto;
            }
            .team-modal-content h4 {
                margin-bottom: 20px;
                font-size: 18px;
            }
            .team-photo-upload {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 20px;
            }
            .team-photo-preview {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: #2d3a40;
                border: 2px dashed #3d4a50;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                flex-shrink: 0;
            }
            .team-photo-preview img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .team-photo-preview span {
                font-size: 24px;
            }
            .team-modal-actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }
            .team-modal-actions button {
                flex: 1;
            }
        `;
        document.head.appendChild(style);
    }

    // ===== Initialize on DOM Ready =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
