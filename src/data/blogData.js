import portraitImg from '../assets/blog_pencil_portrait.png';
import releaseImg from '../assets/recent_release_portrait.png';

export const BLOG_POSTS = [
    {
        id: 'evolution-of-pencil-portraits',
        category: 'Art History',
        title: 'The Evolution of Pencil Portraits',
        excerpt: 'Explore how graphite became the primary tool for master portraitists throughout the centuries.',
        content: `
            <h3>The Silent Genesis</h3>
            <p>Graphite, in its purest form, has a history as deep and layered as the portraits it creates. From the initial discovery of large graphite deposits in Borrowdale, England, during the 16th century, to the refined, chemically balanced pencils of the modern era, this medium has been the architect of human expression.</p>
            
            <h3>Masters of the Grey Scale</h3>
            <p>In this deep dive, we look at how masters like Jean-Auguste-Dominique Ingres utilized the subtle range of graphite to create works that remain as vibrant today as they were centuries ago. Ingres didn't just draw; he sculpted with lines, using varying pressures to indicate volume and light without the need for heavy shading.</p>
            
            <h3>The Modern Graphite Soul</h3>
            <p>Today, the pencil remains the most accessible yet most challenging tool for an artist. It is an extension of the soul, capturing the split-second emotional shift in a subject's gaze with a fidelity that camera lenses often miss.</p>
        `,
        image: portraitImg,
        featured: true,
        date: 'October 12, 2025',
        tags: ['#graphite', '#history', '#portrait'],
        comments: [
            { id: 1, author: 'Julian Vane', date: 'Oct 14, 2025', text: 'This perspective on Ingres is fascinating. The "sculpting with lines" analogy perfectly captures the weight of his work.' },
            { id: 2, author: 'Elena Rossi', date: 'Oct 15, 2025', text: 'Absolutely love the details here. Graphite really is the most honest medium.' }
        ]
    },
    {
        id: 'mastering-charcoal-shading',
        category: 'Technique',
        title: 'Mastering Charcoal Shading',
        excerpt: 'Secrets to creating depth and texture using traditional charcoal techniques in modern art.',
        content: `
            <h3>Embracing the Void</h3>
            <p>Charcoal is perhaps the most primitive and powerful medium available to a portrait artist. It demands respect and bold movements. To master charcoal is to master the light and shadow themselves.</p>

            <h3>The Willow and The Compressed</h3>
            <p>We explore the physical nature of willow and compressed charcoal. While willow offers a feather-light touch for initial sketches, compressed charcoal provides the deep, obsidian blacks that give a portrait its "weight." Understanding when to switch between them is the hallmark of a master craftsman.</p>
            
            <h3>Texture as Narrative</h3>
            <p>Whether you are a beginner or a seasoned professional, the raw energy of charcoal is a journey worth taking. Using the tooth of the paper to capture light is not just a technique; it's a way of telling the subject's story through the very fabric of the artwork.</p>
        `,
        image: 'https://images.unsplash.com/photo-1513364235703-91f57b7f615c?auto=format&fit=crop&q=80&w=1200',
        date: 'October 8, 2025',
        tags: ['#charcoal', '#technique', '#shading'],
        comments: [
            { id: 1, author: 'Marcus Thorne', date: 'Oct 10, 2025', text: 'Mastering the transition between willow and compressed charcoal changed everything for me. Great write-up!' }
        ]
    },
    {
        id: 'emotional-resonance-in-eyes',
        category: 'Portraits',
        title: 'Emotional Resonance in Eyes',
        excerpt: 'Why the eyes are the most critical element in capturing the soul of a portrait subject.',
        content: `
            <h3>The Gaze of Truth</h3>
            <p>They say the eyes are the windows to the soul, and in portraiture, this is an absolute truth. A millimeter of difference in the iris or a slight softening of the eyelid can change the entire emotional narrative of a piece.</p>

            <h3>Anatomy of Reflection</h3>
            <p>This article breaks down the anatomy of an emotional gaze. We discuss the use of "catchlights"—those tiny sparks of white that indicate a source of light—and how they serve to anchor the viewer's attention to the subject's inner thoughts.</p>
            
            <h3>Beyond the Surface</h3>
            <p>The subtle textures of the sclera and the intricate patterns of the iris make a drawn eye feel as though it is watching you back. It is here that the artist transitions from mere illustrator to a chronicler of human experience.</p>
        `,
        image: 'https://images.unsplash.com/photo-1544212513-cf6347913360?auto=format&fit=crop&q=80&w=1200',
        date: 'October 5, 2025',
        tags: ['#eyes', '#portrait', '#soul'],
        comments: []
    },
    {
        id: 'aged-wisdom-collection',
        category: 'Recent Release',
        title: 'The "Aged Wisdom" Collection',
        excerpt: 'A powerful series of portraits celebrating the stories written in time.',
        content: `
            <h3>Chronicles of a Lifetime</h3>
            <p>Our latest release, the "Aged Wisdom" series, focuses on the character and depth found in the faces of those who have seen the world change. Every wrinkle is a sentence, every gray hair a chapter.</p>

            <h3>The Aesthetic of Experience</h3>
            <p>This collection utilizes a high-contrast charcoal style to emphasize the rugged beauty of experience. The interplay of bone structure and weathered skin creates a landscape that is both beautiful and haunting.</p>
            
            <h3>A Tribute to Endurance</h3>
            <p>It is a tribute to endurance and the silent strength of the human spirit. "Aged Wisdom" isn't just a gallery; it's a testament to the resilience of those who have walked long paths and lived to tell their tales through silence.</p>
        `,
        image: releaseImg,
        isRelease: true,
        date: 'November 1, 2025',
        tags: ['#newrelease', '#collection', '#wisdom'],
        comments: [
            { id: 1, author: 'Sophia G.', date: 'Nov 2, 2025', text: 'This collection is deeply moving. The technical execution on the weathered skin is masterful.' }
        ]
    }
];
