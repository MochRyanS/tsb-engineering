import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  Copy,
  Check,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { createWorkOrder, type NewWorkOrderInput } from '../../services/workOrderService';
import styles from './WorkOrder.module.css';

/* ---------- Daftar opsi (sesuai form asli perusahaan) ---------- */

const DEPARTMENT_OPTIONS = [
  'F&B',
  'ENTERTAINMENT',
  'OPERATOR WAHANA',
  'TRANSPORTASI',
  'LIFE SCIENCE',
  'RUMAH PENANGKARAN 2',
  'BABY ZOO',
  'TAMAN BURUNG',
  'PRIMATA',
  'ISTANA PANDA',
  'SAFARI WONDER',
  'KANTIN LOKET',
  'HOTEL / RESORT',
  'LOKET TOLL',
  'FRONT OFFICE',
  'SPBU',
  'ADVENTURE LEADER',
  'SECURITY',
  'CIVIL',
] as const;

const CATEGORY_OPTIONS = [
  'Equipment Restoran',
  'Plumbing',
  'Elektrikal',
  'Mekanikal',
  'General',
  'Civil',
] as const;

/** Pemetaan otomatis: Jenis Temuan -> Divisi engineering yang menangani */
const TEMUAN_DIVISION: Record<string, string> = {
  'Equipment Restoran': 'Mechanical',
  Plumbing: 'Plumbing',
  Elektrikal: 'Electrical',
  Mekanikal: 'Mechanical',
  General: 'Civil',
  Civil: 'Civil',
};

const WORK_TYPE_OPTIONS = ['Project', 'Maintenance'] as const;
const PRIORITY_OPTIONS = ['HIGH', 'MID', 'LOW'] as const;

const PRIORITY_NOTES: Record<string, string> = {
  HIGH: 'Pekerjaan yang harus segera dilaksanakan (berhubungan dengan keselamatan pengunjung/karyawan/satwa).',
  MID: 'Pekerjaan yang penting tetapi tidak mendesak.',
  LOW: 'Pekerjaan yang tidak mendesak, bisa ditunda / tidak berdampak besar.',
};

const MAX_PHOTOS = 5;
const MAX_SIZE_MB = 10;
const PHOTO_MAX_SIDE = 900;
const PHOTO_QUALITY = 0.65;

/* ---------- Util ---------- */

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas tidak didukung');
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', PHOTO_QUALITY);
}

interface PhotoItem {
  url: string;
  name: string;
}

/* ---------- Halaman ---------- */

