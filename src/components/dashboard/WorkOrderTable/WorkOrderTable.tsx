import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Check, Copy } from 'lucide-react';
import {
  formatDate,
  statusMetaOf,
  priorityMetaOf,
  type TrackedWorkOrder,
} from '../../../services/workOrderService';
import styles from './WorkOrderTable.module.css';

/* Props toleran: menerima beberapa nama properti yang mungkin dipakai
   halaman lama (MyTasks dll.) supaya tetap kompatibel. */
type TableProps = {
  workOrders?: TrackedWorkOrder[];
  rows?: TrackedWorkOrder[];
  items?: TrackedWorkOrder[];
  data?: TrackedWorkOrder[];
  title?: string;
  emptyLabel?: string;
  [key: string]: unknown;
};

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
}

export default function WorkOrderTable(props: TableProps) {
  const list: TrackedWorkOrder[] =
    props.workOrders ?? props.rows ?? props.items ?? props.data ?? [];
  const emptyLabel = typeof props.emptyLabel === 'string' ? props.emptyLabel : 'Belum ada work order.';
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleCopy(tn: string, id: string) {
    void copyText(tn);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className={styles.wrap}>
      {typeof props.title === 'string' && props.title && (
        <p className={styles.title}>{props.title}</p>
      )}
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NO. TRACKING</th>
              <th>TANGGAL</th>
              <th>PELAPOR</th>
              <th>DEPARTEMENT</th>
              <th>LOKASI</th>
              <th>PIC</th>
              <th>DIVISI</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th className={styles.thAction} aria-label="Detail" />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={10} className={styles.empty}>
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              list.map((w) => {
                const sm = statusMetaOf(w.status);
                const pm = priorityMetaOf(w.priority);
                const tn = w.trackingNumber ? String(w.trackingNumber) : '';
                const key = String(w.id ?? tn);
                return (
                  <tr key={key}>
                    <td>
                      {tn ? (
                        <button
                          type="button"
                          className={styles.tnBtn}
                          onClick={() => handleCopy(tn, key)}
                          title="Klik untuk menyalin nomor tracking"
                        >
                          {copiedId === key ? (
                            <>
                              <Check size={12} /> TERSALIN
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> {tn}
                            </>
                          )}
                        </button>
                      ) : (
                        <span className={styles.tnNone} title="WO lama — dibuat sebelum sistem nomor tracking">
                          —
                        </span>
                      )}
                    </td>
                    <td className={styles.cellDate}>
                      {formatDate(w.createdAt ?? w.reportedAt ?? w.reportDate)}
                    </td>
                    <td>
                      <span className={styles.cellBold}>{String(w.reporterName ?? '—')}</span>
                      <span className={styles.cellSub}>{String(w.reporterPhone ?? '')}</span>
                    </td>
                    <td>{String(w.department ?? '—')}</td>
                    <td className={styles.cellLoc}>{String(w.location ?? '—')}</td>
                    <td>{String(w.pic ?? '—') || '—'}</td>
                    <td>{String(w.division ?? '—')}</td>
                    <td>
                      <span className={`${styles.badge} ${styles['tone' + cap(pm.tone)]}`}>
                        {pm.label}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles['tone' + cap(sm.tone)]}`}>
                        {sm.label}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/dashboard/work-orders/${encodeURIComponent(key)}`}
                        className={styles.eyeBtn}
                        aria-label="Buka detail work order"
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
