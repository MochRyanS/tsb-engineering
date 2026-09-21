// Semua gambar diambil dari folder public/images/.
// File di public/ dilayani langsung dari root — contoh:
// public/images/hero/hero.jpg  →  "/images/hero/hero.jpg"

export const IMAGES = {
    // Opsional: isi dengan "/images/hero/hero.mp4" jika ingin video hero (autoplay, muted, loop).
    heroVideo: null as string | null,

    hero: "/images/hero/hero.jpg",

    intro: "/images/engineering/intro.jpg",
    cta: "/images/engineering/cta.jpg",
    login: "/images/engineering/login.jpg",

    divisions: {
        Electrical: "/images/divisions/Electrical.png",
        Mechanical: "/images/divisions/Mechanical.png",
        Civil: "/images/divisions/Civil.png",
        Plumbing: "/images/divisions/Plumbing.png",
    } as Record<string, string>,
};