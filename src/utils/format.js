const numberFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

export const formatMontant = (value) => numberFormat.format(Number(value || 0));

export const formatDate = (value) =>
  value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString("fr-FR") : "-";

export const formatDateTime = (value) => (value ? new Date(value).toLocaleString("fr-FR") : "-");

export const formatSize = (bytes) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
