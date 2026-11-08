import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Copy,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    XCircle,
    FileText,
    Wrench,
    CheckCircle2,
    AlertTriangle,
} from 'lucide-react';
import {
    trackWorkOrder,
    formatTrackingInput,
    statusMetaOf,
    statusStep,
    priorityMetaOf,
    formatDate,
    formatDateTime,
    type TrackedWorkOrder,
} from '../../services/workOrderService';
import styles from './Tracking.module.css';

/* ---------- Galeri foto + lightbox (inline, tanpa dependensi luar) ---------- */

function PhotoGrid({ photos, emptyText }: { photos: string[]; emptyText: string }) {
    const [open, setOpen] = useState<number | null>(null);

    useEffect(() => {
        if (open === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(null);
            if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % photos.length));
            if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, photos.length]);

    if (photos.length === 0) {
        return <p className={styles.photoEmpty}>{emptyText}</p>;
    }

    return (
        <>
            <div className={styles.photoGrid}>
                {photos.map((url, i) => (
                    <button
                        key={i}
                        type="button"
                        className={styles.photoItem}
                        onClick={() => setOpen(i)}
                        aria-label={`Foto ${i + 1}`}
                    >
                        <img src={url} alt={`Foto ${i + 1}`} loading="lazy" />
                    </button>
                ))}
            </div>

            <AnimatePresence>
                {open !== null && (
                    <motion.div
                        className={styles.lightbox}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(null)}
                    >
                        <button
                            type="button"
                            className={styles.lightboxClose}
                            onClick={() => setOpen(null)}
                            aria-label="Tutup"
                        >
                            <X size={22} />
                        </button>
                        {photos.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    className={styles.lightboxNav}
                                    style={{ left: 14 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
                                    }}
                                    aria-label="Sebelumnya"
                                >
                                    <ChevronLeft size={26} />
                                </button>
                                <button
                                    type="button"
                                    className={styles.lightboxNav}
                                    style={{ right: 14 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpen((i) => (i === null ? i : (i + 1) % photos.length));
                                    }}
                                    aria-label="Berikutnya"
                                >
                                    <ChevronRight size={26} />
                                </button>
                            </>
                        )}
                        <motion.img
                            src={photos[open]}
                            alt={`Foto ${open + 1}`}
                            initial={{ scale: 0.94, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <p className={styles.lightboxCount}>
                            {open + 1} / {photos.length}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

/* ---------- Halaman Tracking ---------- */

export default function Tracking() {
    const [searchParams] = useSearchParams();
    const [input, setInput] = useState('');
    const [number, setNumber] = useState('');
    const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'notfound'>('idle');
    const [wo, setWo] = useState<TrackedWorkOrder | null>(null);
    const [copied, setCopied] = useState(false);

    /* prefill dari ?no=... (link dari modal sukses) */
    useEffect(() => {
        const pre = searchParams.get('no');
        if (pre) {
            const norm = formatTrackingInput(pre);
            setInput(norm);
            setNumber(norm);
        }
    }, [searchParams]);

    /* langganan realtime per nomor tracking */
    useEffect(() => {
        if (!number) return;
        setStatus('searching');
        const unsub = trackWorkOrder(
            number,
            (data) => {
                setWo(data);
                setStatus(data ? 'found' : 'notfound');
            },
            () => {
                setWo(null);
                setStatus('notfound');
            }
        );
        return () => unsub();
    }, [number]);

    const submitSearch = useCallback(
        (e?: React.FormEvent) => {
            e?.preventDefault();
            const norm = formatTrackingInput(input);
            if (!norm.trim()) return;
            setNumber(norm);
        },
        [input]
    );

    async function copyText(text: string) {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    }

    const step = wo ? statusStep(wo.status) : 0;
    const sm = wo ? statusMetaOf(wo.status) : null;
    const pm = wo ? priorityMetaOf(wo.priority) : null;

    const beforePhotos: string[] = Array.isArray(wo?.photos) ? (wo?.photos as string[]) : [];
    const afterRaw = (wo?.afterPhotos ?? wo?.photosAfter ?? wo?.after ?? wo?.completionPhotos ?? []) as unknown;
    const afterPhotos: string[] = Array.isArray(afterRaw) ? (afterRaw as string[]) : [];
    const findingText = String(wo?.finding ?? wo?.title ?? wo?.description ?? '') || '—';

    return (
        <div className={styles.page}>
            <motion.div
                className={styles.wrap}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
            >
                <header className={styles.header}>
                    <p className={styles.eyebrow}>ENGINEERING DEPARTMENT</p>
                    <h1 className={styles.title}>LACAK WORK ORDER</h1>
                    <p className={styles.desc}>
                        Masukkan <b>No. Tracking</b> yang Anda terima setelah mengirim form work order untuk
                        melihat status pekerjaan Anda secara <b>real-time</b>.
                    </p>
                </header>

                {/* ===== kotak pencarian ===== */}
                <form className={styles.searchCard} onSubmit={submitSearch}>
                    <label className={styles.searchLabel} htmlFor="tn">
                        NO. TRACKING
                    </label>
                    <div className={styles.searchRow}>
                        <input
                            id="tn"
                            className={styles.searchInput}
                            placeholder="Contoh: WO-261106-7K2F"
                            value={input}
                            onChange={(e) => setInput(e.target.value.toUpperCase())}
                            autoComplete="off"
                            spellCheck={false}
                        />
                        <button type="submit" className={styles.searchBtn} disabled={status === 'searching'}>
                            <Search size={17} />
                            <span>{status === 'searching' ? 'MELACAK…' : 'LACAK'}</span>
                        </button>
                    </div>
                    <p className={styles.searchHint}>
                        Nomor tracking tertera pada layar konfirmasi setelah Anda submit form work order.
                    </p>
                </form>

                {/* ===== tidak ditemukan ===== */}
                {status === 'notfound' && (
                    <motion.div
                        className={styles.notfound}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <AlertTriangle size={22} className={styles.notfoundIcon} />
                        <p className={styles.notfoundTitle}>Nomor tracking tidak ditemukan</p>
                        <ul>
                            <li>Periksa kembali penulisan nomor — huruf besar/kecil tidak berpengaruh.</li>
                            <li>Pastikan formatnya sesuai contoh: WO-261106-7K2F.</li>
                            <li>
                                Nomor hanya dimiliki work order yang dikirim melalui form di website ini. Jika
                                masih belum ketemu, hubungi tim Engineering.
                            </li>
                        </ul>
                    </motion.div>
                )}

                {/* ===== hasil ===== */}
                {status === 'found' && wo && sm && pm && (
                    <motion.div
                        className={styles.result}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                    >
                        {/* baris atas: nomor + live + salin */}
                        <div className={styles.resultTop}>
                            <div>
                                <p className={styles.resultLabel}>NO. TRACKING</p>
                                <p className={styles.resultNumber}>{wo.trackingNumber ?? wo.id}</p>
                            </div>
                            <div className={styles.resultTopRight}>
                                <span className={styles.liveBadge}>
                                    <i className={styles.liveDot} /> REALTIME
                                </span>
                                <button type="button" className={styles.copyBtn} onClick={() => copyText(String(wo.trackingNumber ?? wo.id))}>
                                    {copied ? (
                                        <>
                                            <Check size={13} /> TERSALIN
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={13} /> SALIN
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* status + stepper */}
                        <div className={styles.resultStatus}>
                            <span className={`${styles.badge} ${styles['tone' + cap(sm.tone)]}`}>{sm.label}</span>
                            {wo.pic && <span className={styles.pic}>PIC: {String(wo.pic)}</span>}
                        </div>

                        {step === -1 ? (
                            <div className={styles.cancelBanner}>
                                <XCircle size={18} />
                                <span>Work order ini telah dibatalkan.</span>
                            </div>
                        ) : (
                            <div className={styles.stepper}>
                                <Step icon={<FileText size={18} />} label="DILAPORKAN" state={step >= 1 ? 'done' : 'idle'} />
                                <span className={`${styles.stepLine} ${step >= 2 ? styles.stepLineOn : ''}`} />
                                <Step icon={<Wrench size={18} />} label="DIPROSES" state={step >= 2 ? 'done' : 'idle'} />
                                <span className={`${styles.stepLine} ${step >= 3 ? styles.stepLineOn : ''}`} />
                                <Step icon={<CheckCircle2 size={18} />} label="SELESAI" state={step >= 3 ? 'done' : 'idle'} />
                            </div>
                        )}

                        {/* info grid */}
                        <div className={styles.infoGrid}>
                            <Info label="TANGGAL DILAPORKAN" value={formatDate(wo.reportedAt ?? wo.reportDate)} />
                            <Info label="DEPARTEMENT" value={String(wo.department || '—')} />
                            <Info label="LOKASI/TEMPAT" value={String(wo.location || '—')} />
                            <Info label="JENIS TEMUAN" value={String(wo.category || '—')} />
                            <Info label="DIVISI PENANGANAN" value={String(wo.division || '—')} />
                            <Info label="JENIS PEKERJAAN" value={String(wo.workType || '—')} />
                            <Info label="PRIORITY" value={pm.label} highlight={pm.tone} />
                            <Info label="PELAPOR" value={String(wo.reporterName || '—')} />
                            <Info label="NO. WHATSAPP" value={String(wo.reporterPhone || '—')} />
                            <Info label="TEMUAN/ALAT YANG RUSAK" value={findingText} wide />
                        </div>

                        {/* timeline */}
                        {Array.isArray(wo.timeline) && (wo.timeline as { status: string; at: unknown }[]).length > 0 && (
                            <div className={styles.timelineBox}>
                                <p className={styles.boxTitle}>RIWAYAT STATUS</p>
                                <ul className={styles.timeline}>
                                    {(wo.timeline as { status: string; at: unknown }[])
                                        .slice()
                                        .reverse()
                                        .map((t, i) => (
                                            <li key={i}>
                                                <span className={styles.timelineDot} />
                                                <span className={styles.timelineStatus}>{statusMetaOf(t.status).label}</span>
                                                <span className={styles.timelineAt}>{formatDateTime(t.at)}</span>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}

                        {/* foto before/after */}
                        <div className={styles.photosWrap}>
                            <div className={styles.photoSection}>
                                <p className={styles.boxTitle}>FOTO TEMUAN</p>
                                <PhotoGrid photos={beforePhotos} emptyText="Tidak ada foto temuan." />
                            </div>
                            <div className={styles.photoSection}>
                                <p className={styles.boxTitle}>FOTO SETELAH PEKERJAAN</p>
                                <PhotoGrid
                                    photos={afterPhotos}
                                    emptyText={
                                        statusStep(wo.status) === 3
                                            ? 'Foto setelah pekerjaan belum ditambahkan.'
                                            : 'Foto setelah pekerjaan akan muncul di sini setelah selesai.'
                                    }
                                />
                            </div>
                        </div>

                        <p className={styles.resultFoot}>
                            Dibuat: {formatDate(wo.createdAt)}
                            {wo.updatedAt ? ` · Terakhir diperbarui: ${formatDateTime(wo.updatedAt)}` : ''}
                        </p>
                        <p className={styles.resultLiveNote}>
                            Halaman ini diperbarui secara real-time — status akan berubah otomatis tanpa perlu
                            memuat ulang.
                        </p>
                    </motion.div>
                )}

                {/* ===== idle hint ===== */}
                {status === 'idle' && (
                    <div className={styles.idleCard}>
                        <p className={styles.idleTitle}>Belum ada nomor yang dilacak</p>
                        <p className={styles.idleText}>
                            Masukkan nomor tracking di atas, contoh: <b>WO-261106-7K2F</b>, lalu tekan{' '}
                            <b>LACAK</b>.
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function cap(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function Step({
    icon,
    label,
    state,
}: {
    icon: React.ReactNode;
    label: string;
    state: 'done' | 'idle';
}) {
    return (
        <div className={styles.step}>
            <span className={`${styles.stepIcon} ${state === 'done' ? styles.stepIconOn : ''}`}>{icon}</span>
            <span className={`${styles.stepLabel} ${state === 'done' ? styles.stepLabelOn : ''}`}>{label}</span>
        </div>
    );
}

function Info({
    label,
    value,
    wide,
    highlight,
}: {
    label: string;
    value: string;
    wide?: boolean;
    highlight?: string;
}) {
    return (
        <div className={`${styles.infoItem} ${wide ? styles.infoWide : ''}`}>
            <p className={styles.infoLabel}>{label}</p>
            {highlight ? (
                <span className={`${styles.badge} ${styles['tone' + cap(highlight)]} ${styles.badgeSm}`}>{value}</span>
            ) : (
                <p className={styles.infoValue}>{value}</p>
            )}
        </div>
    );
}