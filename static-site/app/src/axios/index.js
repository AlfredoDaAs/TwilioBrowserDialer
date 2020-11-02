import axios from 'axios'

let axiosInstance = null

// this is required because axios 0.19.* it's not merging params from create instance and the request params
// if the bug is fixed this could be removed and uncomment line 25
export const basicParams = () => {
    const params = {}

    if(process.env.NODE_ENV === 'development') {
        params['token'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYml0IiwiaWF0IjoxNTg2MzAwMjI4LCJleHAiOjE3NDQwODgyMjh9.MvdFZ254l5NQHdGx4mVUCnnV8r_wMUh9W01MZfZgHAE'
    }

    return params
}

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

export default getInstance()