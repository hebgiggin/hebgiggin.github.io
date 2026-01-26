/**
 * HBG - He Be Giggin' O!
 * Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== Mobile Menu Toggle =====
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close mobile menu when clicking a link
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
    
    // ===== Form Submission Handling =====
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    
    if (contactForm && formSuccess) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = {
                id: 'lead_' + Date.now(),
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value || '',
                service: document.getElementById('service').value,
                leadType: 'Unassigned',
                message: document.getElementById('message').value,
                status: 'New',
                dateSubmitted: new Date().toISOString().split('T')[0],
                dateContacted: '',
                notes: ''
            };
            
            // Save to localStorage CRM
            saveLead(formData);
            
            console.log('Lead saved:', formData);
            
            // Reset form and show success message
            contactForm.reset();
            formSuccess.classList.remove('hidden');
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                formSuccess.classList.add('hidden');
            }, 5000);
        });
    }
    
    // ===== CRM Functions =====
    function saveLead(leadData) {
        const leads = getLeads();
        leads.push(leadData);
        localStorage.setItem('hbg_crm_leads', JSON.stringify(leads));
        
        // Dispatch event for CRM panel to update
        window.dispatchEvent(new CustomEvent('leadAdded', { detail: leadData }));
    }
    
    function getLeads() {
        const saved = localStorage.getItem('hbg_crm_leads');
        return saved ? JSON.parse(saved) : [];
    }
    
    function updateLead(id, updates) {
        const leads = getLeads();
        const index = leads.findIndex(l => l.id === id);
        if (index !== -1) {
            leads[index] = { ...leads[index], ...updates };
            localStorage.setItem('hbg_crm_leads', JSON.stringify(leads));
        }
        return leads;
    }
    
    function deleteLead(id) {
        const leads = getLeads().filter(l => l.id !== id);
        localStorage.setItem('hbg_crm_leads', JSON.stringify(leads));
        return leads;
    }
    
    // Export single lead to Obsidian markdown
    function exportLeadToObsidian(lead) {
        const frontmatter = `---
type: lead
name: "${lead.name}"
email: "${lead.email}"
phone: "${lead.phone}"
service: "${lead.service}"
lead_type: "${lead.leadType}"
status: "${lead.status}"
date_submitted: ${lead.dateSubmitted}
date_contacted: ${lead.dateContacted || ''}
notes: "${lead.notes || ''}"
tags:
  - lead
  - hbg
  - ${lead.leadType.toLowerCase()}
---

# ${lead.name}

## Contact Information
- **Email:** ${lead.email}
- **Phone:** ${lead.phone || 'Not provided'}
- **Type:** ${lead.leadType}
- **Service Interested:** ${lead.service}

## Message
${lead.message || 'No message provided.'}

## Notes
${lead.notes || '_Add your notes here..._'}

## Activity Log
- **${lead.dateSubmitted}:** Lead submitted via website
${lead.dateContacted ? `- **${lead.dateContacted}:** First contact made` : ''}
`;
        return frontmatter;
    }
    
    // Export all leads to Obsidian
    function exportAllLeadsToObsidian() {
        const leads = getLeads();
        const files = leads.map(lead => ({
            filename: `${lead.dateSubmitted}-${lead.name.replace(/[^a-zA-Z0-9]/g, '-')}.md`,
            content: exportLeadToObsidian(lead)
        }));
        return files;
    }
    
    // Make functions globally available for CRM panel
    window.HBG_CRM = {
        getLeads,
        saveLead,
        updateLead,
        deleteLead,
        exportLeadToObsidian,
        exportAllLeadsToObsidian
    };
    
    // ===== Smooth Scroll for Navigation Links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ===== Navbar Shadow on Scroll =====
    const nav = document.querySelector('nav');
    
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('shadow-xl');
            } else {
                nav.classList.remove('shadow-xl');
            }
        });
    }
    
    // ===== Form Input Focus Handlers =====
    const formInputs = document.querySelectorAll('.form-input');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#45b1d9';
        });
        
        input.addEventListener('blur', function() {
            this.style.borderColor = '#3d4a50';
        });
    });
    
});

// ===== Utility Functions =====

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} - True if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
