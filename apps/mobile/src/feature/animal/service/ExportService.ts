import type IExportService from './IExportService'
import type { ExportData } from './IExportService'
import { type IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import {
  buildCompleteRecordHtml,
  buildHealthCareSummaryHtml,
  buildBreedingLineageReportHtml,
} from './ExportHtmlBuilder'
import RNHTMLtoPDF from 'react-native-html-to-pdf'
import Share from 'react-native-share'

export default class ExportService implements IExportService {
  private async fetchPhotoBase64(url: string): Promise<string | undefined> {
    if (!url) return undefined
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeout)
      const blob = await response.blob()
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch {
      return undefined
    }
  }

  private async generateAndShare(html: string, fileName: string): Promise<IResult> {
    try {
      const file = await RNHTMLtoPDF.convert({
        html,
        fileName,
        directory: 'Documents',
      })

      if (!file.filePath) return ErrorResult('Failed to generate PDF')

      await Share.open({
        url: `file://${file.filePath}`,
        type: 'application/pdf',
        filename: `${fileName}.pdf`,
      })

      return SuccessResult
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      if (message.includes('User did not share') || message.includes('cancelled')) {
        return SuccessResult
      }
      return ErrorResult(message)
    }
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[\/\\:*?"<>|]/g, '_')
  }

  async exportCompleteRecord(data: ExportData): Promise<IResult> {
    const photoBase64 = await this.fetchPhotoBase64(data.animal.photoUrl)
    const html = buildCompleteRecordHtml({ ...data, photoBase64 })
    return this.generateAndShare(html, `${this.sanitizeFileName(data.animal.name)}-complete-record`)
  }

  async exportHealthCareSummary(data: ExportData): Promise<IResult> {
    const photoBase64 = await this.fetchPhotoBase64(data.animal.photoUrl)
    const html = buildHealthCareSummaryHtml({ ...data, photoBase64 })
    return this.generateAndShare(html, `${this.sanitizeFileName(data.animal.name)}-health-care-summary`)
  }

  async exportBreedingLineageReport(data: ExportData): Promise<IResult> {
    const photoBase64 = await this.fetchPhotoBase64(data.animal.photoUrl)
    const html = buildBreedingLineageReportHtml({ ...data, photoBase64 })
    return this.generateAndShare(html, `${this.sanitizeFileName(data.animal.name)}-breeding-lineage`)
  }

}
