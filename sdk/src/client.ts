// API Client for DiviLauncher SDK

import { SDKError, SDKConfig } from './types'

export class APIClient {
  private baseUrl: string
  private timeout: number

  constructor(config: SDKConfig) {
    this.baseUrl = config.apiUrl.replace(/\/$/, '') // Remove trailing slash
    this.timeout = config.timeout || 30000 // 30 seconds default
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new SDKError(
          data.error || 'API request failed',
          response.status,
          data.details
        )
      }

      return data as T
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof SDKError) {
        throw error
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new SDKError('Request timeout', 408)
      }

      throw new SDKError(
        error instanceof Error ? error.message : 'Network error',
        0,
        error
      )
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

