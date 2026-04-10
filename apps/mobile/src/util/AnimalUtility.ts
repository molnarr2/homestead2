import { differenceInDays, differenceInMonths, parseISO } from 'date-fns'

export interface AnimalAge {
  display: string
  totalDays: number
}

export function calculateAnimalAge(birthday: string): AnimalAge {
  if (!birthday) return { display: '', totalDays: 0 }

  const birthDate = parseISO(birthday)
  const now = new Date()
  const totalDays = differenceInDays(now, birthDate)

  if (totalDays < 0) return { display: '', totalDays: 0 }

  if (totalDays < 30) {
    return { display: `${totalDays} day${totalDays !== 1 ? 's' : ''}`, totalDays }
  }

  const months = differenceInMonths(now, birthDate)
  if (months < 12) {
    return { display: `${months} month${months !== 1 ? 's' : ''}`, totalDays }
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  const parts = [`${years} year${years !== 1 ? 's' : ''}`]
  if (remainingMonths > 0) {
    parts.push(`${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`)
  }
  return { display: parts.join(' '), totalDays }
}
