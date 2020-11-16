import axios from 'axios'

let axiosInstance = null

const getInstance = () => {
    if(!axiosInstance) {
        let baseURL = ''
        const params = {}

        if(process.env.NODE_ENV === 'development') {
            // baseURL with token query
            baseURL = 'http://localhost:5000/twiliobrowserdialer/us-central1/api'
        }
        else {
            // production
            // update to your api endpoint from your cloud functions
            baseURL = 'http://localhost:5000/twiliobrowserdialer/us-central1/api'
        }

        axiosInstance = axios.create({
            baseURL: baseURL,
            headers: {},
            params
        })

    }

    return axiosInstance
}

export const refreshInstanceHeaders = (token) => {
    //axiosInstance.defaults.headers.common['authorization'] = `Bearer ${token}`
    Object.assign(axiosInstance.defaults, {headers: {authorization: `Bearer ${token}`}});
}

export default getInstance()