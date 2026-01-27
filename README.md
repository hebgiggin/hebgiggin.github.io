# HBG - He Be Giggin' O!

![HBG Logo](https://img.shields.io/badge/HBG-He%20Be%20Giggin'%20O!-45b1d9?style=for-the-badge)

**Ohio Tristate's Trusted Gig Work Partner**

A professional website for HBG, a gig work company serving the Ohio Tristate Area with over 30 years of experience.

## 🌟 Features

- **Responsive Design** - Fully mobile-friendly layout
- **Modern UI** - Clean, professional design with smooth animations
- **Single Page Application** - All sections accessible via smooth scrolling
- **Contact Form** - Ready for backend integration
- **SEO Optimized** - Meta tags and semantic HTML structure
- **🎨 Built-in Website Customizer** - Visual editor for non-technical users

## 🎛️ Website Customizer

This website includes a powerful built-in customizer that allows you to edit the site without touching any code!

### Accessing the Customizer (Hidden Admin Panel)

The customizer is **completely hidden** from regular visitors. Only admins know how to access it:

| Method | How To |
|--------|--------|
| **Keyboard Shortcut** | Press `Ctrl + Shift + A` |
| **Secret Click** | Triple-click on the footer HBG logo |

After accessing, enter the password (default: `hbg2024`) to start editing.

### Customizer Features
| Feature | Description |
|---------|-------------|
| 🎨 **Color Editor** | Change all brand colors with color pickers |
| 🖼️ **Image Upload** | Upload logos, hero images, favicons (stored as base64) |
| 📝 **Text Editor** | Click directly on any text to edit it |
| 🛠️ **Services Manager** | Add, edit, delete, and reorder services (syncs with Contact form dropdown) |
| 👥 **Team Manager** | Add team members with photos, bios, and contact info |
| 📐 **Section Manager** | Show/hide and **reorder** sections with drag-and-drop |
| 🎭 **Background Styles** | Change ALL 6 section background styles (pattern, solid, gradient, image) |
| 💾 **Auto-Save** | Changes saved to browser localStorage |
| 📤 **Export/Import** | Backup and restore your settings |
| ↩️ **Undo/Redo** | Mistake-proof editing |
| 🔐 **Password Protected** | Secure access with changeable password |
| 📊 **Built-in CRM** | Track leads with Obsidian.md export support |

### Section Reordering
You can now drag-and-drop sections to change their order on the page:
1. Go to **📐 Sections** tab
2. Drag the **⋮⋮** handle to reorder sections
3. Or use the **▲/▼** arrows to move sections up/down
4. Toggle checkboxes to show/hide sections
5. Click **💾 Save Changes**

## 📊 CRM System (Obsidian Integration)

The website includes a built-in CRM that captures all contact form submissions and exports them as Obsidian-compatible markdown files.

### Lead Capture Fields
- Name, Email, Phone
- Service interested in
- Lead type (Client or Worker)
- Message
- Status tracking (New, Contacted, Qualified, Converted, Lost)

### Obsidian Export Format
Each lead exports as a `.md` file with proper frontmatter for use with the Bases plugin:

```yaml
---
type: lead
name: "John Smith"
email: "john@example.com"
phone: "(555) 123-4567"
service: "Delivery Services"
lead_type: "Client"
status: "New"
date_submitted: 2024-01-15
date_contacted: 
notes: ""
tags:
  - lead
  - hbg
  - client
---
```

### CRM Features
- **Dashboard** - View total leads, clients, workers, and new leads at a glance
- **Filter** - Filter by lead type (Client/Worker) and status
- **Status Updates** - Change lead status with dropdown (auto-sets contact date)
- **Individual Export** - Export single leads to Obsidian `.md` files
- **Bulk Export** - Export all leads at once (individual files or combined)
- **CSV Export** - Export to CSV for spreadsheet use
- **Delete** - Remove leads you no longer need

### Changing the Password
1. Open the Customizer
2. Go to the **⚙️ Settings** tab
3. Enter your current password, then your new password
4. Click "Update Password"

### 🚀 Publishing Changes to GitHub (Making Changes Live)

**Important:** Changes made in the customizer are stored locally in your browser. To make changes visible to ALL visitors, you must publish to GitHub:

1. **Make your changes** in the customizer
2. **Save Changes** (click the 💾 button)
3. Go to **⚙️ Settings** tab
4. Click **📦 Download Files for GitHub**
5. Two files will download:
   - `index.html` - Your updated HTML with embedded settings
   - `settings-backup.json` - Backup of your settings
6. **Upload to GitHub:**
   - Go to your GitHub repository
   - Click on `index.html`
   - Click the ✏️ pencil icon to edit
   - Replace ALL content with your downloaded `index.html`
   - Click **Commit changes**
7. Wait 1-2 minutes for GitHub Pages to update
8. Your changes are now live for everyone! 🎉

**Pro Tip:** Keep the `settings-backup.json` file safe - you can import it later if needed.

### Color Presets
The customizer includes 4 color presets:
- **Original** - Default HBG blue theme
- **Warm** - Orange/terracotta tones
- **Forest** - Green nature theme
- **Purple** - Purple/violet theme

## 🎨 Brand Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Outer Space | `#242e33` | Dark backgrounds, text |
| Green White | `#e8ece3` | Light section backgrounds |
| Shakespeare | `#45b1d9` | Primary accent color |
| Astral | `#347baa` | Secondary accent, gradients |

## 📁 File Structure

```
hbg-website/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Custom CSS styles
├── js/
│   ├── script.js       # Main JavaScript functionality
│   └── customizer.js   # Website Customizer widget
└── README.md           # This file
```

## 🚀 Getting Started

### Option 1: GitHub Pages

1. Fork this repository
2. Go to Settings > Pages
3. Select "main" branch as source
4. Your site will be live at `https://yourusername.github.io/repository-name`

### Option 2: Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hbg-website.git
   ```

2. Open `index.html` in your browser

### Option 3: Deploy to Any Web Host

Simply upload all files to your web hosting provider.

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first CSS framework (via CDN)
- **JavaScript** - Vanilla JS for interactivity
- **Google Fonts** - Poppins font family

## 📱 Sections

1. **Home** - Hero section with call-to-action
2. **About** - Company information and core values
3. **Services** - List of offered services
4. **Join Us** - Career opportunities
5. **Contact** - Contact form and information

## 🔧 Customization

### Updating Colors

Edit the CSS variables in `css/styles.css`:

```css
:root {
    --outer-space: #242e33;
    --green-white: #e8ece3;
    --shakespeare: #45b1d9;
    --astral: #347baa;
}
```

### Adding Form Backend

The contact form in `js/script.js` is ready for backend integration. Replace the console.log with your API call:

```javascript
// Example: Send to your backend
fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
});
```

## 📄 License

© 2024 HBG. All rights reserved.

## 📞 Contact

For inquiries about HBG services, please use the contact form on the website.

---

**"Quality • Friendly • Timely"**
