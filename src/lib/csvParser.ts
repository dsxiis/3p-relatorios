import Papa from 'papaparse'

export function parseCsvFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data)
      },
      error: (error) => {
        reject(new Error(`CSV parse error: ${error.message}`))
      },
    })
  })
}

export function parseCsvString(content: string): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
  })
  return result.data
}
