/**
 * HBG Website Settings
 * 
 * This file will be generated/updated when you export from the Website Customizer.
 * 
 * How to update:
 * 1. Open the website
 * 2. Access customizer: Ctrl+Shift+A or triple-click footer logo
 * 3. Make your changes
 * 4. Go to Settings tab → Download Files for GitHub
 * 5. Upload the new settings.js to replace this file
 */

window.HBG_EMBEDDED_SETTINGS = {
    // === COLORS ===
    colors: {
        outerSpace: "#242e33",
        greenWhite: "#e8ece3",
        shakespeare: "#45b1d9",
        astral: "#347baa"
    },

    // === FONTS ===
    fonts: {
        primary: "Poppins",
        headingWeight: "800",
        bodyWeight: "400"
    },

    // === SECTIONS VISIBILITY ===
    sections: {
        home: true,
        about: true,
        services: true,
        careers: true,
        contact: true,
        team: true
    },

    // === SECTION ORDER ===
    sectionOrder: ["home", "about", "services", "careers", "contact", "team"],

    // === SECTION BACKGROUNDS ===
    backgrounds: {
        home: "pattern",
        about: "dark",
        services: "light",
        careers: "dark",
        contact: "light",
        team: "dark"
    },

    // === TEXT CONTENT ===
    text: {},

    // === SERVICES ===
    services: [
        {
            id: "delivery",
            name: "Delivery Services",
            description: "Fast, reliable delivery through platforms like DoorDash, Instacart, Uber Eats, GrubHub, Veho, Roadie, and more. Your packages and meals arrive on time, every time.",
            icon: "truck",
            enabled: true
        },
        {
            id: "interpreting",
            name: "Sign Language Interpreting",
            description: "Professional ASL interpretation services that bridge communication gaps. Experienced, certified, and committed to facilitating clear, meaningful connections.",
            icon: "chat",
            enabled: true
        },
        {
            id: "warehouse",
            name: "Warehouse Shifts",
            description: "Dependable warehouse support when you need it. From inventory management to order fulfillment, we bring energy and efficiency to your operations.",
            icon: "warehouse",
            enabled: true
        },
        {
            id: "driving",
            name: "Driving Services",
            description: "Professional driving for various needs. Whether it's transporting goods or providing rideshare services, count on safe, courteous, and timely transportation.",
            icon: "car",
            enabled: true
        },
        {
            id: "retail",
            name: "Retail Support",
            description: "Flexible retail staffing solutions for your store. Friendly, customer-focused support that represents your brand with professionalism and care.",
            icon: "retail",
            enabled: true
        },
        {
            id: "other",
            name: "And More",
            description: "Have a unique need? Let's talk! With three decades of diverse experience, we're adaptable and ready to tackle new challenges. Just ask.",
            icon: "more",
            enabled: true
        }
    ],

    // === TEAM MEMBERS ===
    team: [],

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
        window.HBG_EMBEDDED_SETTINGS.team.forEach(function(member) {
            if (window.HBG_IMAGES.teamPhotos[member.id]) {
                member.photo = window.HBG_IMAGES.teamPhotos[member.id];
            }
        });
    }
}
