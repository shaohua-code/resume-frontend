/**
 * 简历字段映射（模板展示用）
 */
import { resolveUploadUrl } from '@/api/upload'
import {
  normalizeEducations,
  normalizeCustomFields,
  buildBasicInfoDisplayItems,
} from '@/constants/resumeFieldSchema'

export function useResumeFields(resume) {
  const r = resume || {}
  const educations = normalizeEducations(r)
  const customFields = normalizeCustomFields(r)

  const fields = {
    name: r.name || '姓名',
    phone: r.phone || '',
    email: r.email || '',
    targetPosition: r.target_position || '',
    school: r.school || educations[0]?.school || '',
    major: r.major || educations[0]?.major || '',
    education: r.education || educations[0]?.degree || '',
    summary: r.summary || '',
    skills: r.skills || [],
    projects: r.projects || [],
    workExperiences: r.work_experiences || [],
    internships: r.internships || [],
    awards: r.awards || [],
    certificates: r.certificates || [],
    avatar: resolveUploadUrl(r.avatar || ''),
    gender: r.gender || '',
    age: r.age || '',
    city: r.city || '',
    origin: r.origin || r.city || '',
    workYears: r.work_years || r.workYears || '',
    maritalStatus: r.marital_status || r.maritalStatus || '',
    height: r.height || '',
    weight: r.weight || '',
    ethnicity: r.ethnicity || '',
    nativePlace: r.native_place || r.nativePlace || r.origin || '',
    politicalStatus: r.political_status || r.politicalStatus || '',
    targetCity: r.target_city || r.targetCity || '',
    expectedSalary: r.expected_salary || r.expectedSalary || r.salary || '',
    entryTime: r.entry_time || r.entryTime || '',
    qrCode: r.qr_code || r.qrCode || '',
    educations,
    customFields,
    contactLine: [r.phone, r.email].filter(Boolean).join('  |  '),
    honorList: [...(r.awards || []), ...(r.certificates || [])],
  }

  fields.basicInfoItems = buildBasicInfoDisplayItems(fields)
  return fields
}