export default function WorkOrder() {
  const [department, setDepartment] = useState('');
  const [otherDepartment, setOtherDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [category, setCategory] = useState('');
  const [finding, setFinding] = useState('');
  const [reportedAt, setReportedAt] = useState(todayISO());
  const [workType, setWorkType] = useState<string>('Maintenance');
  const [priority, setPriority] = useState('');

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [photoError, setPhotoError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<{ trackingNumber: string; division: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const division = useMemo(() => TEMUAN_DIVISION[category] ?? '', [category]);

  /* ----- foto ----- */
  async function handlePhotoFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setPhotoError('');
    const incoming = Array.from(fileList);
    const accepted: PhotoItem[] = [];
    for (const f of incoming) {
      if (photos.length + accepted.length >= MAX_PHOTOS) {
        setPhotoError(`Maksimal ${MAX_PHOTOS} foto.`);
        break;
      }
      if (!f.type.startsWith('image/')) continue;
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setPhotoError(`"${f.name}" melebihi ${MAX_SIZE_MB}MB — pilih foto lain.`);
        continue;
      }
      try {
        const url = await compressImage(f);
        accepted.push({ url, name: f.name });
      } catch {
        setPhotoError(`"${f.name}" gagal diproses.`);
      }
    }
    if (accepted.length > 0) setPhotos((prev) => [...prev, ...accepted].slice(0, MAX_PHOTOS));
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoError('');
  }

  /* ----- validasi ----- */
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!department) e.department = 'Pilih departement Anda.';
    if (department === 'OTHER' && !otherDepartment.trim()) e.department = 'Tulis nama departement Anda.';
    if (!location.trim()) e.location = 'Lokasi/tempat wajib diisi.';
    if (!reporterName.trim()) e.reporterName = 'Nama pelapor wajib diisi.';
    if (!reporterPhone.trim()) e.reporterPhone = 'Nomor WhatsApp wajib diisi.';
    if (!category) e.category = 'Pilih jenis temuan.';
    if (!finding.trim()) e.finding = 'Tuliskan temuan/alat yang rusak.';
    if (!reportedAt) e.reportedAt = 'Tanggal dilaporkan wajib diisi.';
    if (!workType) e.workType = 'Pilih jenis pekerjaan.';
    if (!priority) e.priority = 'Pilih priority scale.';
    if (photos.length === 0) e.photos = 'Lampirkan minimal 1 foto temuan.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /* ----- kirim ----- */
  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const input: NewWorkOrderInput = {
        department: department === 'OTHER' ? otherDepartment.trim() : department,
        location: location.trim(),
        reporterName: reporterName.trim(),
        reporterPhone: reporterPhone.trim(),
        category,
        division,
        finding: finding.trim(),
        // duplikasi kecil untuk kompatibilitas tampilan halaman detail lama:
        title: finding.trim(),
        description: finding.trim(),
        reportedAt,
        reportDate: reportedAt,
        workType,
        priority,
        photos: photos.map((p) => p.url),
        status: 'New',
      };
      const trackingNumber = await createWorkOrder(input);
      setResult({ trackingNumber, division });
    } catch (err) {
      setSubmitError(
        'Gagal mengirim work order. Periksa koneksi internet Anda, lalu coba lagi. (' +
          String((err as Error)?.message ?? 'unknown') +
          ')'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setDepartment('');
    setOtherDepartment('');
    setLocation('');
    setReporterName('');
    setReporterPhone('');
    setCategory('');
    setFinding('');
    setReportedAt(todayISO());
    setWorkType('Maintenance');
    setPriority('');
    setPhotos([]);
    setErrors({});
    setPhotoError('');
    window.scrollTo({ top: 0 });
  }

  async function copyTracking(text: string) {
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

  const fieldErr = (key: string) =>
    errors[key] ? <p className={styles.errorText}>{errors[key]}</p> : null;

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
          <h1 className={styles.title}>FORM WORK ORDER</h1>
          <p className={styles.desc}>
            Form ini bertujuan untuk mengorganisir pekerjaan dengan lebih terstruktur dan efisien,
            meningkatkan komunikasi, serta memastikan pekerjaan diselesaikan sesuai rencana, waktu,
            dan anggaran.
          </p>
        </header>

        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          {/* DEPARTEMENT */}
          <section className={styles.field}>
            <label className={styles.label}>
              DEPARTEMENT <span className={styles.req}>*</span>
            </label>
            <div className={styles.radioGrid}>
              {DEPARTMENT_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`${styles.radioOpt} ${department === opt ? styles.radioOptOn : ''}`}
                >
                  <input
                    type="radio"
                    name="department"
                    value={opt}
                    checked={department === opt}
                    onChange={() => {
                      setDepartment(opt);
                      setErrors((p) => ({ ...p, department: '' }));
                    }}
                  />
                  <span>{opt}</span>
                </label>
              ))}
              <label className={`${styles.radioOpt} ${department === 'OTHER' ? styles.radioOptOn : ''}`}>
                <input
                  type="radio"
                  name="department"
                  value="OTHER"
                  checked={department === 'OTHER'}
                  onChange={() => setDepartment('OTHER')}
                />
                <span>OTHER</span>
              </label>
            </div>
            {department === 'OTHER' && (
              <input
                className={styles.input}
                style={{ marginTop: 10 }}
                placeholder="Tulis nama departement Anda"
                value={otherDepartment}
                onChange={(e) => setOtherDepartment(e.target.value)}
              />
            )}
            {fieldErr('department')}
          </section>

          {/* LOKASI */}
          <section className={styles.field}>
            <label className={styles.label}>
              LOKASI/TEMPAT <span className={styles.req}>*</span>
            </label>
            <input
              className={styles.input}
              placeholder="Contoh: Coffee shop area wahana"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            {fieldErr('location')}
          </section>

          {/* NAMA PELAPOR */}
          <section className={styles.field}>
            <label className={styles.label}>
              NAMA PELAPOR <span className={styles.req}>*</span>
            </label>
            <input
              className={styles.input}
              placeholder="Nama lengkap pelapor"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
            />
            {fieldErr('reporterName')}
          </section>

          {/* NOMOR WHATSAPP */}
          <section className={styles.field}>
            <label className={styles.label}>
              NOMOR WHATSAPP PELAPOR <span className={styles.req}>*</span>
            </label>
            <input
              className={styles.input}
              type="tel"
              inputMode="numeric"
              placeholder="08xxxxxxxxxx"
              value={reporterPhone}
              onChange={(e) => setReporterPhone(e.target.value)}
            />
            {fieldErr('reporterPhone')}
          </section>

          {/* JENIS TEMUAN */}
          <section className={styles.field}>
            <label className={styles.label}>
              JENIS TEMUAN <span className={styles.req}>*</span>
            </label>
            <div className={styles.radioGrid}>
              {CATEGORY_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`${styles.radioOpt} ${category === opt ? styles.radioOptOn : ''}`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={opt}
                    checked={category === opt}
                    onChange={() => {
                      setCategory(opt);
                      setErrors((p) => ({ ...p, category: '' }));
                    }}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            {category && division && (
              <p className={styles.divisionHint}>→ Ditangani oleh Divisi: <b>{division}</b></p>
            )}
            {fieldErr('category')}
          </section>

          {/* TEMUAN/ALAT YANG RUSAK */}
          <section className={styles.field}>
            <label className={styles.label}>
              TEMUAN/ALAT YANG RUSAK <span className={styles.req}>*</span>
            </label>
            <input
              className={styles.input}
              placeholder="Contoh: Lampu area wahana mati, AC kantor tidak dingin"
              value={finding}
              onChange={(e) => setFinding(e.target.value)}
            />
            {fieldErr('finding')}
          </section>

          {/* TANGGAL */}
          <section className={styles.field}>
            <label className={styles.label}>
              TANGGAL DILAPORKAN <span className={styles.req}>*</span>
            </label>
            <input
              className={styles.input}
              type="date"
              value={reportedAt}
              onChange={(e) => setReportedAt(e.target.value)}
            />
            {fieldErr('reportedAt')}
          </section>

          {/* JENIS PEKERJAAN */}
          <section className={styles.field}>
            <label className={styles.label}>
              JENIS PEKERJAAN <span className={styles.req}>*</span>
            </label>
            <div className={styles.radioRow}>
              {WORK_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`${styles.radioOpt} ${workType === opt ? styles.radioOptOn : ''}`}
                >
                  <input
                    type="radio"
                    name="workType"
                    value={opt}
                    checked={workType === opt}
                    onChange={() => setWorkType(opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            {fieldErr('workType')}
          </section>

          {/* PRIORITY */}
          <section className={styles.field}>
            <label className={styles.label}>
              PRIORITY SCALE (URGENCY) <span className={styles.req}>*</span>
            </label>
            <div className={styles.radioRow}>
              {PRIORITY_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`${styles.radioOpt} ${priority === opt ? styles.radioOptOn : ''}`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={opt}
                    checked={priority === opt}
                    onChange={() => {
                      setPriority(opt);
                      setErrors((p) => ({ ...p, priority: '' }));
                    }}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            <div className={styles.noteBox}>
              {PRIORITY_OPTIONS.map((p) => (
                <p key={p}>
                  <b>{p}</b> — {PRIORITY_NOTES[p]}
                </p>
              ))}
            </div>
            {fieldErr('priority')}
          </section>

          {/* FOTO */}
          <section className={styles.field}>
            <label className={styles.label}>
              FOTO TEMUAN/ALAT YANG RUSAK <span className={styles.req}>*</span>
            </label>
            <p className={styles.hint}>
              Maksimal {MAX_PHOTOS} foto, {MAX_SIZE_MB}MB per foto. Foto otomatis dikompres.
            </p>
            <div className={styles.photoGrid}>
              {photos.map((p, i) => (
                <div key={i} className={styles.photoItem}>
                  <img src={p.url} alt={`Foto temuan ${i + 1}`} />
                  <button type="button" className={styles.photoRemove} onClick={() => removePhoto(i)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className={styles.photoAdd}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      handlePhotoFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <Upload size={20} />
                  <span>TAMBAH FOTO</span>
                  <span className={styles.photoCount}>
                    {photos.length}/{MAX_PHOTOS}
                  </span>
                </label>
              )}
            </div>
            {photoError && <p className={styles.errorText}>{photoError}</p>}
            {fieldErr('photos')}
          </section>

          {/* SUBMIT */}
          {submitError && (
            <div className={styles.submitError}>
              <AlertTriangle size={16} />
              <span>{submitError}</span>
            </div>
          )}
          <div className={styles.actions}>
            <button type="button" className={styles.btnGhost} onClick={resetForm} disabled={submitting}>
              RESET
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className={styles.spin} /> MENGIRIM…
                </>
              ) : (
                'SUBMIT'
              )}
            </button>
          </div>
          <p className={styles.legend}>* Wajib diisi</p>
        </form>
      </motion.div>

      {/* ===== MODAL SUKSES ===== */}
      <AnimatePresence>
        {result && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modalCard}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            >
              <p className={styles.modalThanks}>TERIMA KASIH!</p>
              <p className={styles.modalSub}>Work Order Anda telah kami terima.</p>

              <div className={styles.trackingBox}>
                <p className={styles.trackingLabel}>NO. TRACKING</p>
                <p className={styles.trackingValue}>{result.trackingNumber}</p>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={() => copyTracking(result.trackingNumber)}
                >
                  {copied ? (
                    <>
                      <Check size={14} /> TERSALIN
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> SALIN
                    </>
                  )}
                </button>
              </div>

              {result.division && (
                <p className={styles.modalDivision}>
                  Diteruskan ke Divisi: <b>{result.division}</b>
                </p>
              )}
              <p className={styles.modalHint}>
                Simpan nomor ini untuk <b>melacak status pekerjaan Anda</b> melalui menu{' '}
                <b>TRACKING</b> di website utama.
              </p>

              <div className={styles.modalActions}>
                <Link
                  to={`/tracking?no=${encodeURIComponent(result.trackingNumber)}`}
                  className={styles.btnPrimary}
                  onClick={() => setResult(null)}
                >
                  LACAK STATUS <ArrowRight size={15} />
                </Link>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => {
                    setResult(null);
                    resetForm();
                  }}
                >
                  TUTUP
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
