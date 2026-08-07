import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import type { VeneluxMaterial } from '../types/request';

const CSV_HEADERS = [
  'codigo',
  'material',
  'coduni',
  'nroparte',
  'codbarra',
  'unidad',
  'linea',
  'sublinea',
  'categoria',
  'precio',
  'codart',
  'marca',
  'noparte',
  'imagen1',
  'imagen2',
  'imagen3',
] as const;

const csvEscape = (value: unknown): string => {
  const text = value == null ? '' : String(value);
  const escaped = text.replace(/"/g, '""');
  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
};

const timestamp = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}_${hh}-${min}-${ss}`;
};

export const materialsToCsv = (materials: VeneluxMaterial[]): string => {
  const header = CSV_HEADERS.join(',');
  const rows = materials.map((item) => {
    return CSV_HEADERS.map((key) => csvEscape(item[key])).join(',');
  });

  return [header, ...rows].join('\n');
};

export const exportMaterialsCsv = async (materials: VeneluxMaterial[]): Promise<string> => {
  const csv = materialsToCsv(materials);
  const fileName = `materiales_${timestamp()}.csv`;

  if (Platform.OS === 'web') {
    if (typeof document === 'undefined') {
      throw new Error('No se pudo generar descarga en web');
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    return fileName;
  }

  const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDir) {
    throw new Error('No se encontro directorio de escritura');
  }

  const fileUri = `${baseDir}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      UTI: 'public.comma-separated-values-text',
      dialogTitle: 'Exportar materiales',
    });
  }

  return fileUri;
};
