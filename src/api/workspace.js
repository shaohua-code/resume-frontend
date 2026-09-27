import request from '@/utils/request'

export async function getWorkspaceSummary() {
  const response = await request.get('/workspace/summary', { suppressGlobalErrorMessage: true })
  return response?.data || response
}

export async function getOnboardingState() {
  const response = await request.get('/workspace/onboarding', { suppressGlobalErrorMessage: true })
  return response?.data || response
}

export async function updateOnboardingState(payload) {
  const response = await request.patch('/workspace/onboarding', payload)
  return response?.data || response
}
