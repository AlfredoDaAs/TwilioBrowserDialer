import store from './store'

export const handleError = (error, comp, variant) =>  {
    if(error.response && error.response.status === 403) {
        // do logout
        store.dispatch('logout')
    }
    else {
        // toast message
        comp.$bvToast.toast(error.message, {
            title: 'Message',
            variant: variant,
            autoHideDelay: 5000,
            solid: true,
            appendToast: true,
            toaster: 'b-toaster-top-right'
          })
    }
}