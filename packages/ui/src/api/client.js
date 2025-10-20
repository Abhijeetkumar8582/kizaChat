import axios from 'axios'
import { baseURL, ErrorMessage } from '@/store/constant'
import AuthUtils from '@/utils/authUtils'

const apiClient = axios.create({
    baseURL: `${baseURL}/api/v1`,
    headers: {
        'Content-type': 'application/json',
        'x-request-from': 'internal'
    },
    withCredentials: true
})

// Request interceptor for debugging
apiClient.interceptors.request.use(
    function (config) {
        // Log request for agentic endpoints
        if (config.url && config.url.includes('/agentic/')) {
            console.log('🔵 AXIOS REQUEST INTERCEPTOR')
            console.log('URL:', config.baseURL + config.url)
            console.log('Method:', config.method?.toUpperCase())
            console.log('Headers:', JSON.stringify(config.headers, null, 2))
            console.log('Request Body:', JSON.stringify(config.data, null, 2))
            console.log('=' .repeat(80))
        }
        return config
    },
    function (error) {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
    }
)

apiClient.interceptors.response.use(
    function (response) {
        // Log response for agentic endpoints
        if (response.config.url && response.config.url.includes('/agentic/')) {
            console.log('🟢 AXIOS RESPONSE INTERCEPTOR')
            console.log('URL:', response.config.url)
            console.log('Status:', response.status, response.statusText)
            console.log('Response Headers:', JSON.stringify(response.headers, null, 2))
            console.log('Response Data (stringified):', JSON.stringify(response.data, null, 2))
            console.log('=' .repeat(80))
        }
        return response
    },
    async (error) => {
        if (error.response.status === 401) {
            // check if refresh is needed
            if (error.response.data.message === ErrorMessage.TOKEN_EXPIRED && error.response.data.retry === true) {
                const originalRequest = error.config
                // call api to get new token
                const response = await axios.post(`${baseURL}/api/v1/auth/refreshToken`, {}, { withCredentials: true })
                if (response.data.id) {
                    // retry the original request
                    return apiClient.request(originalRequest)
                }
            }
            localStorage.removeItem('username')
            localStorage.removeItem('password')
            AuthUtils.removeCurrentUser()
        }

        return Promise.reject(error)
    }
)

export default apiClient
