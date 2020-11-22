import axios from 'axios'

let axiosInstance = null

const getInstance = () => {
    if(!axiosInstance) {
        const params = {}

        axiosInstance = axios.create({
            baseURL: process.env.VUE_APP_BASIC_URL,
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