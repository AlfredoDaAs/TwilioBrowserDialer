import store from './store'

export const handleError = (error, comp, variant) =>  {
    if(error.response && error.response.status === 403) {
        // do logout
        store.dispatch('logout')
    }
    else {
        // toast message
        let message = ''
        if(error.response && error.response.status === 500) {
            message = error.response.data.error
        }
        else {
            message = error.message
        }

        comp.$bvToast.toast(message, {
            title: 'Message',
            variant: variant,
            autoHideDelay: 5000,
            solid: true,
            appendToast: true,
            toaster: 'b-toaster-top-right'
          })
    }
}