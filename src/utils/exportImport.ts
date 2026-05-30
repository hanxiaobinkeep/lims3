export interface ExportColumn {
  key: string;
  title: string;
  width?: number;
}

export const exportToExcel = (data: any[], columns: ExportColumn[], filename: string) => {
  const headers = columns.map(col => col.title);
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key];
      return value !== undefined && value !== null ? String(value) : '';
    })
  );

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data: any[], filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const parseCSV = (csvText: string): any[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    data.push(row);
  }

  return data;
};

export const importFromFile = (): Promise<{ data: any[]; filename: string }> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.json,.xlsx';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('未选择文件'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const filename = file.name;

          if (file.name.endsWith('.json')) {
            const data = JSON.parse(content);
            resolve({ data: Array.isArray(data) ? data : [data], filename });
          } else if (file.name.endsWith('.csv')) {
            const data = parseCSV(content);
            resolve({ data, filename });
          } else {
            reject(new Error('不支持的文件格式'));
          }
        } catch (error) {
          reject(new Error('文件解析失败'));
        }
      };

      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    };

    input.click();
  });
};
