export function formatDate(iso?: string): string {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
export function formatDateTime(iso?: string): string {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
export function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${Math.max(mins, 1)} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} hari lalu`;
    return formatDate(iso);
}
export function hoursBetween(a: string, b: string): number {
    return Math.max((new Date(b).getTime() - new Date(a).getTime()) / 3600000, 0);
}
export function daysBetween(a: string, b: string): number {
    return Math.max((new Date(b).getTime() - new Date(a).getTime()) / 86400000, 0);
}
export function formatDuration(hours: number): string {
    if (hours < 1) return "kurang dari 1 jam";
    if (hours < 24) return `${hours.toFixed(0)} jam`;
    return `${(hours / 24).toFixed(1)} hari`;
}
export function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Gagal membaca file"));
        reader.readAsDataURL(file);
    });
}